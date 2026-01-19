// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string | null;
  user_type: 'client' | 'attorney' | 'admin';
  avatar: string | null;
  is_verified: boolean;
  two_factor_enabled: boolean;
  timezone: string;
  language: string;
  date_joined: string;
  last_login: string | null;
  has_attorney_profile: boolean | null; // null for non-attorneys, true/false for attorneys
}

export interface ClientProfile {
  user_id: string;
  date_of_birth: string | null;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string | null;
  preferred_contact_method: 'email' | 'phone' | 'sms';
}

export interface AttorneyProfile {
  id: string;
  user: User;
  bar_number: string;
  bar_state: string;
  years_of_experience: number;
  firm_name: string;
  bio: string;
  practice_areas: PracticeArea[];
  jurisdictions: Jurisdiction[];
  hourly_rate: number;
  consultation_fee: number;
  is_verified: boolean;
  is_accepting_clients: boolean;
  average_rating: number;
  total_reviews: number;
}

export interface PracticeArea {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Jurisdiction {
  id: string;
  name: string;
  state_code: string;
  jurisdiction_type: string;
}

// Matter Types
export interface Matter {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  matter_type: 'civil' | 'criminal' | 'family' | 'contract' | 'corporate' | 'real_estate' | 'immigration' | 'other';
  status: 'draft' | 'submitted' | 'under_review' | 'matched' | 'active' | 'pending_payment' | 'completed' | 'cancelled';
  client: User;
  attorney: AttorneyProfile | null;
  practice_area: PracticeArea | null;
  jurisdiction: Jurisdiction | null;
  parties: MatterParty[];
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface MatterParty {
  id: string;
  name: string;
  party_type: 'plaintiff' | 'defendant' | 'petitioner' | 'respondent' | 'witness' | 'other';
  is_client: boolean;
}

// Messaging Types
export interface Conversation {
  id: string;
  participants: User[];
  matter: Matter | null;
  title: string;
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: User;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'system';
  file_url: string | null;
  file_name: string | null;
  is_read: boolean;
  created_at: string;
}

// Document Types
export interface Document {
  id: string;
  matter: string;
  title: string;
  description: string;
  document_type: 'contract' | 'agreement' | 'evidence' | 'correspondence' | 'court_filing' | 'id' | 'financial' | 'other';
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'signed' | 'archived';
  file_url: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  version: number;
  requires_signature: boolean;
  signature_completed: boolean;
  created_at: string;
}

export interface DocumentSignature {
  id: string;
  document: string;
  signer: User;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  signed_at: string | null;
  expires_at: string | null;
}

// Appointment Types
export interface Appointment {
  id: string;
  client: User;
  attorney: AttorneyProfile;
  matter: Matter | null;
  appointment_type: 'consultation' | 'follow_up' | 'document_review' | 'case_discussion' | 'other';
  meeting_type: 'in_person' | 'video' | 'phone';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  timezone: string;
  location: string;
  meeting_link: string;
  fee: number | null;
  is_paid: boolean;
  created_at: string;
}

export interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// Payment Types
export interface Payment {
  id: string;
  payer: User;
  recipient: AttorneyProfile | null;
  matter: Matter | null;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_type: 'consultation' | 'retainer' | 'service' | 'subscription' | 'other';
  stripe_payment_intent_id: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  card_brand: string;
  card_last_four: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string;
  created_at: string;
}

// Auth Types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password1: string;
  password2: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'attorney';
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}
