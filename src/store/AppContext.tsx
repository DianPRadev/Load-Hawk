import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────

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
  name: string;
  email: string;
  phone: string;
  cdlClass: string;
  homeBase: string;
  preferredLanes: string;
  role: string;
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

// ─── Initial Data ────────────────────────────────────────────

const INITIAL_LOADS: Load[] = [
  { id: "l1", origin: "Dallas, TX", destination: "Atlanta, GA", miles: 781, weight: "42,000 lbs", rate: 2890, ratePerMile: 3.70, broker: "XPO Logistics", equipment: "Dry Van", postedAgo: "12 min ago", brokerRating: 4.6 },
  { id: "l2", origin: "Chicago, IL", destination: "Nashville, TN", miles: 473, weight: "38,500 lbs", rate: 1950, ratePerMile: 4.12, broker: "CH Robinson", equipment: "Reefer", postedAgo: "25 min ago", brokerRating: 4.8 },
  { id: "l3", origin: "Houston, TX", destination: "Memphis, TN", miles: 586, weight: "44,000 lbs", rate: 2340, ratePerMile: 3.99, broker: "TQL", equipment: "Flatbed", postedAgo: "38 min ago", brokerRating: 4.5 },
  { id: "l4", origin: "Phoenix, AZ", destination: "Denver, CO", miles: 602, weight: "35,000 lbs", rate: 2480, ratePerMile: 4.12, broker: "Coyote Logistics", equipment: "Dry Van", postedAgo: "1 hr ago", brokerRating: 4.1 },
  { id: "l5", origin: "Miami, FL", destination: "Charlotte, NC", miles: 651, weight: "40,000 lbs", rate: 2670, ratePerMile: 4.10, broker: "Echo Global", equipment: "Reefer", postedAgo: "1 hr ago", brokerRating: 4.2 },
  { id: "l6", origin: "LA, CA", destination: "Seattle, WA", miles: 1135, weight: "36,000 lbs", rate: 4200, ratePerMile: 3.70, broker: "Landstar", equipment: "Dry Van", postedAgo: "2 hr ago", brokerRating: 3.9 },
  { id: "l7", origin: "Newark, NJ", destination: "Boston, MA", miles: 215, weight: "28,000 lbs", rate: 980, ratePerMile: 4.56, broker: "Schneider", equipment: "Flatbed", postedAgo: "2 hr ago", brokerRating: 4.3 },
  { id: "l8", origin: "Denver, CO", destination: "Kansas City, MO", miles: 604, weight: "39,000 lbs", rate: 2510, ratePerMile: 4.15, broker: "CH Robinson", equipment: "Reefer", postedAgo: "3 hr ago", brokerRating: 4.8 },
  { id: "l9", origin: "San Antonio, TX", destination: "New Orleans, LA", miles: 542, weight: "41,000 lbs", rate: 2180, ratePerMile: 4.02, broker: "TQL", equipment: "Dry Van", postedAgo: "3 hr ago", brokerRating: 4.5 },
  { id: "l10", origin: "Portland, OR", destination: "Sacramento, CA", miles: 581, weight: "33,000 lbs", rate: 2350, ratePerMile: 4.04, broker: "Echo Global", equipment: "Flatbed", postedAgo: "4 hr ago", brokerRating: 4.2 },
];

const INITIAL_BROKERS: Broker[] = [
  { name: "CH Robinson", mc: "MC-128790", rating: 4.8, reviews: 1247, daysToPay: 15, badges: ["Fast Pay", "Reliable"], lanes: "Southeast, Midwest", userRatings: [] },
  { name: "TQL", mc: "MC-340512", rating: 4.5, reviews: 983, daysToPay: 21, badges: ["Reliable"], lanes: "Nationwide", userRatings: [] },
  { name: "Echo Global", mc: "MC-382842", rating: 4.2, reviews: 756, daysToPay: 28, badges: [], lanes: "West Coast, Mountain", userRatings: [] },
  { name: "Coyote Logistics", mc: "MC-474281", rating: 4.1, reviews: 612, daysToPay: 18, badges: ["Fast Pay"], lanes: "Great Lakes, Northeast", userRatings: [] },
  { name: "Landstar", mc: "MC-143711", rating: 3.9, reviews: 445, daysToPay: 30, badges: [], lanes: "Southeast", userRatings: [] },
  { name: "XPO Logistics", mc: "MC-194732", rating: 4.6, reviews: 891, daysToPay: 17, badges: ["Fast Pay", "Reliable"], lanes: "Nationwide", userRatings: [] },
  { name: "Schneider", mc: "MC-133655", rating: 4.3, reviews: 678, daysToPay: 22, badges: ["Reliable"], lanes: "Northeast, Midwest", userRatings: [] },
];

