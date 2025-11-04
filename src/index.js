#!/usr/bin/env node
import inquirer from "inquirer";
import gradient from "gradient-string";
import figlet from "figlet";
import chalk from "chalk";
import { askQuery } from "./ask.js";
import { createSpinner } from "nanospinner";

// Sleep function to introduce delays
async function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Using gradient to display welcome message
function showBanner() {
  console.clear();
  const msg = `Welcome to  \tCLI Web Cloner`;

  figlet(msg, (err, data) => {
    console.log(gradient.rainbow.multiline(data));
  });
}

// Function to ask user questions
async function askQuestions() {
  await sleep();
  const questions = [
    {
      name: "url",
      type: "input",
      message: "\nEnter the URL of the website to clone:",
      validate: function (value) {
        var valid = value.startsWith("http://") || value.startsWith("https://");
        return (
          valid || "Please enter a valid URL starting with http:// or https://"
        );
      },
    },
  ];
  return inquirer.prompt(questions);
}

// Main function to run the program
async function main() {
  showBanner();
  const answers = await askQuestions();

  const spinner = createSpinner(
    `\n🌐 Analyzing: "${answers.url}"...\n`
  ).start();

  while (true) {
    try {
      const result = await askQuery(answers.url);
      console.log(chalk.blueBright("\n✅ Successfully cloned! "));
      if (result) console.log(result);
    } catch (error) {
      console.error(chalk.redBright("❌ Error occurred: "), error);
    }
    console.log(
      chalk.whiteBright("─────────────────────────────────────────────")
    );
    console.clear();
    break;
  }
  console.log(gradient.fruit("\n👋 Bye! Thanks for using Web Clone CLI."));
}

main();
