import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Loader2, FileText, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CreateApplication() {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [formData, setFormData] = useState({
    job_title: "",
    company: "",
    job_description: "",
    ai_model: "",
    formatting_preference: ""
  });
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API}/models`);
      setModels(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, ai_model: response.data[0].model_id }));
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to load AI models");
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await axios.post(`${API}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        setResumes(prev => [...prev, { ...response.data, file }]);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true
  });

  const removeResume = (index) => {
    setResumes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.job_title || !formData.company || !formData.job_description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (resumes.length === 0) {
      toast.error("Please upload at least one resume");
      return;
    }
    
    setCreating(true);
    
    try {
      // Create application
      const appResponse = await axios.post(`${API}/applications`, formData);
      const applicationId = appResponse.data.id;
      
      // Add resumes to application
      for (const resume of resumes) {
        const resumeFormData = new FormData();
        resumeFormData.append("file", resume.file);
        await axios.post(`${API}/applications/${applicationId}/add-resume`, resumeFormData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      
      toast.success("Application created successfully!");
      navigate(`/application/${applicationId}`);
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Failed to create application");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-8">
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
          <h1 className="text-4xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>
            Create New Application
          </h1>
          <p className="text-sm text-slate-500">
            Upload your job description and resumes to generate a tailored resume
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Details */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
              Job Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="job_title" className="text-sm font-medium text-slate-700 mb-2 block">
                  Job Title *
                </Label>
                <Input
                  id="job_title"
                  data-testid="job-title-input"
                  placeholder="e.g., Senior Frontend Engineer"
                  value={formData.job_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  className="h-10 bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-md"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="company" className="text-sm font-medium text-slate-700 mb-2 block">
                  Company *
                </Label>
                <Input
                  id="company"
                  data-testid="company-input"
                  placeholder="e.g., TechCorp"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="h-10 bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Label htmlFor="job_description" className="text-sm font-medium text-slate-700 mb-2 block">
                Job Description *
              </Label>
              <Textarea
                id="job_description"
                data-testid="job-description-input"
                placeholder="Paste the complete job description here..."
                value={formData.job_description}
                onChange={(e) => setFormData(prev => ({ ...prev, job_description: e.target.value }))}
                className="min-h-[200px] bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-md"
                required
              />
            </div>
          </div>

          {/* Upload Resumes */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
              Base Resume(s)
            </h2>
            
            <div
              {...getRootProps()}
              data-testid="resume-dropzone"
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" strokeWidth={1.5} />
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                  <p className="text-sm text-slate-600">Uploading...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-2">
                    Drag & drop your resume(s) here, or click to browse
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports .pdf, .docx, .doc, .txt (max 10MB each)
                  </p>
                </>
              )}
            </div>

            {/* Uploaded Resumes */}
            {resumes.length > 0 && (
              <div className="mt-4 space-y-2">
                {resumes.map((resume, index) => (
                  <div
                    key={index}
                    data-testid={`uploaded-resume-${index}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{resume.file_name}</p>
                        <p className="text-xs text-slate-500">
                          {(resume.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-testid={`remove-resume-${index}-btn`}
                      onClick={() => removeResume(index)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Configuration */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>
              AI Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="ai_model" className="text-sm font-medium text-slate-700 mb-2 block">
                  AI Model *
                </Label>
                <Select
                  value={formData.ai_model}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ai_model: value }))}
                >
                  <SelectTrigger data-testid="ai-model-select" className="h-10 bg-white border-slate-200">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.model_id} value={model.model_id} data-testid={`model-option-${model.model_id}`}>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
                          <span>{model.display_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-2">
                  Choose the AI model that will analyze and generate your resume
                </p>
              </div>
              
              <div>
                <Label htmlFor="formatting_preference" className="text-sm font-medium text-slate-700 mb-2 block">
                  Formatting Preference (Optional)
                </Label>
                <Input
                  id="formatting_preference"
                  data-testid="formatting-preference-input"
                  placeholder="e.g., Use minimal design, emphasize technical skills"
                  value={formData.formatting_preference}
                  onChange={(e) => setFormData(prev => ({ ...prev, formatting_preference: e.target.value }))}
                  className="h-10 bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              data-testid="cancel-btn"
              onClick={() => navigate('/dashboard')}
              className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm h-10 px-4 py-2 rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="create-application-submit-btn"
              disabled={creating}
              className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm h-10 px-4 py-2 rounded-md transition-all active:scale-95"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Application"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
