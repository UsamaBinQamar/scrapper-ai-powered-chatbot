// "use client";

// import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { createClient } from "@supabase/supabase-js";
// import { useEffect, useState } from "react";

// export default function Home() {
//   const [fileContent, setFileContent] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fileName = "textfile.txt";

//     const fetchTextFile = async () => {
//       try {
//         // Fetch the file from the public directory
//         const response = await fetch(`/${fileName}`);

//         if (!response.ok) {
//           throw new Error(
//             `Error fetching ${fileName}: ${response.status} ${response.statusText}`
//           );
//         }

//         const text = await response.text();
//         console.log(`Contents of ${fileName}:`, text);
//         setFileContent(text);
//         const splitter = new RecursiveCharacterTextSplitter({
//           chunkSize: 500,
//           separators: ["\n\n", "\n", " ", ""],
//           chunkOverlap: 50, // 10% overlap of chunks size
//         });

//         const output = await splitter.createDocuments([text]);

//         const sbApiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
//         console.log("🚀 ~ fetchTextFile ~ sbApiKey:", sbApiKey);
//         const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//         console.log("🚀 ~ fetchTextFile ~ sbUrl:", sbUrl);
//         const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
//         console.log("🚀 ~ fetchTextFile ~ openAIApiKey:", openAIApiKey);

//         if (!sbApiKey || !sbUrl || !openAIApiKey) {
//           throw new Error(
//             "Please provide NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_OPENAI_API_KEY environment variables."
//           );
//         }
//         const client = createClient(sbUrl, sbApiKey);

//         await SupabaseVectorStore.fromDocuments(
//           output,
//           new OpenAIEmbeddings({ openAIApiKey }),
//           {
//             client,
//             tableName: "documents",
//           }
//         );
//       } catch (error) {
//         console.error(`Error processing ${fileName}:`, error);
//         if (error instanceof Error) {
//           setError(error.message);
//         } else {
//           setError(String(error));
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchTextFile();
//   }, []);

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Text File Content</h1>

//       {isLoading ? (
//         <p>Loading file content...</p>
//       ) : error ? (
//         <div className="text-red-500 border border-red-300 p-4 rounded-lg">
//           <h2 className="font-semibold">Error</h2>
//           <p>{error}</p>
//         </div>
//       ) : (
//         <div className="border p-4 rounded-lg">
//           <h2 className="font-semibold text-lg">textfile.txt</h2>
//           <pre className="bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-64">
//             {fileContent}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }
// ========================================================
import ChatInterface from "@/components/ChatInterface";
import React from "react";

const page = () => {
  return <ChatInterface />;
};

export default page;
