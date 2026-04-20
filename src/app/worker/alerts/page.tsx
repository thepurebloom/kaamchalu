"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Toast from "@/components/Toast";
import { Job, Profile } from "@/lib/types";
import { jobService } from "@/lib/services/jobService";
import { bookingService } from "@/lib/services/bookingService";
import { userService } from "@/lib/services/userService";
import { getStatusBadgeClasses } from "@/lib/badge";

export default function WorkerAlertsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let alertChannel: any;

    const setupAlerts = async () => {
      setIsLoading(true);
      try {
        const { profile } = await userService.getCurrentUser();
        setUserProfile(profile);

        // Initial fetch
        const data = await jobService.getOpenJobs();
        setJobs(data as Job[]);

        // Real-time listener for new open jobs
        alertChannel = supabase.channel('worker-alerts-live')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'jobs', filter: 'status=eq.open' },
            (payload) => {
              const newJob = payload.new as Job;
              // Add to top of feed
              setJobs(prev => [newJob, ...prev]);
              setToast({ message: "📡 New job posted in your area!", type: "success" });
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'jobs' },
            (payload) => {
              // If job is no longer open (e.g. accepted by someone else), remove it
              if (payload.new.status !== 'open') {
                 setJobs(prev => prev.filter(j => j.id !== payload.new.id));
              }
            }
          )
          .subscribe();

      } catch (error: any) {
        console.error("Alerts Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setupAlerts();

    return () => {
      if (alertChannel) supabase.removeChannel(alertChannel);
    };
  }, []);

  const handleAccept = async (job: Job) => {
    if (!userProfile) return;
    setActionLoading(job.id);
    try {
      await bookingService.createBooking(job.id, job.customer_id, userProfile.id, "accepted");
      await jobService.updateJobStatus(job.id, "accepted");

      setToast({ message: "Job accepted! Waiting for customer confirmation.", type: "success" });
      setJobs((prev) => prev.filter(j => j.id !== job.id));
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkip = (jobId: string) => {
    setJobs((prev) => prev.filter(j => j.id !== jobId));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-4">
                 Worker Alerts
                 <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                 </span>
              </h1>
              <p className="text-gray-400">Live marketplace stream. Claim jobs before other workers!</p>
            </div>
            
            {userProfile?.category && (
               <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-sm font-semibold capitalize flex items-center gap-2">
                  <span className="text-blue-500/50">#</span> {userProfile.category}
               </div>
            )}
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-32 border border-gray-800 rounded-2xl bg-gray-900/30">
              <div className="w-10 h-10 rounded-full border-b-2 border-t-2 border-blue-500 animate-spin mb-4"></div>
              <p className="text-gray-400 animate-pulse text-lg">Looking for new requests...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-gray-900/10 border border-gray-800/40 p-20 rounded-3xl text-center shadow-2xl backdrop-blur-md">
               <div className="text-7xl mb-6 opacity-80 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] text-blue-500">📡</div>
               <h3 className="text-3xl font-bold text-white mb-3">Feed is quiet</h3>
               <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">There are currently no new open jobs. Stay tuned - new alerts will appear here in real-time!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl hover:border-gray-600 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                       <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md ${getStatusBadgeClasses(job.status)}`}>
                          {job.status}
                       </span>
                       <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{job.category}</span>
                       <span className="text-gray-600 text-xs">•</span>
                       <span className="text-gray-500 text-xs">{job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : "Anytime"}</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{job.title}</h2>
                    <p className="text-gray-400 max-w-2xl text-sm mb-5 leading-relaxed line-clamp-2">
                       {job.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                       <div className="bg-black/50 px-3 py-2 rounded-lg border border-gray-800/50 flex items-center gap-2">
                          <span className="text-gray-500">📍</span>
                          <span className="text-gray-300">{job.city}</span>
                       </div>
                       <div className="bg-black/50 px-3 py-2 rounded-lg border border-gray-800/50 flex items-center gap-2">
                          <span className="text-gray-500">💰</span>
                          <span className="text-emerald-400 font-bold tracking-tight">₹{job.budget}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex w-full md:w-auto gap-3">
                    <button 
                       onClick={() => handleAccept(job)}
                       disabled={actionLoading === job.id}
                       className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-8 py-3.5 rounded-xl font-bold text-white transition active:scale-95 flex-1 md:flex-none shadow-lg shadow-blue-900/40"
                    >
                       {actionLoading === job.id ? "Accepting..." : "Accept Job"}
                    </button>
                    <button 
                       onClick={() => handleSkip(job.id)}
                       disabled={actionLoading === job.id}
                       className="border border-gray-800 hover:bg-gray-800 px-6 py-3.5 rounded-xl font-bold text-gray-400 transition flex-1 md:flex-none"
                    >
                       Skip
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}
        
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
