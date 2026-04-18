#!/usr/bin/env node
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";
import { exec } from "child_process";
import fs from "fs";
import { createSpinner } from "nanospinner";
import chalk from "chalk";

// Resolve the .env path relative to this script's location, NOT current working directory 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

//This for execute the linux/unix commands
async function executeCommand(cmd = "") {
  return new Promise((res, rej) => {
    // Note: Executing commands in process.cwd()
    exec(cmd, { cwd: process.cwd() }, (error, data, stderr) => {
      if (error) {
        return res(`Error running command: ${error.message}\nStderr: ${stderr}`);
      } else {
        res(data || "Command executed successfully with no output.");
      }
    });
  });
}

//This is tool to write readme file
const writeReadmeFile = (content = "") => {
  try {
    const readmePath = path.join(process.cwd(), "README.md");
    fs.writeFileSync(readmePath, content, "utf-8");
    return "README.md has been successfully created at " + readmePath;
  } catch (error) {
    return `Error writing README.md: ${error.message}`;
  }
};

const TOOL_MAP = {
  executeCommand: executeCommand,
  writeReadmeFile: writeReadmeFile,
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const currentDir = process.cwd();
  
  console.log(chalk.blueBright("🚀 Initializing README CLI Agent..."));
  console.log(chalk.dim(`Target directory: ${currentDir}\n`));
  
  const spinner = createSpinner('Thinking...').start();

  // These api calls are stateless (Chain Of Thought)
  const SYSTEM_PROMPT = `
You are a specialized AI agent whose ONLY job is to generate a README.md file.

You MUST follow this workflow strictly:

 1.⁠ ⁠START → Understand the project
 2.⁠ ⁠THINK → Decide what files to inspect
 3.⁠ ⁠TOOL → Use executeCommand to explore the project (Start by running 'ls -la .' in the provided directory)
 4.⁠ ⁠THINK → Build README content
 5.⁠ ⁠TOOL → Call writeReadmeFile with FULL README content
 6.⁠ ⁠OUTPUT → Confirm README.md creation

STRICT RULES:
•⁠  ⁠You ONLY have 2 tools:
  1. executeCommand(command: string)
  2. writeReadmeFile(content: string)

•⁠  ⁠You MUST call writeReadmeFile BEFORE OUTPUT
•⁠  ⁠OUTPUT must ONLY confirm success
•⁠  ⁠NEVER include README content in OUTPUT
•⁠  ⁠NEVER skip TOOL step
•⁠  ⁠ALWAYS explore project using executeCommand first. Always check package.json if it exists.
•⁠  ⁠DO NOT assume the project structure without inspecting it first using executeCommand.

Output format (STRICT JSON):
{
  "step": "START | THINK | TOOL | OBSERVE | OUTPUT",
  "content": "string",
  "tool_name": "string",
  "input": "string"
}
`;

  //This is the message what to give to user
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `Generate a professional README.md for my project located at: ${currentDir}.

You MUST follow these steps in order:
STEP 1: executeCommand("ls -la .")
STEP 2: executeCommand("cat package.json") (if package.json exists)
STEP 3: Check inside important folders (like src, lib, config, etc.) that you found in the directory listing.
STEP 4: Call writeReadmeFile tool with the FULL README.md markdown content
STEP 5: OUTPUT confirming the file was created

The generated README.md MUST include these sections:
 1.⁠ ⁠Project title with badges (license, node version, npm)
 2.⁠ ⁠Short description based on package.json and project files
 3.⁠ ⁠Table of contents
 4.⁠ ⁠Features list
 5.⁠ ⁠Prerequisites (Node.js version, etc.)
 6.⁠ ⁠Getting Started (Clone, install, env vars, run commands based on package.json scripts)
 7.⁠ ⁠Environment variables (.env example with placeholder values, NOT real API keys)
 8.⁠ ⁠Usage with real examples based on your investigation
 9.⁠ ⁠Project folder structure
10.⁠ ⁠Dependencies explanation
11.⁠ ⁠Contributing guidelines
12.⁠ ⁠License
13.⁠ ⁠Author with GitHub/social links

IMPORTANT RULES:
•⁠  ⁠Use real file names and commands from THIS actual project.
•⁠  ⁠NEVER expose real API keys in README, use placeholders like your_api_key_here
•⁠  ⁠Make it detailed, professional and well formatted with emojis
•⁠  ⁠You MUST call writeReadmeFile tool in STEP 4, do NOT skip it
•⁠  ⁠OUTPUT step should only confirm the file was created, NOT contain README content`,
    },
  ];

  while (true) {
    spinner.start({ text: chalk.yellow('Agent is thinking...') });
    
    let response;
    try {
      response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: messages,
      });
    } catch (e) {
      spinner.error({ text: chalk.red("Error calling OpenAI API. Check your network and OPENAI_API_KEY environment variable. " + e.message) });
      break;
    }

    const rawContent = response.choices[0].message.content;
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (err) {
      spinner.error({ text: chalk.red("AI returned invalid JSON: ") + rawContent });
      break;
    }

    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedContent),
    });

    if (parsedContent.step === "START") {
      spinner.update({ text: chalk.cyan(`🔥 ${parsedContent.content}`) });
      continue;
    }

    if (parsedContent.step === "THINK") {
      spinner.update({ text: chalk.dim(`🧠 ${parsedContent.content}`) });
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

      spinner.update({ text: chalk.magenta(`🛠️ Running tool ${toolToCall}...`) });
      
      const responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);
      
      spinner.update({ text: chalk.green(`✅ Tool ${toolToCall} complete.`) });
      
      messages.push({
        role: "developer",
        content: JSON.stringify({ step: "OBSERVE", content: responseFromTool }),
      });
      continue;
    }

    if (parsedContent.step === "OUTPUT") {
      spinner.success({ text: chalk.greenBright(`🤖 ${parsedContent.content}`) });
      
      // Fallback: if README was never written, force write the OUTPUT content
      const wasWritten = messages.some((msg) =>
        msg.content?.includes("README.md has been successfully created"),
      );

      if (!wasWritten) {
        console.log(chalk.yellow("\n⚠️ AI skipped writeReadmeFile — forcing write now..."));
        writeReadmeFile(parsedContent.content);
        console.log(chalk.green("✅ README.md force written!"));
      }
      break;
    }
  }

  console.log(chalk.bold("\nHave a nice day!"));
}

main();
