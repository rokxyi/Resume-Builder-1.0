import { Briefcase, FileText, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/80 border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
            <span className="text-xl font-semibold text-slate-900" style={{fontFamily: 'Outfit, sans-serif'}}>
              Resume Tailorer
            </span>
          </div>
          <Button
            data-testid="get-started-btn"
            onClick={() => navigate('/dashboard')}
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm h-10 px-4 py-2 rounded-md transition-all active:scale-95"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative container mx-auto px-6 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight mb-6" style={{fontFamily: 'Outfit, sans-serif'}}>
                Tailored Resumes That Get You Interviews
              </h1>
              <p className="text-base leading-relaxed text-slate-600 mb-8 max-w-2xl">
                AI-powered resume generation that analyzes job descriptions and creates ATS-optimized, professionally formatted resumes in minutes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  data-testid="hero-cta-btn"
                  onClick={() => navigate('/dashboard')}
                  className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm h-10 px-6 py-2 rounded-md transition-all active:scale-95"
                >
                  Start Building
                </Button>
                <Button
                  data-testid="hero-learn-more-btn"
                  variant="outline"
                  className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm h-10 px-6 py-2 rounded-md"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:col-span-5">
              <img
                src="https://images.unsplash.com/photo-1758598304540-1ac6fd7d477b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjB3b3JraW5nJTIwb24lMjBsYXB0b3AlMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fHwxNzY5NzM3MDExfDA&ixlib=rb-4.1.0&q=85"
                alt="Professional working on laptop"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-slate-900 text-center mb-12" style={{fontFamily: 'Outfit, sans-serif'}}>
            Precision-Engineered for Success
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div data-testid="feature-ai-powered" className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <Sparkles className="w-8 h-8 text-blue-600 mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>
                AI-Powered Analysis
              </h3>
              <p className="text-sm text-slate-500">
                Choose from GPT-5.2, Claude Sonnet 4.5, Gemini 3 Pro, and more. Deep job description analysis extracts keywords and requirements.
              </p>
            </div>

            <div data-testid="feature-ats-optimized" className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>
                ATS-Optimized
              </h3>
              <p className="text-sm text-slate-500">
                Resumes formatted to pass Applicant Tracking Systems with exact keyword matching and professional structure.
              </p>
            </div>

            <div data-testid="feature-professional-format" className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <FileText className="w-8 h-8 text-blue-600 mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>
                Professional .docx Output
              </h3>
              <p className="text-sm text-slate-500">
                Download perfectly formatted Word documents ready for submission. Clean, professional, and industry-standard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-base text-slate-300 mb-8 max-w-2xl mx-auto">
            Start creating tailored resumes that stand out and get you interviews.
          </p>
          <Button
            data-testid="cta-start-now-btn"
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm h-10 px-6 py-2 rounded-md transition-all active:scale-95"
          >
            Start Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-slate-500">
          <p>Made by Rohit Sharma</p>
        </div>
      </footer>
    </div>
  );
}
