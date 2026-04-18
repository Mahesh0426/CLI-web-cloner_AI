import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";
import { executeCommand, inquiry, scraper } from "./tool.js";

// Get the current directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the .env path relative to project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//create a TOOL_MAP object to map tool names to their corresponding functions
const TOOL_MAP = {
  executeCommand: executeCommand,
  scraper: scraper,
  inquiry: inquiry,
};

export async function userQuery(answers) {
  // System prompt
  const SYSTEM_PROMPT = `
You are a AI assistant named CLI Web Cloner. 
You specialize in cloning websites, and executing terminal commands. 
For any user query, you must first think carefully and break the problem down into smaller, manageable sub-problems. 
Always reason thoroughly before providing any response. Keep thinking and analyzing the problem before giving the actual output.
Before outputing the final result to user you must check once if everything is correct.
You also have list of available tools that you can call based on user query.
    
For every tool call that you make, wait for the OBSERVATION from the tool which is the
response from the tool that you called.

Available Tools For Use :
  - inquiry(query:string): Ask from user 
  - executeCommand(command: string): Takes a linux / unix command for creating the project folder and files
  - scraper(url: string): Takes a URL as input, scrapes the site, and saves files in a folder named after the domain

 Strictly Follow Rules:
    - Strictly follow the output JSON format that i can use directly in js
    - Always follow the output in sequence that is START, THINK, OBSERVE and OUTPUT.
    - Always perform only one step at a time and wait for other step.
    - Alway make sure to do multiple steps of thinking before giving out output.
    - For every tool call always wait for the OBSERVE which contains the output from tool
    - For executing commands, always use the executeCommand tool and command must be support on Windows.
    - You are always on Node Environment
    - If you need any question run inquiry(query:string) tool for that after that you will show output

  Output JSON Format:
    { "step": "START | THINK | OUTPUT | OBSERVE | TOOL" , "content": "string", "tool_name": "string", "input": "STRING" }

   Example:
    User: "I want to clone https://www.example.com/"
    ASSISTANT: { "step": "START", "content": "Oke You have provided me this url https://www.example.com/" }
    ASSISTANT: { "step": "THINK", "content": "I see that there is a tool available scraper which help to create scrap the website" }
    ASSISTANT: { "step": "THINK", "content": "Ok I will run scraper tool to get your content" }
    ASSISTANT: { "step": "THINK", "content": "I think it will take some time to get your content" }
    ASSISTANT: { "step": "THINK", "content": "I have to make some inquiry please answer them" }
    ASSISTANT: { "step": "TOOL", "input": "https://www.example.com/", "tool_name": "scraper" }
    DEVELOPER: { "step": "OBSERVE", "content": "Ok your work is almost done your file is here example-clone" }
    ASSISTANT: { "step": "THINK", "content": "Thanks for wating " }
    ASSISTANT: { "step": "OUTPUT", "content": "Website cloned successfully" }

   
`;
  //initial messages arary to send to gpt
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: answers },
  ];

  //main loop
  while (true) {
    //response from llm
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages,
      temperature: 0.7,
      // max_tokens: 100,
    });

    //parse the response
    const rawContent = response.choices[0].message.content;
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (err) {
      console.error("Failed to parse JSON from assistant:", rawContent, err);
      break;
    }

    //push the assistant response to messages array
    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedContent),
    });

    //handle different steps
    if (parsedContent.step === "START") {
      console.log(`🔥`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log(`\n🧠`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === "TOOL") {
      const toolToCall = parsedContent.tool_name;
      if (!TOOL_MAP[toolToCall]) {
        messages.push({
          role: "developer",
          content: `There is no such tool as ${toolToCall}`,
        });
        continue;
      }
      const responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);
      console.log(
        `🛠️:${toolToCall}(${parsedContent.input}) = `,
        responseFromTool
      );
      //push observation to messages array
      messages.push({
        role: "developer",
        content: JSON.stringify({
          step: "OBSERVE",
          content: responseFromTool,
        }),
      });
      continue;
    }
    //final output
    if (parsedContent.step === "OUTPUT") {
      console.log(`\t🤖`, parsedContent.content);
      break;
    }
  }
  console.log("Done...");
}
