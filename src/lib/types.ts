export interface Profile {
  id: string;
  email: string;
  role: 'customer' | 'worker';
  category?: string;
  location?: string;
  created_at: string;
}

export interface Job {
  id: string;
  customer_id: string;
  category: string;
  description: string;
  location: string;
  preferred_date: string;
  preferred_time: string;
  budget: number;
  created_at: string;
}

export interface Booking {
  id: string;
  job_id: string;
  customer_id: string;
  worker_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
}
