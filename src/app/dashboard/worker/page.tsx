"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Toast from "@/components/Toast";
import { getStatusBadgeClasses } from "@/lib/badge";
import { bookingService } from "@/lib/services/bookingService";
import { userService } from "@/lib/services/userService";
import { jobService } from "@/lib/services/jobService";
import Link from "next/link";

interface Booking {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'completed';
  job_id: string;
  created_at: string;
  jobs: {
    title?: string;
    description?: string;
    category: string;
    city?: string;
    budget?: number;
    status: string;
  };
}

export default function WorkerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    let channel: any;

    const setupDashboard = async () => {
      setIsLoading(true);
      try {
        const { user } = await userService.getCurrentUser();
        const data = await bookingService.getBookingsByWorker(user.id);
        setBookings(data as any as Booking[]);

        channel = supabase.channel('worker-bookings-dashboard')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings', filter: `worker_id=eq.${user.id}` },
            async (payload) => {
              if (payload.eventType === 'INSERT') {
                 const { data: newBooking } = await supabase
                     .from('bookings')
                     .select('id, status, job_id, created_at, jobs(*)')
                     .eq('id', payload.new.id)
                     .single();
                 if (newBooking) setBookings(prev => [newBooking as any as Booking, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setBookings(prev => prev.map(b => b.id === payload.new.id ? { ...b, status: payload.new.status } : b));
              }
            }
          ).subscribe();
      } catch (err: any) {
        setToast({ message: "Network error loading bookings.", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    setupDashboard();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const updateBookingStatus = async (id: string, jobId: string, newStatus: 'accepted' | 'rejected') => {
    setActionLoading(id);
    try {
      await bookingService.updateBookingStatus(id, newStatus);
      if (newStatus === 'accepted') await jobService.updateJobStatus(jobId, 'accepted');
      setToast({ message: `Booking marked as ${newStatus}.`, type: "success" });
    } catch (err: any) {
      setToast({ message: `Error: ${err.message}`, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white mb-2">Worker Console</h1>
              <p className="text-gray-400">Claim listings and track your earnings.</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 w-fit tracking-widest uppercase">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                 Active Pipeline
            </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-32 border border-gray-800 rounded-2xl bg-gray-900/30">
              <div className="w-10 h-10 rounded-full border-b-2 border-t-2 border-blue-500 animate-spin mb-4"></div>
              <p className="text-gray-400 animate-pulse text-lg">Loading workflow...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-gray-900/20 border border-gray-800/40 p-20 rounded-3xl text-center shadow-2xl backdrop-blur-md">
               <div className="text-7xl mb-6 opacity-80">🔭</div>
               <h3 className="text-3xl font-bold text-white mb-3 text-gray-200">No projects yet</h3>
               <p className="text-gray-400 text-lg max-w-md mx-auto">Browse the public alerts to start building your professional history.</p>
               <Link href="/worker/alerts" className="mt-8 inline-block bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold transition-all active:scale-95">
                 View Global Alerts
               </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => {
              const jobTitle = booking.jobs?.title || "Contract Request";
              const isConfirmed = booking.status === "confirmed" || booking.status === "completed";
              
              return (
                <div key={booking.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-gray-600 transition-colors group">
                  <div className="cursor-pointer" onClick={() => router.push(`/jobs/${booking.job_id}`)}>
                    <div className="flex justify-between items-start mb-5">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${getStatusBadgeClasses(booking.status)}`}>
                         {booking.status.replace("_", " ")}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{jobTitle}</h2>
                    <p className="text-xs font-black text-blue-400/80 mb-5 tracking-widest uppercase">{booking.jobs?.category || "Contract"}</p>
                    
                    <div className="bg-black/50 p-4 rounded-xl border border-gray-800/50 space-y-4 mb-3 text-sm">
                       <div className="flex justify-between">
                          <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest leading-none mt-1">Location</span>
                          <span className="text-gray-200 flex items-center gap-1 font-medium">📍 {booking.jobs?.city || "Unspecified"}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest leading-none mt-1">Total Payout</span>
                          <span className="text-emerald-400 font-black text-lg">₹{booking.jobs?.budget || 0}</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-gray-800/50">
                    {booking.status === "pending" && (
                      <div className="flex gap-3">
                          <button 
                              onClick={() => updateBookingStatus(booking.id, booking.job_id, "accepted")} 
                              disabled={actionLoading === booking.id}
                              className="flex-1 bg-white text-black hover:bg-gray-200 disabled:opacity-50 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                          >
                              {actionLoading === booking.id ? "..." : "Accept"}
                          </button>
                      </div>
                    )}

                    {isConfirmed && (
                       <Link href={`/jobs/${booking.job_id}`} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-center text-white block transition-all shadow-lg shadow-blue-900/20">
                          View Project & Timeline
                       </Link>
                    )}

                    {booking.status === "accepted" && booking.jobs.status === "open" && (
                       <div className="text-center py-2 text-yellow-500/70 text-[10px] font-black uppercase tracking-tighter bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                          Awating Partner Confirmation
                       </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
