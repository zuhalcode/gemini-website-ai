"use client";

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

import ReactMarkdown from "react-markdown";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [output, setOutput] = useState<string>("");

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrompt(value);
  };

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const API_KEY = process.env.NEXT_PUBLIC_API_KEY as string;
    setOutput("Generating ...");

    try {
      const contents = [{ role: "user", parts: [{ text: prompt }] }];

      const generativeAI = new GoogleGenerativeAI(API_KEY);
      const model = generativeAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });
      const result = await model.generateContentStream({ contents });

      let buffer: string[] = [];
      for await (let response of result.stream) {
        buffer.push(response.text());
        setOutput(buffer.join(""));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="flex items-center justify-center my-10">
      <div className="bg-gray-900  rounded-md max-w-xl px-10 py-3">
        <h1 className="text-3xl font-bold text-center">Gemini AI Form</h1>

        {/* Form */}
        <form className="p-3  w-full" onSubmit={handleOnSubmit}>
          <div className="flex gap-3 justify-center">
            <input
              type="text"
              className="border border-white rounded-lg px-5 py-2 bg-transparent text-sm"
              placeholder="Input Prompt"
              value={prompt}
              onChange={handleOnChange}
            />

            <button className="bg-green-500 hover:bg-green-600 px-3 rounded-lg">
              Submit
            </button>
          </div>
        </form>

        {/* Output */}
        <div className="w-full max-h-96 overflow-y-auto">
          <ReactMarkdown className="text-justify pr-5 pt-2">
            {output}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  );
}
