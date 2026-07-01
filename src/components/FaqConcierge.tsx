"use client";

import { useRef, useState } from "react";
import { answerFaq } from "@/lib/faq";

interface Message {
  id: string;
  from: "candidate" | "bot";
  text: string;
  escalated?: boolean;
}

const STARTER_PROMPTS = [
  "What's my application status?",
  "How long does the process take?",
  "Is this role remote?",
  "I need to talk to a recruiter",
];

export function FaqConcierge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      from: "bot",
      text: "Hi! I'm the hiring assistant. Ask me about your application status, the timeline, location, benefits, or interview scheduling.",
    },
  ]);
  const [input, setInput] = useState("");
  const [escalated, setEscalated] = useState(false);
  const nextId = useRef(0);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const candidateMessage: Message = { id: `msg-${nextId.current++}`, from: "candidate", text: trimmed };
    const { answer, escalate } = answerFaq(trimmed);
    const botMessage: Message = { id: `msg-${nextId.current++}`, from: "bot", text: answer, escalated: escalate };

    setMessages((prev) => [...prev, candidateMessage, botMessage]);
    setInput("");
    if (escalate) setEscalated(true);
  }

  return (
    <div className="flex flex-col rounded-xl border border-line bg-panel">
      <div className="flex flex-col gap-3 p-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-[14px] leading-snug ${
              message.from === "candidate"
                ? "self-end bg-ink text-white"
                : message.escalated
                  ? "self-start bg-amber-soft text-amber"
                  : "self-start bg-teal-soft text-ink-soft"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      {escalated && (
        <p className="mx-5 mb-2 rounded-md bg-amber-soft px-3 py-2 text-[12.5px] text-amber">
          A recruiter has been notified and will follow up by email shortly.
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-line px-5 py-3">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => send(prompt)}
            className="rounded-full border border-line-strong px-3 py-1.5 text-[12.5px] text-ink-soft transition-colors hover:border-teal hover:text-teal"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-line p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-lg border border-line-strong bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-teal focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal/90"
        >
          Send
        </button>
      </form>
    </div>
  );
}
