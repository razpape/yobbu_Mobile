export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  photo_url?: string;
  role: 'traveler' | 'sender' | 'both';
  whatsapp?: string;
  language: string;
  rating: number;
  reviews_count: number;
  verification_status: string;
  created_at: string;
}

export interface Trip {
  id: string;
  traveler_id: string;
  from_city: string;
  to_city: string;
  from_country: string;
  to_country: string;
  departure_date: string;
  arrival_date?: string;
  space_available_kg: number;
  price_per_kg: number;
  description?: string;
  status: string;
  created_at: string;
}

export interface Request {
  id: string;
  sender_id: string;
  from_city: string;
  to_city: string;
  from_country: string;
  to_country: string;
  deadline_date: string;
  weight_kg: number;
  max_budget?: number;
  description?: string;
  status: string;
  created_at: string;
}

