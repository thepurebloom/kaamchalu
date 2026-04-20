"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Job } from "@/lib/types";
import Toast from "@/components/Toast";
import { jobService } from "@/lib/services/jobService";
import { bookingService } from "@/lib/services/bookingService";
import { userService } from "@/lib/services/userService";
import { workerService } from "@/lib/services/workerService";
import { getStatusBadgeClasses } from "@/lib/badge";

export default function AllJobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const data = await jobService.getJobs();
            setJobs(data as Job[]);
        } catch (error: any) {
            setToast({ message: "Failed to load jobs feed.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoBook = async (job: Job) => {
        setBookingLoading(job.id);
        try {
            const { user } = await userService.getCurrentUser();
            
            // 1. Find a match
            const { worker, matchType, error: matchError } = await workerService.getMatchingWorkers(job.category, job.city);
            
            if (matchError || !worker) {
                setToast({ message: matchError || "No workers found for this category.", type: "warning" });
                return;
            }

            // 2. Create the booking as 'pending'
            await bookingService.createBooking(job.id, user.id, worker.id, "pending");
            
            // 3. Update job status to accepted (since worker is assigned automatically)
            // Note: In some flows, 'accepted' means the worker claimed it.
            // Here we'll notify the user.
            
            setToast({ 
                message: `Matched with ${worker.name}! Worker notified.`, 
                type: "success" 
            });
            
            fetchJobs();
        } catch (error: any) {
            setToast({ message: error.message || "Login to book workers.", type: "error" });
        } finally {
            setBookingLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Marketplace Feed</h1>
                        <p className="text-gray-400">Discover or fulfill recent service requests.</p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => router.push("/jobs/new")} className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                            + Post a Job
                        </button>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 border border-gray-800 rounded-2xl bg-gray-900/10">
                        <div className="w-10 h-10 rounded-full border-b-2 border-t-2 border-blue-500 animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-gray-700 transition-all group">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                       <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${getStatusBadgeClasses(job.status)}`}>
                                          {job.status.replace("_", " ")}
                                       </span>
                                       <span className="text-emerald-400 font-bold">₹{job.budget}</span>
                                    </div>
                                    
                                    <h2 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => router.push(`/jobs/${job.id}`)}>
                                        {job.title}
                                    </h2>
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-4">{job.category}</p>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-6">{job.description}</p>

                                    <div className="grid grid-cols-2 gap-4 text-[11px] text-gray-500 font-medium bg-black/40 p-4 rounded-xl border border-gray-800/50">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-600 uppercase tracking-tighter">Location</span>
                                            <span className="text-gray-300">{job.city}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-600 uppercase tracking-tighter">Date</span>
                                            <span className="text-gray-300">{job.preferred_date ? new Date(job.preferred_date).toLocaleDateString() : 'Flexible'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    {job.status === "open" ? (
                                        <button
                                            onClick={() => handleAutoBook(job)}
                                            disabled={bookingLoading === job.id}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                                        >
                                            {bookingLoading === job.id ? "Matching..." : "Instant Match"}
                                        </button>
                                    ) : (
                                        <button onClick={() => router.push(`/jobs/${job.id}`)} className="w-full border border-gray-700 text-gray-400 hover:text-white py-3 rounded-xl font-bold text-sm transition-all text-center block">
                                            View Progress
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!isLoading && jobs.length === 0 && (
                    <div className="text-center py-20 bg-gray-900/20 border border-gray-800 rounded-3xl">
                        <p className="text-gray-500 text-lg">No jobs found in the marketplace.</p>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}