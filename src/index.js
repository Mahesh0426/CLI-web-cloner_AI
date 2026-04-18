#!/usr/bin/env node
import gradient from "gradient-string";
import figlet from "figlet";
import chalk from "chalk";
import { userQuery } from "./ask.js";
import { createSpinner } from "nanospinner";
import { select, input, confirm } from "@inquirer/prompts";

// Sleep function to introduce delays
async function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Using gradient to display welcome message
function showBanner() {
  const msg = figlet.textSync("CLI WEB CLONER", { horizontalLayout: "full" });
  console.log(gradient.rainbow.multiline(msg));
  console.log(gradient.passion("✨ Welcome to the CLI Web Cloner ✨\n"));
}

// Function to ask user questions
async function askQuestions() {
  await sleep();
  // const questions = [
  //   {
  //     name: "url",
  //     type: "input",
  //     message: "\nEnter the URL of the website to clone:",
  //     validate: function (value) {
  //       var valid = value.startsWith("http://") || value.startsWith("https://");
  //       return (
  //         valid || "Please enter a valid URL starting with http:// or https://"
  //       );
  //     },
  //   },
  // ];
  // return inquirer.prompt(questions);

  const questions = await input({
    message: chalk.green("Enter the URL of the website to clone: "),
    validate: function (value) {
      var valid = value.startsWith("http://") || value.startsWith("https://");
      return (
        valid || "Please enter a valid URL starting with http:// or https://"
      );
    },
  });

  return questions;
}

// Main function to run the program
async function main() {
  showBanner();
  const answers = await askQuestions();

  //Create spinner
  const spinner = createSpinner();

  try {
    // Start spinner for analysis phase
    spinner.start(`🌐 Analyzing: "${answers}"...\n`);
    await sleep(2000);
    spinner.stop();

    // Get LLM response
    const result = await userQuery(answers);

    // Show success only after LLM process completes
    spinner.success({
      text: chalk.greenBright.bold(" Successfully cloned!"),
    });
    // Display LLM result if available
    if (result) console.log(chalk.blueBright(result));
  } catch (error) {
    spinner.error({
      text: chalk.redBright(" Error occurred while analyzing."),
    });
    console.error(error);
  }

  console.log(
    chalk.whiteBright(
      "---------------------------------------------------------------------------"
    )
  );
  console.log(
    gradient.rainbow(
      `\n😊 Happy Coding  \n👋Thank you for using ClI Web Cloner`
    )
  );
}

main();
