import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

export async function createRetriever() {
  const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const embeddings = new OpenAIEmbeddings({ openAIApiKey });
  const sbApiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!sbApiKey || !sbUrl || !openAIApiKey) {
    throw new Error(
      "Please provide NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_OPENAI_API_KEY environment variables."
    );
  }
  const client = createClient(sbUrl, sbApiKey);

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  return vectorStore.asRetriever();
}
