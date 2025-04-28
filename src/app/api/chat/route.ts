import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const message = formData.get("message") as string;
    const images: File[] = [];

    for (let i = 0; formData.get(`image${i}`); i++) {
      images.push(formData.get(`image${i}`) as File);
    }

    const base64Images = await Promise.all(
      images.map(async (image) => {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString("base64");
        return `data:${image.type};base64,${base64String}`;
      })
    );

    const messages = [
      {
        role: "user" as const,
        content: [
          { type: "text", text: message || "이 이미지에 대해 설명해주세요." },
          ...base64Images.map((image) => ({
            type: "image_url",
            image_url: { url: image },
          })),
        ],
      },
    ] as ChatCompletionMessageParam[];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      stream: true,
    });

    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(customReadable, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
