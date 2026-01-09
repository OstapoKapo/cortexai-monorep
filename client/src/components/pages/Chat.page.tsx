"use client";

import { Brain } from "lucide-react";
import { CustomButton } from "@/components/custom/СustomButton.component";
import { CustomInput } from "@/components/custom/СustomInput.component";

export function ChatPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold">Чат з AI</h2>
      <div className="flex-1 bg-card border border-border rounded-xl p-6 flex flex-col">
        <ChatEmptyState />
        <ChatInput />
      </div>
    </div>
  );
}

function ChatEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Почніть розмову з CortexAI</p>
        <p className="text-sm mt-2">Ваш AI-асистент готовий допомогти</p>
      </div>
    </div>
  );
}

function ChatInput() {
  return (
    <div className="mt-4 flex gap-3">
      <CustomInput
        type="text"
        placeholder="Введіть ваше повідомлення..."
        className="flex-1"
      />
      <CustomButton className="w-auto px-6" variant="primary">
        Надіслати
      </CustomButton>
    </div>
  );
}
