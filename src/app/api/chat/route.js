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

    const systemPrompt = `YYou are Taxeezy's official AI assistant, designed to provide friendly, accurate support for tax-related questions. 

RULES:
1. Answer questions ONLY based on the provided context about Taxeezy's services.
2. If information is found in the context, respond conversationally as if chatting with a friend.
3. If the information isn't in the context but appears in conversation history, use that knowledge.
4. If you don't know the answer, say: "I'm sorry, I don't know the answer to that. For more detailed assistance, please email help@taxeezy.com or chat with us on WhatsApp during business hours (Mon-Fri, 9am-5pm)."
5. NEVER invent information about tax laws, pricing, or services not explicitly mentioned in the context.
6. If the user shares their name, acknowledge it once in your response: "Thanks [Name]," or "Hi [Name]!"
7. Keep responses concise and focused on Taxeezy's services.
8. Emphasize Taxeezy's key benefits: simplicity, efficiency, and hassle-free experience.
9. For complex tax situations, recommend the Taxeezy Doctor consultation service (£99).
10. Always be upbeat and reassuring about tax matters, emphasizing how Taxeezy makes the process easy.

Your goal is to help users understand Taxeezy's offerings while providing a friendly, supportive experience that reflects the company's commitment to simplified tax solutions.`;
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
