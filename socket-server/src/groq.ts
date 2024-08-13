import { Response } from "express";
import Groq from "groq-sdk";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
const groq = new Groq({
  apiKey: process.env["GROQ_API_KEY"],
});

const groqContextString =
  "You are a chat bot assistant named Meet-Me AI, you are given array of latest messages, reply to the last message given the conversation context";

//this generator function returns an async iterator, which will return each yielded value as a promise in a for of loop
const responseFromGroq = async (
  messages: { message: string; senderId: string }[] = []
) => {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: groqContextString },
      ...messages
        .map((message) => ({
          role: message.senderId === "assistant" ? "assistant" : "user",
          content: message.message,
        })),
    ] as ChatCompletionMessageParam[],
    model: "llama3-8b-8192",
    max_tokens: 200,
    temperature: 0.7,
  });

  // chatCompletion is an async iterable that contains [Symbol.asyncIterator] which returns an async iterator hence we can use for await loop
  return chatCompletion.choices[0].message.content || "";
};

export default responseFromGroq;