const INITIAL_DRIVERS: Driver[] = [
  { id: "d1", name: "James Wilson", status: "On Load", route: "Dallas → Atlanta", earnings: 8240 },
  { id: "d2", name: "Carlos Ramirez", status: "Available", route: "—", earnings: 6780 },
  { id: "d3", name: "Mike Thompson", status: "On Load", route: "Chicago → Nashville", earnings: 9120 },
  { id: "d4", name: "David Chen", status: "Off Duty", route: "—", earnings: 5430 },
  { id: "d5", name: "Robert Brown", status: "Available", route: "—", earnings: 7650 },
];

const DEFAULT_PROFILE: UserProfile = {
  name: "Marcus Johnson",
  email: "marcus@loadhawk.com",
  phone: "(214) 555-0147",
  cdlClass: "Class A",
  homeBase: "Dallas, TX",
  preferredLanes: "Southeast, Midwest",
  role: "Owner-Operator",
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  "Load Alerts (Email)": true,
  "Load Alerts (SMS)": true,
  "Payment Received": true,
  "Rate Changes": false,
  "Negotiation Updates": true,
};

// ─── Helpers ─────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(d: Date): string {
  return `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─── Context ─────────────────────────────────────────────────

interface AppState {
  // Data
  availableLoads: Load[];
  bookedLoads: BookedLoad[];
  brokers: Broker[];
  drivers: Driver[];
  profile: UserProfile;
  notifications: NotificationItem[];
  notificationSettings: NotificationSettings;
  negotiations: NegotiationRecord[];
  chatMessages: ChatMessage[];

  // Actions
  bookLoad: (loadId: string) => void;
  updateLoadStatus: (loadId: string, status: LoadStatus) => void;
  rateBroker: (brokerMc: string, rating: number, comment: string) => void;
  updateProfile: (profile: UserProfile) => void;
  updateNotificationSettings: (settings: NotificationSettings) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  sendChatMessage: (text: string, loadContext?: Load) => void;
  addNegotiation: (neg: NegotiationRecord) => void;
  addDriver: (driver: Omit<Driver, "id">) => void;
  updateDriverStatus: (id: string, status: Driver["status"], route?: string) => void;
  removeDriver: (id: string) => void;

  // Computed
  todaysEarnings: number;
  totalEarnings: number;
  activeLoadCount: number;
  totalMilesThisWeek: number;
  avgRatePerMile: number;
  unreadNotificationCount: number;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [availableLoads] = useState<Load[]>(INITIAL_LOADS);
  const [bookedLoads, setBookedLoads] = useState<BookedLoad[]>(() => loadFromStorage("lh_booked", []));
  const [brokers, setBrokers] = useState<Broker[]>(() => loadFromStorage("lh_brokers", INITIAL_BROKERS));
  const [drivers, setDrivers] = useState<Driver[]>(() => loadFromStorage("lh_drivers", INITIAL_DRIVERS));
  const [profile, setProfile] = useState<UserProfile>(() => loadFromStorage("lh_profile", DEFAULT_PROFILE));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage("lh_notifications", []));
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => loadFromStorage("lh_notif_settings", DEFAULT_NOTIFICATION_SETTINGS));
  const [negotiations, setNegotiations] = useState<NegotiationRecord[]>(() => loadFromStorage("lh_negotiations", []));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadFromStorage("lh_chat", [
    { role: "ai", text: "Welcome to LoadHawk AI Negotiator! Select a load and I'll analyze market rates, fuel costs, and lane data to help you negotiate the best price. What load are you looking at?" },
  ]));

  // Persist to localStorage
  useEffect(() => { localStorage.setItem("lh_booked", JSON.stringify(bookedLoads)); }, [bookedLoads]);
  useEffect(() => { localStorage.setItem("lh_brokers", JSON.stringify(brokers)); }, [brokers]);
  useEffect(() => { localStorage.setItem("lh_drivers", JSON.stringify(drivers)); }, [drivers]);
  useEffect(() => { localStorage.setItem("lh_profile", JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem("lh_notifications", JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem("lh_notif_settings", JSON.stringify(notificationSettings)); }, [notificationSettings]);
  useEffect(() => { localStorage.setItem("lh_negotiations", JSON.stringify(negotiations)); }, [negotiations]);
  useEffect(() => { localStorage.setItem("lh_chat", JSON.stringify(chatMessages)); }, [chatMessages]);

  const addNotification = useCallback((text: string, type: NotificationItem["type"]) => {
    setNotifications(prev => [{
      id: genId(),
      text,
      time: "Just now",
      read: false,
      type,
    }, ...prev].slice(0, 50));
  }, []);

  const bookLoad = useCallback((loadId: string) => {
    const load = availableLoads.find(l => l.id === loadId);
    if (!load) return;
    if (bookedLoads.find(b => b.id === loadId)) return;

    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + Math.ceil(load.miles / 500) + 1);

    const booked: BookedLoad = {
      ...load,
      status: "Picked Up",
      pickup: formatDate(today),
      delivery: formatDate(deliveryDate),
      bookedAt: Date.now(),
    };
    setBookedLoads(prev => [booked, ...prev]);
    addNotification(`Load booked: ${load.origin} → ${load.destination} — $${load.rate.toLocaleString()}`, "load");
  }, [availableLoads, bookedLoads, addNotification]);

  const updateLoadStatus = useCallback((loadId: string, status: LoadStatus) => {
    setBookedLoads(prev => prev.map(l => l.id === loadId ? { ...l, status } : l));
    const load = bookedLoads.find(l => l.id === loadId);
    if (load && status === "Delivered") {
      addNotification(`Load delivered: ${load.origin} → ${load.destination}`, "load");
      addNotification(`Payment pending: $${load.rate.toLocaleString()}`, "payment");
    }
  }, [bookedLoads, addNotification]);

  const rateBroker = useCallback((brokerMc: string, rating: number, comment: string) => {
    setBrokers(prev => prev.map(b => {
      if (b.mc !== brokerMc) return b;
      const newUserRatings = [...b.userRatings, { rating, comment, date: formatDate(new Date()) }];
      const totalRating = ((b.rating * b.reviews) + rating) / (b.reviews + 1);
      return {
        ...b,
        rating: Math.round(totalRating * 10) / 10,
        reviews: b.reviews + 1,
        userRatings: newUserRatings,
      };
    }));
    addNotification(`Broker rated: ${brokers.find(b => b.mc === brokerMc)?.name}`, "rating");
  }, [brokers, addNotification]);

  const updateProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    addNotification("Profile updated successfully", "payment");
  }, [addNotification]);

  const updateNotificationSettings = useCallback((settings: NotificationSettings) => {
    setNotificationSettings(settings);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const sendChatMessage = useCallback((text: string, loadContext?: Load) => {
    setChatMessages(prev => [...prev, { role: "user", text }]);

    // Simulate AI response based on context
    setTimeout(() => {
      let aiResponse = "";
      const lowerText = text.toLowerCase();

      if (loadContext) {
        const marketAvg = loadContext.ratePerMile * 0.93;
        const recommended = loadContext.ratePerMile * 1.08;

        if (lowerText.includes("fuel") || lowerText.includes("cost")) {
          aiResponse = `Current diesel average on this route is approximately $3.89/gal. At 6.5 MPG over ${loadContext.miles} miles, your fuel cost would be ~$${Math.round(loadContext.miles * 3.89 / 6.5).toLocaleString()}. At the current rate of $${loadContext.ratePerMile.toFixed(2)}/mi, your net after fuel is $${(loadContext.ratePerMile - 0.60).toFixed(2)}/mi — ${loadContext.ratePerMile > 3.5 ? "a solid margin" : "tight but workable"}.`;
        } else if (lowerText.includes("counter") || lowerText.includes("negotiate") || lowerText.includes("offer")) {
          aiResponse = `Based on current market data for ${loadContext.origin} → ${loadContext.destination}:\n\n• Market average: $${marketAvg.toFixed(2)}/mi\n• Current offer: $${loadContext.ratePerMile.toFixed(2)}/mi\n• My recommendation: Counter at $${recommended.toFixed(2)}/mi ($${Math.round(recommended * loadContext.miles).toLocaleString()} total)\n\nThis is ${((recommended / marketAvg - 1) * 100).toFixed(0)}% above market average, but justified by the current lane demand. I'd suggest framing it around fuel costs and tight capacity on this corridor.`;
        } else if (lowerText.includes("rate") || lowerText.includes("market") || lowerText.includes("spot")) {
          aiResponse = `Spot rates on the ${loadContext.origin} → ${loadContext.destination} lane have been trending ${Math.random() > 0.5 ? "up 6-8%" : "up 3-5%"} this week. The current offer of $${loadContext.ratePerMile.toFixed(2)}/mi is ${loadContext.ratePerMile > marketAvg ? "above" : "below"} the market average of $${marketAvg.toFixed(2)}/mi. ${loadContext.ratePerMile > marketAvg ? "This is already a competitive rate." : "There's room to negotiate higher."}`;
        } else if (lowerText.includes("broker") || lowerText.includes(loadContext.broker.toLowerCase())) {
          aiResponse = `${loadContext.broker} has a rating of ${loadContext.brokerRating}/5.0 on LoadHawk. They typically pay within 15-21 days. ${loadContext.brokerRating >= 4.5 ? "They're known as a reliable partner — good to work with." : "Decent broker, but make sure to get rate confirmation in writing."} For this lane, they've posted ${Math.floor(Math.random() * 10 + 5)} loads in the past week.`;
        } else {
          aiResponse = `I'm analyzing the ${loadContext.origin} → ${loadContext.destination} load ($${loadContext.rate.toLocaleString()}, ${loadContext.miles} mi, ${loadContext.equipment}).\n\nThe rate of $${loadContext.ratePerMile.toFixed(2)}/mi is ${loadContext.ratePerMile >= 4.0 ? "strong" : "fair"} for this lane. Would you like me to:\n\n1. Analyze fuel costs for this route\n2. Suggest a counter-offer strategy\n3. Check current spot rate trends\n4. Review the broker's history`;
        }
      } else {
        if (lowerText.includes("help") || lowerText.includes("what can")) {
          aiResponse = "I can help you with:\n\n1. **Rate Analysis** — Compare offers against market rates\n2. **Counter-Offer Strategy** — Craft negotiation responses\n3. **Fuel Cost Calculation** — Calculate route costs\n4. **Broker Intelligence** — Review broker history and reliability\n\nSelect a load from the Find Loads page and come back here, or ask me about general market conditions!";
        } else if (lowerText.includes("market") || lowerText.includes("trend")) {
          aiResponse = "Current market overview:\n\n• National spot rate average: $3.52/mi (Dry Van)\n• Reefer premium: +$0.35/mi average\n• Flatbed: $3.89/mi average\n• Southeast lanes are running hot (+8% week over week)\n• West Coast rates softening slightly (-2%)\n\nWant me to analyze a specific lane?";
        } else {
          aiResponse = "I can provide the best analysis when you have a specific load in mind. Head to the **Find Loads** page, and click **NEGOTIATE** on any load to bring it here for analysis. Or ask me about market trends, fuel costs, or general negotiation strategy!";
        }
      }

      setChatMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
    }, 800 + Math.random() * 700);
  }, []);

  const addNegotiation = useCallback((neg: NegotiationRecord) => {
    setNegotiations(prev => [neg, ...prev]);
    if (neg.result === "Won") {
      addNotification(`Negotiation won: +$${neg.saved} on ${neg.route}`, "negotiation");
    }
  }, [addNotification]);

  const addDriver = useCallback((driver: Omit<Driver, "id">) => {
    setDrivers(prev => [...prev, { ...driver, id: genId() }]);
  }, []);

  const updateDriverStatus = useCallback((id: string, status: Driver["status"], route?: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status, route: route || (status === "Available" || status === "Off Duty" ? "—" : d.route) } : d));
  }, []);

  const removeDriver = useCallback((id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  }, []);

  // Computed values
  const deliveredLoads = bookedLoads.filter(l => l.status === "Delivered");
  const activeLoads = bookedLoads.filter(l => l.status !== "Delivered");
  const todaysEarnings = deliveredLoads.reduce((sum, l) => {
    const isToday = new Date(l.bookedAt).toDateString() === new Date().toDateString();
    return sum + (isToday ? l.rate : 0);
  }, 0);
  const totalEarnings = deliveredLoads.reduce((sum, l) => sum + l.rate, 0);
  const activeLoadCount = activeLoads.length;
  const totalMilesThisWeek = bookedLoads.reduce((sum, l) => sum + l.miles, 0);
  const avgRatePerMile = bookedLoads.length > 0
    ? bookedLoads.reduce((sum, l) => sum + l.ratePerMile, 0) / bookedLoads.length
    : 0;
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const value: AppState = {
    availableLoads,
    bookedLoads,
    brokers,
    drivers,
    profile,
    notifications,
    notificationSettings,
    negotiations,
    chatMessages,
    bookLoad,
    updateLoadStatus,
    rateBroker,
    updateProfile,
    updateNotificationSettings,
    markNotificationRead,
    clearNotifications,
    sendChatMessage,
    addNegotiation,
    addDriver,
    updateDriverStatus,
    removeDriver,
    todaysEarnings,
    totalEarnings,
    activeLoadCount,
    totalMilesThisWeek,
    avgRatePerMile,
    unreadNotificationCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
