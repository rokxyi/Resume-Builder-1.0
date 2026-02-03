import os
import logging
from typing import Dict, Optional, Any
import google.generativeai as genai
from dataclasses import dataclass
from config import settings

logger = logging.getLogger(__name__)

@dataclass
class UserMessage:
    text: str

class LlmChat:
    """Simple chat wrapper for LLM providers."""

    def __init__(self, api_key: str, session_id: str, system_message: str):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.provider = None
        self.model_name = None

    def with_model(self, provider: str, model_name: str):
        self.provider = provider
        self.model_name = model_name
        return self

    async def send_message(self, user_message: UserMessage) -> str:
        if self.provider == "perplexity":
            if not self.api_key:
                raise ValueError("LLM_API_KEY is not configured")
            
            from openai import OpenAI
            
            client = OpenAI(
                api_key=self.api_key,
                base_url="https://api.perplexity.ai"
            )
            
            try:
                response = client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": self.system_message},
                        {"role": "user", "content": user_message.text}
                    ]
                )
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"Perplexity API error: {e}")
                raise

        # Legacy Gemini implementation
        if self.provider == "gemini":
            if not self.api_key:
                raise ValueError("LLM_API_KEY is not configured")
            
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=self.system_message
            )
            
            from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type, before_sleep_log
            import google.api_core.exceptions
            
            # Define retry strategy for Rate Limits (429)
            @retry(
                retry=retry_if_exception_type(google.api_core.exceptions.ResourceExhausted),
                wait=wait_exponential(multiplier=2, min=4, max=60),
                stop=stop_after_attempt(5),
                before_sleep=before_sleep_log(logger, logging.INFO)
            )
            def generate_with_retry(text):
                logger.info("Sending request to Gemini API...")
                return model.generate_content(text)

            try:
                # Use generating content with retry
                response = generate_with_retry(user_message.text)
                return response.text if hasattr(response, "text") else str(response)
            except Exception as e:
                logger.error(f"Gemini API error after retries: {e}")
                raise

        raise NotImplementedError(f"Provider '{self.provider}' is not supported in this setup")


class LLMService:
    """Service for interacting with various LLM providers"""
    
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        if not self.api_key:
            import warnings
            warnings.warn("LLM_API_KEY not configured - AI features will be limited")
    
    async def analyze_and_generate_resume(
        self,
        job_description: str,
        base_resumes: list,
        model_id: str,
        session_id: str,
        formatting_preference: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze job description and resumes, then generate tailored resume content
        """
        
        # Get model configuration from settings
        try:
            model_config = settings.get_model_config(model_id)
        except ValueError as e:
            logger.error(str(e))
            raise
        
        # Create system message
        system_message = """You are an expert resume writer and career consultant specializing in creating highly tailored, ATS-optimized resumes. 
Your task is to:
1. Analyze the job description deeply to extract keywords, requirements, and priorities
2. Review the candidate's resume(s) to identify relevant experience
3. Create a tailored resume that maximizes interview chances while maintaining professional standards

Focus on:
- ATS optimization with exact keyword matching
- Strategic reframing of experience to match job requirements
- Quantified achievements wherever possible
- Professional formatting and structure
- Clear, impactful bullet points using strong action verbs"""

        # Initialize LLM chat
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model(model_config.provider, model_config.api_model_name)
        
        # Prepare the analysis prompt
        resume_texts = "\n\n---RESUME SEPARATOR---\n\n".join(base_resumes)
        
        prompt = f"""Please analyze this job posting and create a highly tailored resume.

JOB DESCRIPTION:
{job_description}

CANDIDATE'S BASE RESUME(S):
{resume_texts}

{f'FORMATTING PREFERENCE: {formatting_preference}' if formatting_preference else ''}

Please provide a comprehensive analysis and generate a tailored resume in the following JSON format:

{{
  "analysis": {{
    "job_keywords": ["list of critical keywords from job description"],
    "required_qualifications": ["must-have qualifications"],
    "preferred_qualifications": ["nice-to-have qualifications"],
    "candidate_strengths": ["candidate's matching strengths"],
    "gaps": ["areas where candidate lacks direct experience"],
    "tailoring_strategy": "Brief explanation of how resume was tailored"
  }},
  "resume": {{
    "name": "Candidate Full Name",
    "contact": {{
      "email": "email@example.com",
      "phone": "phone number",
      "location": "City, State",
      "linkedin": "LinkedIn URL if available"
    }},
    "professional_summary": "3-5 line professional summary with keywords",
    "core_competencies": {{
      "Technical Domain Expertise": ["keyword1", "keyword2"],
      "Engineering Methodologies": ["keyword3", "keyword4"],
      "Analysis Tools": ["tool1", "tool2"],
      "Project Management": ["skill1", "skill2"]
    }},
    "experience": [
      {{
        "company": "Company Name",
        "location": "City, State",
        "title": "Job Title",
        "start_date": "MM/YYYY",
        "end_date": "MM/YYYY or Present",
        "bullets": ["Bullet point 1", "Bullet point 2"]
      }}
    ],
    "education": [
      {{
        "degree": "Degree Name",
        "field": "Field of Study",
        "university": "University Name",
        "location": "City, State",
        "graduation_date": "MM/YYYY",
        "gpa": "X.XX/4.0 (if >3.5)",
        "coursework": ["Course 1", "Course 2"]
      }}
    ],
    "certifications": ["Certification 1", "Certification 2"],
    "skills": ["Additional skills not covered above"]
  }}
}}

Ensure the resume is ATS-optimized with exact keyword matches from the job description."""

        # Send message and get response
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "raw_response": response,
            "model_used": model_id
        }
