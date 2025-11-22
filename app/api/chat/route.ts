import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, shouldOfferReport } from '@/lib/mock-ai';
import type { ChatMessage } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Generate AI response using mock AI
    const response = generateAIResponse(messages as ChatMessage[]);

    // Check if we should offer to generate report
    const offerReport = shouldOfferReport(messages as ChatMessage[]);

    return NextResponse.json({
      response,
      offerReport,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
