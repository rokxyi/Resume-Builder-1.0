import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Briefcase, FileText, Loader2, LayoutDashboard, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API}/applications`);
      setApplications(response.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: "bg-slate-50 text-slate-700 border border-slate-200 px-2 py-1 rounded-full text-xs font-medium",
      processing: "bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full text-xs font-medium",
      completed: "bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full text-xs font-medium",
      failed: "bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-full text-xs font-medium"
    };
    return badges[status] || badges.draft;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-8">
          <Briefcase className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
          <span className="text-xl font-semibold text-slate-900" style={{fontFamily: 'Outfit, sans-serif'}}>
            Resume Tailorer
          </span>
        </div>
        
        <nav className="space-y-2">
          <button
            data-testid="nav-dashboard-btn"
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-900 bg-slate-100 rounded-md font-medium"
          >
            <LayoutDashboard className="w-5 h-5" strokeWidth={1.5} />
            Dashboard
          </button>
          <button
            data-testid="nav-settings-btn"
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-all"
          >
            <SettingsIcon className="w-5 h-5" strokeWidth={1.5} />
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>
                Job Applications
              </h1>
              <p className="text-sm text-slate-500">
                Manage your tailored resumes and track applications
              </p>
            </div>
            <Button
              data-testid="create-new-application-btn"
              onClick={() => navigate('/create')}
              className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm h-10 px-4 py-2 rounded-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>

          {/* Applications Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div data-testid="empty-state" className="bg-white border border-slate-200 shadow-sm rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit, sans-serif'}}>
                No Applications Yet
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Create your first tailored resume to get started
              </p>
              <Button
                data-testid="empty-create-btn"
                onClick={() => navigate('/create')}
                className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm h-10 px-4 py-2 rounded-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Application
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  data-testid={`application-card-${app.id}`}
                  className="md:col-span-4 bg-white border border-slate-200 shadow-sm rounded-lg p-6 hover:shadow-md hover:border-blue-300 hover:ring-1 hover:ring-blue-300 transition-all cursor-pointer"
                  onClick={() => navigate(`/application/${app.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1" style={{fontFamily: 'Outfit, sans-serif'}}>
                        {app.job_title}
                      </h3>
                      <p className="text-sm text-slate-500">{app.company}</p>
                    </div>
                    <span className={getStatusBadge(app.status)}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" strokeWidth={1.5} />
                      <span>{app.base_resumes?.length || 0} resume(s) uploaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                      <span>AI Model: {app.ai_model}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                    Created {formatDate(app.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
