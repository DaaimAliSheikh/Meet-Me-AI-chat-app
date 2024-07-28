import { Response } from "express";
import Groq from "groq-sdk";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
const groq = new Groq({
  apiKey: process.env["GROQ_API_KEY"],
});

//this generator function returns an async iterator, which will return each yielded value as a promise in a for of loop
async function* streamFromGroq(messages: ChatCompletionMessageParam[] = []) {
  const chatCompletion = await groq.chat.completions.create({
    messages,
    model: "llama3-8b-8192",
    stream: true, // Enable streaming
    max_tokens: 200,
    temperature: 0.7,
  });

  // chatCompletion is an async iterable that contains [Symbol.asyncIterator] which returns an async iterator hence we can use for await loop
  for await (const chunk of chatCompletion) {
    yield chunk.choices[0].delta?.content;
  }
}

export default streamFromGroq;
