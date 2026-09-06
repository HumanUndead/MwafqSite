import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  askChatbotStream,
  CHATBOT_MAX_INPUT_LENGTH,
} from '@/modules/chatbot/server/chatbotService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message, data: null }, { status });
}

export async function POST(request: NextRequest) {
  let text: unknown;

  try {
    ({ text } = await request.json());
  } catch {
    return fail('Invalid request body', 400);
  }

  if (typeof text !== 'string' || text.trim().length === 0) {
    return fail('Message is required', 400);
  }

  if (text.length > CHATBOT_MAX_INPUT_LENGTH) {
    return fail('Message is too long', 413);
  }

  try {
    const upstream = await askChatbotStream(text.trim(), request.signal);

    if (!upstream.ok || !upstream.body) {
      return fail('Chat service is unavailable', 502);
    }

    return new Response(upstream.body, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      },
    });
  } catch {
    return fail('Chat service is unavailable', 502);
  }
}
