"use client";

import { useChat } from "ai/react";
import { AnimatePresence } from "framer-motion";
import { ChatHeader } from "@/web/components/chat/ChatHeader";
import { ChatInput } from "@/web/components/chat/ChatInput";
import { EmptyState } from "@/web/components/chat/EmptyState";
import { ErrorMessage } from "@/web/components/chat/ErrorMessage";
import { MessageList } from "@/web/components/chat/MessageList";
import { useAnimationTracking } from "@/web/hooks/useAnimationTracking";
import { useAutoScroll } from "@/web/hooks/useAutoScroll";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat();

  const { messagesEndRef } = useAutoScroll(messages);
  const {
    animatedMessageIds,
    animatedToolBubbles,
    animatedTextBubbles,
    animatedToolResults,
    animatedCheckmarks,
  } = useAnimationTracking(messages);

  return (
    <main className="flex min-h-screen flex-col bg-[#1a1b26] text-[#c0caf5]">
      <ChatHeader />

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 overflow-y-auto scroll-smooth p-4 pb-32 md:p-6">
        {messages.length === 0 ? (
          <AnimatePresence initial={false} mode="popLayout">
            <EmptyState key="empty-state" />
          </AnimatePresence>
        ) : (
          <MessageList
            messages={messages}
            animatedMessageIds={animatedMessageIds}
            animatedToolBubbles={animatedToolBubbles}
            animatedTextBubbles={animatedTextBubbles}
            animatedToolResults={animatedToolResults}
            animatedCheckmarks={animatedCheckmarks}
          />
        )}

        {error && <ErrorMessage message={error.message} />}
        <div ref={messagesEndRef} className="h-32" />
      </div>

      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
