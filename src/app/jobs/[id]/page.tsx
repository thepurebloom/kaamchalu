"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Job, Booking, Profile } from "@/lib/types";
import Toast from "@/components/Toast";
import { getStatusBadgeClasses } from "@/lib/badge";
import { jobService } from "@/lib/services/jobService";
import { bookingService } from "@/lib/services/bookingService";
import { userService } from "@/lib/services/userService";

interface BookingWithWorker extends Booking {
  worker: Profile | null;
}

interface JobDetails extends Job {
  bookings: BookingWithWorker[];
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Rating States
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isRated, setIsRated] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setIsLoading(true);
    try {
      const { profile } = await userService.getCurrentUser();
      setUserProfile(profile);

      const jobData = await jobService.getJobById(id as string) as JobDetails;
      setJob(jobData);

      // Check rating status if job is completed
      if (jobData.status === "completed") {
         const activeBooking = jobData.bookings.find(b => b.status === "completed");
         if (activeBooking) {
            const existingRating = await bookingService.getRatingForBooking(activeBooking.id, profile.id);
            if (existingRating) setIsRated(true);
         }
      }
    } catch (error: any) {
      setToast({ message: "Job not found or access denied.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmWorker = async (bookingId: string) => {
    setActionLoading(true);
    try {
      await bookingService.confirmBooking(bookingId, id as string);
      setToast({ message: "Worker confirmed! The job is now official.", type: "success" });
      fetchJobDetails();
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartJob = async () => {
    setActionLoading(true);
    try {
      await jobService.updateJobStatus(id as string, "in_progress");
      setToast({ message: "Job is now live!", type: "success" });
      fetchJobDetails();
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteJob = async () => {
    setActionLoading(true);
    try {
      const confirmedBooking = job?.bookings.find((b) => ["confirmed", "in_progress", "completed"].includes(b.status));
      if (!confirmedBooking) throw new Error("No active booking found.");

      await jobService.updateJobStatus(id as string, "completed");
      await bookingService.updateBookingStatus(confirmedBooking.id, "completed");

      setToast({ message: "Task completed! Please leave a review.", type: "success" });
      fetchJobDetails();
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRate = async () => {
    if (!job || !userProfile) return;
    setActionLoading(true);
    try {
      const confirmedBooking = job.bookings.find((b) => b.status === "completed");
      if (!confirmedBooking) throw new Error("Job must be completed to rate.");

      const targetId = userProfile.role === "customer" ? confirmedBooking.worker_id : confirmedBooking.customer_id;
      
      await bookingService.rateBooking(confirmedBooking.id, userProfile.id, targetId, ratingValue, reviewText);
      setIsRated(true);
      setToast({ message: "Thank you for your feedback!", type: "success" });
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-12 h-12 rounded-full border-b-2 border-t-2 border-blue-500 animate-spin"></div>
      </div>
    );
  }

  if (!job) return null;

  const isCustomer = userProfile?.role === "customer";
  const activeBooking = job.bookings.find(b => ["confirmed", "in_progress", "completed"].includes(b.status));

  return (
    <div className="min-h-screen text-white bg-[#0a0a0a] p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation Breadcrumb */}
        <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
          ← Go Back
        </button>

        {/* Job Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none group-hover:bg-blue-600/10 transition-all duration-700"></div>
           
           <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
              <div className="space-y-4">
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${getStatusBadgeClasses(job.status)}`}>
                  {job.status.replace("_", " ")}
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">{job.title}</h1>
                <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">{job.description}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4 text-center">
                <p className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Total Budget</p>
                <span className="text-3xl font-black text-emerald-400">₹{job.budget}</span>
              </div>
           </div>

           <div className="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-800/50">
              <div className="flex flex-col gap-2">
                 <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Service City</span>
                 <span className="text-white font-semibold flex items-center gap-2 text-lg">📍 {job.city}</span>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Scheduled Date</span>
                 <span className="text-white font-semibold flex items-center gap-2 text-lg">📅 {job.preferred_date ? new Date(job.preferred_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "Flexible"}</span>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Time Preference</span>
                 <span className="text-white font-semibold flex items-center gap-2 text-lg">⏰ {job.preferred_time || "Flexible"}</span>
              </div>
           </div>
        </div>

        {/* Dynamic Workflow Engine */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl">
           
           {/* Phase 1: Open Search */}
           {job.status === "open" && (
             <div className="text-center py-20">
                <div className="w-24 h-24 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl animate-pulse">📡</div>
                <h2 className="text-3xl font-black mb-4">Finding Professionals...</h2>
                <p className="text-gray-500 text-lg max-w-md mx-auto">Your request is broadcasted to verified workers in {job.city}. You will be notified once they start accepting.</p>
             </div>
           )}

           {/* Phase 2: Selection */}
           {job.status === "accepted" && (
             <div>
                <h2 className="text-3xl font-black mb-8 border-b border-gray-800 pb-6">Professional Applicants</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {job.bookings.filter(b => b.status === "accepted").map(booking => (
                    <div key={booking.id} className="bg-black border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all group">
                       <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-xl font-bold">
                                {booking.worker?.name?.charAt(0) || "W"}
                             </div>
                             <div>
                                <h3 className="font-bold text-xl group-hover:text-blue-400 transition-colors">{booking.worker?.name || "Verified Worker"}</h3>
                                <p className="text-sm text-gray-500 capitalize">{booking.worker?.category || "Pro Partner"}</p>
                             </div>
                          </div>
                          <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-lg text-xs font-black">★★★★★</div>
                       </div>
                       
                       {isCustomer && (
                         <button
                           onClick={() => handleConfirmWorker(booking.id)}
                           disabled={actionLoading}
                           className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl font-black text-sm tracking-widest uppercase transition active:scale-[0.98] shadow-lg shadow-blue-900/20"
                         >
                           {actionLoading ? "Processing..." : "Select This Partner"}
                         </button>
                       )}
                    </div>
                  ))}
                </div>
             </div>
           )}

           {/* Phase 3: Confirmed Match */}
           {job.status === "confirmed" && (
             <div className="text-center py-10">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">🤝</div>
                <h2 className="text-3xl font-black mb-4">It's a Match!</h2>
                <p className="text-gray-400 text-lg mb-10">**{activeBooking?.worker?.name}** is ready to help you. Review the details below and start the workflow whenever you are ready.</p>
                
                {isCustomer && (
                   <button
                     onClick={handleStartJob}
                     disabled={actionLoading}
                     className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-12 py-4 rounded-2xl font-black text-lg tracking-widest uppercase transition active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                   >
                     {actionLoading ? "Starting..." : "Start Progress Now"}
                   </button>
                )}
             </div>
           )}

           {/* Phase 4: Active Work */}
           {job.status === "in_progress" && (
             <div className="text-center py-10">
                <div className="w-24 h-24 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl animate-spin-slow">🛠️</div>
                <h2 className="text-3xl font-black mb-4">Work In Progress</h2>
                <p className="text-gray-400 text-lg mb-10">Safety First! Professional partner **{activeBooking?.worker?.name}** is currently on-site fulfilling your request.</p>
                
                {(isCustomer || userProfile?.id === activeBooking?.worker_id) && (
                   <button
                     onClick={handleCompleteJob}
                     disabled={actionLoading}
                     className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-12 py-4 rounded-2xl font-black text-lg tracking-widest uppercase transition active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                   >
                     {actionLoading ? "Finalizing..." : "Mark as Completed"}
                   </button>
                )}
             </div>
           )}

           {/* Phase 5: Completion & Rating */}
           {job.status === "completed" && (
             <div className="text-center py-2 relative overflow-hidden">
                <div className="w-24 h-24 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">🏆</div>
                <h2 className="text-4xl font-black mb-4">Mission Accomplished!</h2>
                <p className="text-gray-500 text-lg mb-12">The job is finished. How was your experience with {isCustomer ? activeBooking?.worker?.name : "the customer"}?</p>
                
                {!isRated ? (
                   <div className="max-w-md mx-auto bg-black/60 border border-gray-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
                      <div className="flex justify-center gap-4 text-5xl text-gray-700 mb-8">
                         {[1,2,3,4,5].map(star => (
                           <span 
                             key={star} 
                             onClick={() => setRatingValue(star)}
                             className={`hover:text-yellow-500 transition-all transform hover:scale-110 cursor-pointer ${ratingValue >= star ? "text-yellow-500 scale-110" : ""}`}
                           >
                             ★
                           </span>
                         ))}
                      </div>
                      <textarea 
                         className="w-full bg-gray-900 border border-gray-800 focus:border-yellow-500 outline-none rounded-2xl p-4 text-white mb-6 resize-none h-32 transition-all" 
                         placeholder="Leave a short review (optional)..."
                         value={reviewText}
                         onChange={(e) => setReviewText(e.target.value)}
                       />
                      <button 
                         onClick={handleRate} 
                         disabled={ratingValue === 0 || actionLoading}
                         className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 py-4 rounded-2xl font-black uppercase tracking-widest text-white transition-all shadow-[0_10px_20px_rgba(234,179,8,0.3)]"
                      >
                         {actionLoading ? "Submitting..." : "Submit My Review"}
                      </button>
                   </div>
                ) : (
                   <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-full text-emerald-400 font-black tracking-widest uppercase text-sm">
                      <span className="text-xl">✓</span> Feedback Locked
                   </div>
                )}
             </div>
           )}
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
