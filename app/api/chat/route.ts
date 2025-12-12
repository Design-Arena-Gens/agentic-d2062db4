import { NextResponse } from "next/server";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Appointment {
  name?: string;
  phone?: string;
  email?: string;
  date?: string;
  time?: string;
  reason?: string;
}

const SYSTEM_PROMPT = `You are a friendly and professional AI receptionist for SmileCare Dental Clinic. Your role is to:

1. Greet patients warmly and professionally
2. Help patients book appointments by collecting:
   - Full name
   - Phone number
   - Email address
   - Preferred date (available Mon-Fri, 9 AM - 5 PM)
   - Preferred time slot
   - Reason for visit (cleaning, checkup, emergency, cosmetic, etc.)
3. Answer questions about:
   - Office hours: Monday-Friday 9:00 AM - 5:00 PM, Saturday 9:00 AM - 2:00 PM
   - Services: General dentistry, cleanings, fillings, root canals, crowns, bridges, cosmetic dentistry, teeth whitening, implants, orthodontics
   - Insurance: We accept most major dental insurance plans including Delta Dental, Cigna, Aetna, MetLife, and United Healthcare
   - Location: 123 Dental Street, Suite 100
   - Emergency protocol: For dental emergencies after hours, call our emergency line at (555) 123-9999

Guidelines:
- Be conversational and empathetic
- Ask for information one step at a time, don't overwhelm the patient
- Confirm all details before finalizing an appointment
- If someone needs emergency care, prioritize them and offer next available slots
- Be helpful with insurance questions but advise them to call for specific coverage details
- Keep responses concise and friendly
- Use emojis sparingly and professionally

When you have collected all appointment information, confirm the details and let them know someone will call them within 24 hours to confirm the appointment.`;

