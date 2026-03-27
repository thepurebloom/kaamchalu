"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WorkerDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const fetchIncomingRequests = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch bookings bridging details out to jobs
      const { data, error } = await supabase
        .from("bookings")
        .select("*, jobs(category, budget)")
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookings(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) {
      fetchIncomingRequests();
    } else {
      alert("Error updating booking: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Worker Dashboard</h1>

      {isLoading ? (
        <p className="text-gray-500 animate-pulse">Loading your bookings...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-400">{booking.jobs?.category || "Unknown Service"}</h2>
                
                <div className="mt-3 text-sm text-gray-300 space-y-1">
                   <p className="text-xs text-gray-500 font-mono">ID {booking.id.slice(0, 8)}</p>
                   <p className="text-md font-medium text-white">💰 ₹{booking.jobs?.budget || 0}</p>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-800 flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${booking.status === 'accepted' ? 'bg-green-500/20 text-green-400' : booking.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                   {booking.status}
                </span>

                {booking.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateBookingStatus(booking.id, "accepted")} className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-sm font-medium transition">Accept</button>
                    <button onClick={() => updateBookingStatus(booking.id, "rejected")} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm font-medium transition">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-gray-500">You have no booking requests yet.</p>}
        </div>
      )}
    </div>
  );
}
