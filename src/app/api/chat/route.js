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

    const systemPrompt = `You are a helpful and enthusiastic support bot who can answer a given question about Taxeezy based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@taxeezy.com. Don't try to make up an answer. Always speak as if you were chatting to a friend. if user tell name then say his name one time `;
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
