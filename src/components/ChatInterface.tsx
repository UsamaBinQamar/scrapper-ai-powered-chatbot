"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";

type Message = {
  role: "human" | "ai";
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "human", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
          convHistory: messages.map((m) => m.content),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data: { response: string } = await response.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
    } catch (error) {
      console.error("Error getting chat response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I'm sorry, there was an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4">
      <div
        id="chatbot-conversation-container"
        ref={chatContainerRef}
        className="flex-1 overflow-auto mb-4 p-4 border rounded-lg"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            Ask a question to start the conversation
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`speech ${
                message.role === "human" ? "speech-human" : "speech-ai"
              } p-3 my-2 rounded-lg ${
                message.role === "human" ? "bg-blue-100 ml-auto" : "bg-gray-100"
              } max-w-[80%]`}
            >
              {message.content}
            </div>
          ))
        )}
        {isLoading && (
          <div className="speech speech-ai p-3 my-2 rounded-lg bg-gray-100 max-w-[80%]">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          id="user-input"
          type="text"
          value={inputValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          className="flex-1 p-2 border rounded-lg"
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300"
          disabled={isLoading || !inputValue.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
