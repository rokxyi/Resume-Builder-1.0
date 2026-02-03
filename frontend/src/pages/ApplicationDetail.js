import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader2, FileText, Sparkles, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/applications/${id}`);
      setApplication(response.data);
    } catch (error) {
      console.error("Error fetching application:", error);
      toast.error("Failed to load application");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API}/applications/${id}/generate`);
      toast.success("Resume generated successfully!");
      await fetchApplication();
    } catch (error) {
      console.error("Error generating resume:", error);
      toast.error(error.response?.data?.detail || "Failed to generate resume");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API}/applications/${id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${application.job_title}_${application.company}_Resume.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error("Failed to download resume");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }
    
    setDeleting(true);
    try {
      await axios.delete(`${API}/applications/${id}`);
      toast.success("Application deleted");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: "bg-slate-50 text-slate-700 border border-slate-200", icon: FileText },
      processing: { class: "bg-amber-50 text-amber-700 border border-amber-200", icon: Loader2 },
      completed: { class: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle2 },
      failed: { class: "bg-red-50 text-red-700 border border-red-200", icon: AlertCircle }
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    
    return (
      <span className={`${badge.class} px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2`}>
        <Icon className="w-4 h-4" strokeWidth={1.5} />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            data-testid="back-to-dashboard-btn"
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>
                {application.job_title}
              </h1>
              <p className="text-base text-slate-500">{application.company}</p>
            </div>
            {getStatusBadge(application.status)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          {application.status === 'draft' && (
            <Button
              data-testid="generate-resume-btn"
              onClick={handleGenerate}
              disabled={generating}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm h-10 px-6 py-2 rounded-md transition-all active:scale-95"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Resume
                </>
              )}
            </Button>
          )}
          
          {application.status === 'processing' && (
            <Button
              disabled
              className="bg-amber-600 text-white shadow-sm h-10 px-6 py-2 rounded-md"
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}
          
          {application.status === 'completed' && (
            <>
              <Button
                data-testid="download-resume-btn"
                onClick={handleDownload}
                className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm h-10 px-6 py-2 rounded-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
              <Button
                data-testid="regenerate-resume-btn"
                onClick={handleGenerate}
                disabled={generating}
                variant="outline"
                className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm h-10 px-6 py-2 rounded-md"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </>
          )}
          
          <Button
            data-testid="delete-application-btn"
            onClick={handleDelete}
            disabled={deleting}
            variant="outline"
            className="ml-auto bg-white text-red-600 border border-red-200 hover:bg-red-50 shadow-sm h-10 px-4 py-2 rounded-md"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Description */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
              Job Description
            </h2>
            <div className="text-sm text-slate-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {application.job_description}
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
              Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">AI Model</p>
                <p className="text-sm font-medium text-slate-900">{application.ai_model}</p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-1">Base Resumes</p>
                <div className="space-y-2">
                  {application.base_resumes?.map((resume, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-700">
                      <FileText className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                      {resume.file_name}
                    </div>
                  ))}
                </div>
              </div>
              
              {application.formatting_preference && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Formatting Preference</p>
                  <p className="text-sm text-slate-700">{application.formatting_preference}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis */}
        {application.analysis && application.status === 'completed' && (
          <div className="mt-6 bg-white border border-slate-200 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
              AI Analysis
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              {application.analysis.job_keywords && (
                <AccordionItem value="keywords" data-testid="analysis-keywords">
                  <AccordionTrigger className="text-sm font-medium">Job Keywords</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                      {application.analysis.job_keywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {application.analysis.required_qualifications && (
                <AccordionItem value="required" data-testid="analysis-required">
                  <AccordionTrigger className="text-sm font-medium">Required Qualifications</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                      {application.analysis.required_qualifications.map((qual, index) => (
                        <li key={index}>{qual}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {application.analysis.candidate_strengths && (
                <AccordionItem value="strengths" data-testid="analysis-strengths">
                  <AccordionTrigger className="text-sm font-medium">Candidate Strengths</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                      {application.analysis.candidate_strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {application.analysis.tailoring_strategy && (
                <AccordionItem value="strategy" data-testid="analysis-strategy">
                  <AccordionTrigger className="text-sm font-medium">Tailoring Strategy</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-slate-600">{application.analysis.tailoring_strategy}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}
