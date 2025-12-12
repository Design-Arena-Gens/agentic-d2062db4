"use client";

import { useState } from "react";
import { format } from "date-fns";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Appointment {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  reason: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! Welcome to SmileCare Dental Clinic. I'm your AI receptionist assistant. How can I help you today? Would you like to book an appointment, check availability, or do you have questions about our services?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appointment, setAppointment] = useState<Partial<Appointment>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          appointment,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);

      if (data.appointment) {
        setAppointment(data.appointment);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-dental-blue text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🦷</div>
            <div>
              <h1 className="text-3xl font-bold">SmileCare Dental Clinic</h1>
              <p className="text-dental-lightblue text-sm">AI Appointment Assistant - Available 24/7</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div className="bg-white rounded-lg shadow-xl flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-3 ${
                    message.role === "user"
                      ? "bg-dental-blue text-white"
                      : "bg-dental-lightblue text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-dental-lightblue text-gray-800 rounded-2xl px-6 py-3">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-dental-blue rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-dental-blue rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-dental-blue rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-dental-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 font-semibold mb-3">Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setInput("I'd like to book an appointment")}
              className="px-4 py-2 bg-dental-lightblue text-dental-blue rounded-full text-sm hover:bg-dental-blue hover:text-white transition-colors"
            >
              📅 Book Appointment
            </button>
            <button
              onClick={() => setInput("What are your office hours?")}
              className="px-4 py-2 bg-dental-lightblue text-dental-blue rounded-full text-sm hover:bg-dental-blue hover:text-white transition-colors"
            >
              🕐 Office Hours
            </button>
            <button
              onClick={() => setInput("What services do you offer?")}
              className="px-4 py-2 bg-dental-lightblue text-dental-blue rounded-full text-sm hover:bg-dental-blue hover:text-white transition-colors"
            >
              🦷 Services
            </button>
            <button
              onClick={() => setInput("Do you accept insurance?")}
              className="px-4 py-2 bg-dental-lightblue text-dental-blue rounded-full text-sm hover:bg-dental-blue hover:text-white transition-colors"
            >
              💳 Insurance
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 px-4 text-center text-sm text-gray-600">
        <p>📍 123 Dental Street, Suite 100 | 📞 (555) 123-4567 | ✉️ info@smilecare.com</p>
        <p className="mt-1 text-xs">🤖 Powered by AI - For emergencies, please call 911</p>
      </footer>
    </div>
  );
}
