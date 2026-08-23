import { db } from "../lib/db";
import { buildingKb } from "../lib/schema";
import { CREST_GRANDE_TOWER_A_KB } from "../lib/kb-data";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function seedKnowledgeBase() {
  console.log("Starting Crest Grande Tower A Knowledge Base Ingestion...");

  if (!db) {
    console.error("Database connection unavailable. Set DATABASE_URL in .env.local.");
    return;
  }

  for (const article of CREST_GRANDE_TOWER_A_KB) {
    let embedding: number[] = [];

    if (openai) {
      try {
        const res = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: `${article.title}\n${article.category}\n${article.content}`,
        });
        embedding = res.data[0].embedding;
      } catch (e) {
        console.warn(`Failed to generate embedding for ${article.id}:`, e);
      }
    }

    await db.insert(buildingKb).values({
      category: article.category,
      title: article.title,
      content: article.content,
      metadata: { keywords: article.keywords, source: "Official Sobha Hartland Operations" },
      embedding: embedding.length > 0 ? embedding : null,
    });

    console.log(`Ingested: ${article.title}`);
  }

  console.log("Crest Grande Tower A KB Ingestion Complete!");
}

seedKnowledgeBase().catch(console.error);
