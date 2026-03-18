// ─── Core Data Types ──────────────────────────────────────

export interface Load {
  id: string;
  origin: string;
  destination: string;
  miles: number;
  weight: string;
  rate: number;
  ratePerMile: number;
  broker: string;
  equipment: "Dry Van" | "Reefer" | "Flatbed";
  postedAgo: string;
  brokerRating: number;
}

export type LoadStatus = "In Transit" | "Picked Up" | "Delivered";

export interface BookedLoad extends Load {
  status: LoadStatus;
  pickup: string;
  delivery: string;
  bookedAt: number;
}

export interface Broker {
  id: string;
  name: string;
  mc: string;
  rating: number;
  reviews: number;
  daysToPay: number;
  badges: string[];
  lanes: string;
  userRatings: { rating: number; comment: string; date: string }[];
}

export interface ChatMessage {
  role: "ai" | "user";
  text: string;
}

export interface NegotiationRecord {
  route: string;
  offered: number;
  countered: number;
  result: "Won" | "Lost" | "Pending";
  saved: number;
  date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  cdlClass: string;
  homeBase: string;
  preferredLanes: string;
  role: string;
  subscriptionTier: string;
}

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
  read: boolean;
  type: "load" | "payment" | "negotiation" | "rating";
}

export interface Driver {
  id: string;
  name: string;
  status: "On Load" | "Available" | "Off Duty";
  route: string;
  earnings: number;
}

export interface NotificationSettings {
  [key: string]: boolean;
}

// ─── Database row types (snake_case from Supabase) ────────

export interface DbProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  cdl_class: string;
  home_base: string;
  preferred_lanes: string;
  role: string;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

export interface DbLoad {
  id: string;
  origin: string;
  destination: string;
  miles: number;
  weight: string;
  rate: number;
  rate_per_mile: number;
  broker_name: string;
  broker_rating: number;
  equipment: "Dry Van" | "Reefer" | "Flatbed";
  posted_at: string;
  status: string;
}

export interface DbBookedLoad {
  id: string;
  user_id: string;
  load_id: string;
  status: LoadStatus;
  pickup_date: string;
  delivery_date: string | null;
  booked_at: string;
  delivered_at: string | null;
  load?: DbLoad;
}

export interface DbBroker {
  id: string;
  name: string;
  mc: string;
  rating: number;
  total_reviews: number;
  days_to_pay: number;
  badges: string[];
  lanes: string;
}

export interface DbDriver {
  id: string;
  fleet_owner_id: string;
  name: string;
  status: "On Load" | "Available" | "Off Duty";
  current_route: string;
  monthly_earnings: number;
}

export interface DbNotification {
  id: string;
  user_id: string;
  text: string;
  type: "load" | "payment" | "negotiation" | "rating";
  read: boolean;
  created_at: string;
}

// ─── Mappers (DB → Frontend) ──────────────────────────────

export function mapDbProfile(db: DbProfile): UserProfile {
  return {
    id: db.id,
    name: db.name,
    email: db.email,
    phone: db.phone,
    cdlClass: db.cdl_class,
    homeBase: db.home_base,
    preferredLanes: db.preferred_lanes,
    role: db.role,
    subscriptionTier: db.subscription_tier || "free",
  };
}

export function mapDbLoad(db: DbLoad): Load {
  const now = Date.now();
  const posted = new Date(db.posted_at).getTime();
  const diffMin = Math.floor((now - posted) / 60000);
  let postedAgo: string;
  if (diffMin < 60) postedAgo = `${diffMin} min ago`;
  else if (diffMin < 1440) postedAgo = `${Math.floor(diffMin / 60)} hr ago`;
  else postedAgo = `${Math.floor(diffMin / 1440)}d ago`;

  return {
    id: db.id,
    origin: db.origin,
    destination: db.destination,
    miles: db.miles,
    weight: db.weight,
    rate: db.rate,
    ratePerMile: Number(db.rate_per_mile),
    broker: db.broker_name,
    equipment: db.equipment,
    postedAgo,
    brokerRating: Number(db.broker_rating),
  };
}

export function mapDbDriver(db: DbDriver): Driver {
  return {
    id: db.id,
    name: db.name,
    status: db.status,
    route: db.current_route,
    earnings: db.monthly_earnings,
  };
}

export function mapDbNotification(db: DbNotification): NotificationItem {
  const now = Date.now();
  const created = new Date(db.created_at).getTime();
  const diffMin = Math.floor((now - created) / 60000);
  let time: string;
  if (diffMin < 1) time = "Just now";
  else if (diffMin < 60) time = `${diffMin}m ago`;
  else if (diffMin < 1440) time = `${Math.floor(diffMin / 60)}h ago`;
  else time = `${Math.floor(diffMin / 1440)}d ago`;

  return {
    id: db.id,
    text: db.text,
    time,
    read: db.read,
    type: db.type,
  };
}