function analyzeAppointmentData(
  messages: Message[],
  currentAppointment: Appointment
): Appointment {
  const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
  const updatedAppointment = { ...currentAppointment };

  // Extract name
  if (!updatedAppointment.name) {
    const namePatterns = [
      /(?:name is|i'm|i am|my name's|this is)\s+([a-z]+(?:\s+[a-z]+)*)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/,
    ];
    for (const pattern of namePatterns) {
      const match = messages[messages.length - 1]?.content.match(pattern);
      if (match) {
        updatedAppointment.name = match[1].trim();
        break;
      }
    }
  }

  // Extract phone
  if (!updatedAppointment.phone) {
    const phoneMatch = messages[messages.length - 1]?.content.match(
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s?\d{3}[-.\s]?\d{4})/
    );
    if (phoneMatch) {
      updatedAppointment.phone = phoneMatch[1];
    }
  }

  // Extract email
  if (!updatedAppointment.email) {
    const emailMatch = messages[messages.length - 1]?.content.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    if (emailMatch) {
      updatedAppointment.email = emailMatch[0];
    }
  }

  // Extract date
  if (!updatedAppointment.date) {
    const datePatterns = [
      /(?:on\s+)?(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(?:on\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
      /(tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
    ];
    for (const pattern of datePatterns) {
      const match = messages[messages.length - 1]?.content.match(pattern);
      if (match) {
        updatedAppointment.date = match[0];
        break;
      }
    }
  }

  // Extract time
  if (!updatedAppointment.time) {
    const timeMatch = messages[messages.length - 1]?.content.match(
      /(\d{1,2}:\d{2}\s*(?:am|pm)|\d{1,2}\s*(?:am|pm)|(?:morning|afternoon|evening))/i
    );
    if (timeMatch) {
      updatedAppointment.time = timeMatch[1];
    }
  }

  // Extract reason
  if (!updatedAppointment.reason) {
    const reasonKeywords = [
      "cleaning",
      "checkup",
      "check-up",
      "emergency",
      "pain",
      "toothache",
      "filling",
      "crown",
      "root canal",
      "whitening",
      "cosmetic",
      "implant",
      "extraction",
      "braces",
      "orthodontic",
    ];
    for (const keyword of reasonKeywords) {
      if (lastUserMessage.includes(keyword)) {
        updatedAppointment.reason = keyword;
        break;
      }
    }
  }

  return updatedAppointment;
}

function generateAIResponse(
  messages: Message[],
  appointment: Appointment
): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || "";

  // Check if asking about services
  if (
    lastMessage.includes("service") ||
    lastMessage.includes("what do you") ||
    lastMessage.includes("what can")
  ) {
    return "We offer a comprehensive range of dental services including:\n\n🦷 General Dentistry: Checkups, cleanings, fillings\n🏥 Restorative: Root canals, crowns, bridges\n✨ Cosmetic: Teeth whitening, veneers\n🦴 Surgical: Extractions, implants\n😁 Orthodontics: Braces, Invisalign\n\nWould you like to book an appointment for any of these services?";
  }

  // Check if asking about hours
  if (
    lastMessage.includes("hours") ||
    lastMessage.includes("open") ||
    lastMessage.includes("when")
  ) {
    return "Our office hours are:\n\n📅 Monday - Friday: 9:00 AM - 5:00 PM\n📅 Saturday: 9:00 AM - 2:00 PM\n📅 Sunday: Closed\n\nFor emergencies after hours, please call (555) 123-9999.\n\nWould you like to schedule an appointment?";
  }

  // Check if asking about insurance
  if (lastMessage.includes("insurance") || lastMessage.includes("accept")) {
    return "Yes, we accept most major dental insurance plans including:\n\n💳 Delta Dental\n💳 Cigna\n💳 Aetna\n💳 MetLife\n💳 United Healthcare\n💳 And many others\n\nFor specific coverage details, please call us at (555) 123-4567 or provide your insurance information when booking.\n\nWould you like to schedule an appointment?";
  }

  // Appointment booking flow
  if (
    lastMessage.includes("book") ||
    lastMessage.includes("appointment") ||
    lastMessage.includes("schedule")
  ) {
    if (!appointment.name) {
      return "I'd be happy to help you book an appointment! Let's start with your full name. What's your name?";
    }
  }

  // Progressive data collection
  if (appointment.name && !appointment.phone) {
    return `Thank you, ${appointment.name}! What's the best phone number to reach you at?`;
  }

  if (appointment.phone && !appointment.email) {
    return "Great! And what's your email address?";
  }

  if (appointment.email && !appointment.reason) {
    return "Perfect! What's the reason for your visit? (For example: routine cleaning, checkup, tooth pain, cosmetic consultation, etc.)";
  }

  if (appointment.reason && !appointment.date) {
    return "Got it! What date works best for you? We're open Monday-Friday 9 AM-5 PM, and Saturday 9 AM-2 PM.";
  }

  if (appointment.date && !appointment.time) {
    return "What time would you prefer? We have morning (9 AM - 12 PM), afternoon (12 PM - 3 PM), and late afternoon (3 PM - 5 PM) slots available.";
  }

  // All information collected
  if (
    appointment.name &&
    appointment.phone &&
    appointment.email &&
    appointment.date &&
    appointment.time &&
    appointment.reason
  ) {
    return `Perfect! Let me confirm your appointment details:\n\n👤 Name: ${appointment.name}\n📞 Phone: ${appointment.phone}\n✉️ Email: ${appointment.email}\n📅 Date: ${appointment.date}\n🕐 Time: ${appointment.time}\n🦷 Reason: ${appointment.reason}\n\nYour appointment request has been received! Our team will call you within 24 hours to confirm your appointment. Is there anything else I can help you with?`;
  }

  // Default friendly response
  return "I'm here to help! You can:\n\n📅 Book an appointment\n🕐 Check our office hours\n🦷 Learn about our services\n💳 Ask about insurance\n\nWhat would you like to do?";
}

export async function POST(req: Request) {
  try {
    const { messages, appointment } = await req.json();

    // Analyze the latest message for appointment data
    const updatedAppointment = analyzeAppointmentData(messages, appointment || {});

    // Generate contextual response
    const responseMessage = generateAIResponse(messages, updatedAppointment);

    return NextResponse.json({
      message: responseMessage,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: "I apologize, but I'm having trouble processing your request. Please try again." },
      { status: 500 }
    );
  }
}
