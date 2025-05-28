// src/app/api/chat/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is not set. Please add it to your .env.local file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const currentUserMessageText = messages[messages.length - 1].text;

    // --- Updated Tool Definitions ---
    const tools = [
      {
        functionDeclarations: [
          {
            name: 'execute_silent_action',
            description: 'Executes a specific action without requiring a verbal response from the AI. Use this when the user explicitly asks for an action like copying text or opening a URL.',
            parameters: {
              type: 'object',
              properties: {
                action_type: {
                  type: 'string',
                  description: 'The type of silent action to perform.',
                  enum: ['copy_text', 'open_url'], // Define allowed action types
                },
                content: {
                  type: 'string',
                  description: 'The content or data related to the action (e.g., text to copy, URL to open).',
                },
              },
              required: ['action_type', 'content'],
            },
          },
        ],
      },
      // More tools can go here in the future
    ];
    // --- End Updated Tool Definitions ---

    const chat = model.startChat({
      history: history,
      tools: tools,
      toolCallingConfig: {
        mode: 'AUTO',
      },
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessageStream(currentUserMessageText);

    const customReadable = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const call = chunk.candidates?.[0]?.content?.parts?.find(
            (part) => part.functionCall
          );

          if (call) {
            controller.enqueue(JSON.stringify({ type: 'tool_call', data: call.functionCall }) + '\n');
            controller.close();
            return;
          }

          const textPart = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (textPart) {
            controller.enqueue(JSON.stringify({ type: 'text', data: textPart }) + '\n');
          }
        }
        controller.close();
      },
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'application/jsonl',
        'Transfer-Encoding': 'chunked',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      try {
        const errorData = await error.response.json();
        console.error('API Response Data:', errorData);
      } catch (jsonError) {
        console.error('Could not parse API error response as JSON.');
      }
    }
    return NextResponse.json(
      { error: 'Failed to get response from AI. Please try again.' },
      { status: 500 }
    );
  }
}