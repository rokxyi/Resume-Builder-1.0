import asyncio
import json
from typing import Optional

class UserMessage:
    def __init__(self, text: str):
        self.text = text

class LlmChat:
    """A minimal stub that returns a properly formatted response for resume generation.

    In production, this would call real LLM APIs (Google Gemini, OpenAI, Anthropic).
    For now, it returns a stub response that matches the expected JSON structure.
    """
    def __init__(self, api_key: Optional[str]=None, session_id: Optional[str]=None, system_message: Optional[str]=None):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.provider = None
        self.model = None

    def with_model(self, provider: str, model: str):
        self.provider = provider
        self.model = model
        return self

    async def send_message(self, user_message: UserMessage):
        """Simulate an LLM response with proper JSON structure."""
        await asyncio.sleep(0.1)  # simulate latency
        
        # Return a properly formatted stub response as a JSON string
        # This matches what the backend expects to parse
        stub_response = {
            "analysis": {
                "job_keywords": ["suspension", "engineering", "development", "cost", "weight"],
                "required_qualifications": ["Bachelor's degree in Engineering", "5+ years experience", "CAD proficiency"],
                "preferred_qualifications": ["CATIA experience", "Project management", "Team leadership"],
                "candidate_strengths": ["Strong technical background", "Multi-team collaboration", "Program management experience"],
                "gaps": ["Specific suspension system experience"],
                "tailoring_strategy": "Emphasized cross-functional teamwork and technical project management skills to align with role requirements."
            },
            "resume": {
                "name": "Rohit Sharma",
                "contact": {
                    "email": "rohit.sharma@email.com",
                    "phone": "+1-XXX-XXX-XXXX",
                    "location": "Michigan",
                    "linkedin": "linkedin.com/in/rohitsharms"
                },
                "professional_summary": "Results-driven engineering professional with 7+ years of experience in product development and cross-functional team management. Proven expertise in cost optimization and technical delivery of complex systems. Seeking to leverage suspension engineering experience at Ford Motor Company.",
                "core_competencies": {
                    "Technical Domain Expertise": ["Suspension Systems", "Vehicle Dynamics", "CAD Design", "CATIA"],
                    "Engineering Methodologies": ["Design for Manufacturing", "Systems Engineering", "Root Cause Analysis"],
                    "Analysis Tools": ["MATLAB", "Simulation Tools", "Technical Documentation"],
                    "Project Management": ["Cross-functional Leadership", "Program Delivery", "Stakeholder Management"]
                },
                "experience": [
                    {
                        "company": "Previous Company",
                        "location": "Michigan",
                        "title": "Senior Product Engineer",
                        "start_date": "01/2020",
                        "end_date": "Present",
                        "bullets": [
                            "Led suspension component development project achieving 15% weight reduction while maintaining performance standards",
                            "Collaborated with cross-functional teams (Body, CSE, Vehicle Engineering) to integrate suspension solutions",
                            "Managed supplier technical reviews ensuring component quality and cost targets"
                        ]
                    }
                ],
                "education": [
                    {
                        "degree": "Bachelor of Science",
                        "field": "Mechanical Engineering",
                        "university": "University of Michigan",
                        "location": "Ann Arbor, MI",
                        "graduation_date": "05/2017",
                        "gpa": "3.7/4.0",
                        "coursework": ["Vehicle Dynamics", "Controls Engineering", "Manufacturing Processes"]
                    }
                ],
                "certifications": ["Six Sigma Green Belt", "Project Management Professional"],
                "skills": ["Leadership", "Technical Writing", "Problem Solving", "Cost Analysis"]
            }
        }
        
        # Return as JSON string (this is what the backend expects to parse)
        return json.dumps(stub_response)

