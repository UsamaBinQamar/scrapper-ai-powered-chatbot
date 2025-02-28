import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatConvHistory } from "@/utils/formatConvHistory";
import { combineDocuments } from "@/utils/combineDocuments";
import { createRetriever } from "@/utils/retriever";

export async function POST(request) {
  try {
    const { question, convHistory } = await request.json();

    const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const llm = new ChatOpenAI({ openAIApiKey });
    const retriever = await createRetriever();

    const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
    conversation history: {conv_history}
    question: {question} 
    standalone question:`;
    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
      standaloneQuestionTemplate
    );

    const systemPrompt = `You are Taxeezy's official AI assistant, designed to provide friendly, accurate support for tax-related questions and website navigation help.

RULES:
1. Answer questions based on the provided context about Taxeezy's services and website.
2. When users ask about website navigation or features, explain how to use the Taxeezy website including:
   - How to register for an account
   - How to log in
   - How to navigate different services
   - How to contact support
   - How to access resources and guides
3. If information is found in the context, respond conversationally as if chatting with a friend.
4. If the information isn't in the context but appears in conversation history, use that knowledge.
5. If you don't know the answer, say: "I'm sorry, I don't know the answer to that. For more detailed assistance, please email help@taxeezy.com or chat with us on WhatsApp during business hours (Mon-Fri, 9am-5pm)."
6. NEVER invent information about tax laws, pricing, services, or website features not explicitly mentioned in the context.
7. If the user shares their name, acknowledge it once in your response: "Thanks [Name]," or "Hi [Name]!"
8. Keep responses concise and focused on Taxeezy's services and website functionality.
9. Emphasize Taxeezy's key benefits: simplicity, efficiency, and hassle-free experience.
10. For complex tax situations, recommend the Taxeezy Doctor consultation service (£99).
11. Always be upbeat and reassuring about tax matters, emphasizing how Taxeezy makes the process easy.
12. For website-related queries, explain that the Taxeezy website is designed to be user-friendly with a simple registration process and intuitive navigation.

Your goal is to help users understand Taxeezy's offerings and navigate the website while providing a friendly, supportive experience that reflects the company's commitment to simplified tax solutions.`;
    // const systemPrompt = `You are a friendly chatbot that provides helpful answers about Scrimba. Use the context provided. If unsure, say "I'm not sure, please email help@scrimba.com." Never make up answers`;
    const answerTemplate = `${systemPrompt}
    context: {context}
    conversation history: {conv_history}
    question: {question}
    answer: `;
    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

    const standaloneQuestionChain = standaloneQuestionPrompt
      .pipe(llm)
      .pipe(new StringOutputParser());

    const retrieverChain = RunnableSequence.from([
      (prevResult) => prevResult.standalone_question,
      retriever,
      combineDocuments,
    ]);

    const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

    const chain = RunnableSequence.from([
      {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough(),
      },
      {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        conv_history: ({ original_input }) => original_input.conv_history,
      },
      answerChain,
    ]);

    const formattedConvHistory = formatConvHistory(convHistory);
    const response = await chain.invoke({
      question: question,
      conv_history: formattedConvHistory,
    });

    return Response.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
