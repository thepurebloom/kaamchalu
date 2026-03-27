"use client";
import LogoutButton from "@/components/LogoutButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function JobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [bookingLoading, setBookingLoading] = useState<string | null>(null);

    // ✅ Protect route
    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();

            if (!data.user) {
                router.push("/login");
            } else {
                fetchJobs();
            }
        };

        checkUser();
    }, []);

    // ✅ Fetch jobs
    const fetchJobs = async () => {
        const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });

        if (error) {
            console.log(error);
        } else {
            setJobs(data);
        }
    };

    // ✅ Handle Book Worker
    const handleBookWorker = async (jobId: string, jobCategory: string) => {
        setBookingLoading(jobId);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                alert("Please log in to book a worker.");
                return;
            }

            let bestWorker = null;
            let isExactMatch = false;

            // 1. Try to find workers that match the job category
            const { data: matchingWorkers, error: matchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'worker')
                .ilike('category', `%${jobCategory}%`); // Optional case-insensitive match

            if (!matchError && matchingWorkers && matchingWorkers.length > 0) {
                bestWorker = matchingWorkers[0];
                isExactMatch = true;
            } else {
                // 2. Fallback to all available workers if no match is found (or if column is missing)
                const { data: allWorkers, error: allWorkersError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'worker');

                if (allWorkersError || !allWorkers || allWorkers.length === 0) {
                    alert("No available workers found at the moment.");
                    return;
                }
                
                bestWorker = allWorkers[0];
                isExactMatch = false;
            }

            // Insert booking referencing the global job
            const { error: bookingError } = await supabase.from("bookings").insert({
                job_id: jobId,
                customer_id: user.id,
                worker_id: bestWorker.id,
                status: "pending"
            });

            if (bookingError) {
                alert("Failed to book worker: " + bookingError.message);
            } else {
                if (isExactMatch) {
                    alert(`🎉 Successfully matched and requested a specialized worker for this job!`);
                } else {
                    alert(`⚠️ No exact match found for "${jobCategory}". A general available worker has been assigned.`);
                }
            }
        } catch (error: any) {
            console.error("Booking error:", error);
            alert("An unexpected error occurred during booking.");
        } finally {
            setBookingLoading(null);
        }
    };

    // ✅ Logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">All Jobs</h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded-lg"
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() => router.push("/jobs/new")}
                        className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg"
                    >
                        + Post Job
                    </button>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="text-xl font-semibold">{job.category}</h2>
                            <p className="text-gray-400 mt-2">{job.description}</p>

                            <div className="mt-4 text-sm text-gray-500 space-y-1">
                                <p>📍 {job.location}</p>
                                <p>📅 {job.preferred_date}</p>
                                <p>⏰ {job.preferred_time}</p>
                                <p className="text-white mt-1">💰 ₹{job.budget}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleBookWorker(job.id, job.category)}
                            disabled={bookingLoading === job.id}
                            className={`mt-5 w-full py-2.5 rounded-lg font-medium transition ${bookingLoading === job.id
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                        >
                            {bookingLoading === job.id ? "Booking..." : "Book Worker"}
                        </button>
                    </div>
                ))}
                {jobs.length === 0 && <p className="text-gray-500">No jobs posted yet.</p>}
            </div>
        </div>
    );
}