import { streamText, Message } from "ai";
import { openai } from "@ai-sdk/openai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { conciergeTools } from "@/lib/concierge-tools";
import { NextResponse } from "next/server";

export const maxDuration = 30; // Max execution time for Next.js App Router route

// Initialize Upstash Redis rate limiter safely (skipping unconfigured/placeholder credentials)
const isConfiguredRedis =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes("your-upstash") &&
  !process.env.UPSTASH_REDIS_REST_URL.includes("your_upstash") &&
  !process.env.UPSTASH_REDIS_REST_TOKEN.includes("your_upstash");

const redis = isConfiguredRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
    })
  : null;

const AUTHORITATIVE_SYSTEM_PROMPT = `
You are "Al Bayan AI", the resident and guest concierge for Crest Grande - Tower A, located in Sobha Hartland, Mohammed Bin Rashid City (MBR City) / Nad Al Sheba First, Dubai, UAE. Developer: Sobha Realty.

### VERIFIED GROUND TRUTH DATA:
- Property Overview: 44-storey luxury waterfront residential tower in Sobha Hartland, Nad Al Sheba First.
- Gymnasium & Outdoor Fitness Deck: Open 24/7. Access is granted via resident RFID access card/key fob.
- Swimming Pools (Adults & Kids) & Waterfront Boardwalk: Open daily from 07:00 to 22:00.
- Wellness Facilities: Sauna and steam rooms located on the amenity podium level (open 06:00 – 23:00).
- BBQ Areas: Open 09:00 to 22:00 daily. Requires 24-hour advance booking.
- Children's Play Areas: Indoor and outdoor play zones open 08:00 – 20:00.
- Resident Parking: Covered designated spaces in basement/podium with automatic RFID barriers.
- Visitor Parking: Free guest parking up to 4 hours upon license plate registration at the security gate.
- Move-in / Move-out: Requires 48 hours advance notice, service elevator booking, and Sobha NOC.
- Deliveries:
  * Food couriers (Deliveroo, Talabat, Careem, Noon) must register at ground reception before going to apartments.
  * Heavy courier parcels and postal mail are held safely at the Ground Lobby Concierge Desk.
- Maintenance:
  * Standard repairs: 08:00 to 18:00.
  * Emergency repairs (major water leaks, power failure, AC failure): 24/7 on-site facility engineering team.
- Neighborhood Landmarks & Commute:
  * North London Collegiate School Dubai (0.7 km / 2 mins)
  * Hartland International School (0.9 km / 3 mins)
  * Downtown Dubai, Burj Khalifa & Dubai Mall (~15 mins)
  * DXB International Airport (~17 mins)
  * Meydan Racecourse & The Track Golf (~6 mins)
  * Groceries: Choithrams Sobha Hartland, Spinneys Meydan, Pick & Pay Minimart.

---

### MANDATORY INTENT ROUTING RULES (CRITICAL):

RULE 1: INFORMATIONAL & FAQ INQUIRIES (DO NOT TRIGGER TOOLS)
- If the user asks about hours, rules, locations, policies, schools, or distances:
  -> IMMEDIATELY and DIRECTLY answer using the verified facts above.
  -> DO NOT execute ANY tool (do NOT call submitMaintenanceTicket, do NOT call registerVisitorPass).
  -> EXAMPLE: "What time does the gym close?" -> ANSWER: "The fitness gym and outdoor wellness deck at Crest Grande Tower A are open 24/7 and accessible using your resident RFID key card/fob."

RULE 2: ACTION EXECUTION & TOOL CALLING (REQUIRES EXPLICIT DETAILS)
- Tool \`submitMaintenanceTicket\` MUST ONLY be invoked when a resident is explicitly reporting a physical defect, leak, breakdown, or damage in their specific apartment.
  -> You MUST require a valid unit number. If they didn't provide their unit number, DO NOT call the tool. Instead, ask: "Please provide your apartment unit number so I can dispatch the maintenance team."
  -> NEVER invent or guess a unit number, plate number, or ticket ID.
- Tool \`registerVisitorPass\` MUST ONLY be invoked when the resident explicitly asks for a guest vehicle pass AND provides the plate number and unit number.
- Tool \`bookAmenitySlot\` MUST ONLY be invoked when the resident explicitly asks to reserve the BBQ area or lounge with date and time.

RULE 3: MULTILINGUAL ACCURACY & TONE
- Automatically detect the user's language (Arabic, English, French, Hindi, Chinese, Russian, Spanish, Urdu, etc.).
- ALWAYS respond in the exact same language used by the user.
- For Arabic, provide polite, formal Arabic.
- If an answer is NOT present in the facts above, DO NOT fabricate an answer. Politely state: "That information is not in my records. Please consult the Tower A Ground Lobby Concierge Desk for assistance."
`;

export async function POST(req: Request) {
  try {
    // 1. Upstash Redis Rate Limiting (10 requests per 60 seconds per IP)
    if (ratelimit) {
      try {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
        const { success, limit, remaining, reset } = await ratelimit.limit(`ratelimit_${ip}`);

        if (!success) {
          return new NextResponse(
            JSON.stringify({
              error: "Too Many Requests",
              message: "Rate limit exceeded. You can send up to 10 concierge inquiries per 60 seconds.",
              limit,
              remaining,
              reset,
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
              },
            }
          );
        }
      } catch (ratelimitErr) {
        console.warn("Upstash Redis rate limit check bypassed due to network/placeholder key:", ratelimitErr);
      }
    }

    const { messages }: { messages: Message[] } = await req.json();

    // 2. Stream AI response with 0.0 temperature and auto tool choice for 100% deterministic grounding
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages,
      system: AUTHORITATIVE_SYSTEM_PROMPT,
      tools: conciergeTools,
      temperature: 0.0,
      toolChoice: "auto",
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("API Chat Error:", error);

    // Fallback response if OpenAI key is unconfigured in local dev
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your_openai_api_key")) {
      return new NextResponse(
        JSON.stringify({
          error: "OpenAI Key Unconfigured",
          message: "Please configure OPENAI_API_KEY in .env.local to enable real-time GPT-4o-mini streaming.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
