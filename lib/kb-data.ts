export interface KBArticle {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string[];
}

export const CREST_GRANDE_TOWER_A_KB: KBArticle[] = [
  {
    id: "kb-building-identity",
    category: "Building Overview",
    title: "Crest Grande Tower A - Property Identity & Location",
    content: `Crest Grande (Tower A) is a 44-storey luxury waterfront residential skyscraper developed by Sobha Realty. It is located in Sobha Hartland, Mohammed Bin Rashid (MBR) City / Nad Al Sheba First, Dubai, United Arab Emirates. It features high-end finishes, panoramic views of the Downtown Dubai skyline and the Ras Al Khor Wildlife Sanctuary, 24/7 lobby concierge, and state-of-the-art residential infrastructure.`,
    keywords: ["identity", "location", "developer", "sobha", "hartland", "tower a", "crest grande", "floors", "address", "nad al sheba"],
  },
  {
    id: "kb-amenities-hours",
    category: "Amenities & Operating Hours",
    title: "Resident Amenities & Daily Operating Hours",
    content: `Crest Grande Tower A Amenities & Operating Hours:
- Swimming Pools (Adults & Kids Pool) & Waterfront Boardwalk: Open 07:00 – 22:00 daily.
- Fitness Gym & Outdoor Wellness Deck: 24/7 resident access via RFID access card/fob.
- Sauna & Steam Rooms: Located on the amenity floor, open 06:00 – 23:00 daily.
- Outdoor BBQ Zones (BBQ Zone 1 & BBQ Zone 2): Open 09:00 – 22:00 daily. Requires 24-hour advance booking via concierge tool.
- Children's Play Areas (Indoor & Outdoor): Open 08:00 – 20:00 daily.`,
    keywords: ["pool", "swimming", "gym", "fitness", "sauna", "steam", "bbq", "barbecue", "hours", "timings", "play area", "kids"],
  },
  {
    id: "kb-visitors-parking",
    category: "Visitors & Parking",
    title: "Visitor Gate Passes, Guest Parking & Move-In Guidelines",
    content: `Visitors & Parking Rules for Crest Grande Tower A:
- 24/7 security concierge at main gate with RFID automated barrier gates.
- Dedicated covered parking bays are assigned for residents.
- Guest Parking: Visitors receive up to 4 hours free guest parking after vehicle plate registration at the main entrance gate or via digital visitor pass.
- Move-In / Move-Out Guidelines: Requires minimum 48 hours advance notice to building management, service elevator booking, and a valid Sobha Realty NOC (No Objection Certificate).`,
    keywords: ["visitor", "guest", "parking", "gate pass", "plate", "car", "move in", "move out", "noc", "elevator booking", "security"],
  },
  {
    id: "kb-deliveries",
    category: "Deliveries & Package Handling",
    title: "Food Delivery & Courier Package Protocols",
    content: `Deliveries & Parcel Regulations for Crest Grande Tower A:
- Food Couriers (Deliveroo, Talabat, Noon Food, Careem): Riders must register at the security desk before proceeding to residential elevators or meet residents in the lobby.
- Parcels & Packages (Amazon, DHL, FedEx, Aramex): All incoming mail and packages are safely held at the Tower A Ground Lobby Reception desk. Residents receive immediate notification for parcel collection upon showing unit ID.`,
    keywords: ["delivery", "deliveroo", "talabat", "noon", "careem", "courier", "parcel", "package", "reception", "mail", "lobby"],
  },
  {
    id: "kb-maintenance",
    category: "Facility Maintenance & Emergency Services",
    title: "Maintenance Scheduling & 24/7 Emergency Support",
    content: `Facility Maintenance Protocols at Crest Grande Tower A:
- Standard In-Unit Maintenance & Scheduled Repairs: Available Monday to Saturday from 08:00 – 18:00.
- Emergency Maintenance Support: 24/7 on-site facility engineers are available immediately for urgent situations including burst water pipes, total electrical failure, or AC breakdown. Maintenance requests can be submitted instantly through the concierge assistant tool.`,
    keywords: ["maintenance", "repair", "plumbing", "ac", "hvac", "electrical", "emergency", "engineer", "water leak", "ticket"],
  },
  {
    id: "kb-nearby-landmarks",
    category: "Nearby Landmarks & Shopping",
    title: "Schools, Distance to Landmarks & Grocery Markets",
    content: `Surrounding Location & Nearby Points of Interest for Crest Grande Tower A:
- Schools: North London Collegiate School (NLCS) Dubai (0.7 km, ~2 mins drive), Hartland International School (0.9 km, ~3 mins drive).
- Key Landmarks & Destinations: Downtown Dubai & Burj Khalifa (~15 mins), Dubai International Airport DXB (~17 mins), Meydan Racecourse & Golf Club (~6 mins).
- Groceries & Supermarkets: Choithrams Sobha Hartland (within community), Spinneys Meydan (~5 mins drive).`,
    keywords: ["nearby", "schools", "nlcs", "hartland international", "burj khalifa", "downtown", "airport", "dxb", "meydan", "choithrams", "spinneys", "supermarket"],
  },
];

// In-memory keyword similarity search for fallback when pgvector database connection is offline/unseeded
export function searchLocalKB(query: string): KBArticle[] {
  const normalizedQuery = query.toLowerCase();
  const tokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);

  const scored = CREST_GRANDE_TOWER_A_KB.map((article) => {
    let score = 0;
    const textToSearch = `${article.title} ${article.category} ${article.content} ${article.keywords.join(" ")}`.toLowerCase();

    for (const token of tokens) {
      if (textToSearch.includes(token)) score += 2;
    }
    for (const kw of article.keywords) {
      if (normalizedQuery.includes(kw)) score += 3;
    }
    return { article, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter((item) => item.score > 0).map((item) => item.article).slice(0, 4);
}
