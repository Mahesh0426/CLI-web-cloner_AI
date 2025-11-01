import inquirer from "inquirer";
import gradient from "gradient-string";
import figlet from "figlet";

// Sleep function to introduce delays
async function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Using gradient to display welcome message
async function usingGradient() {
  console.clear();
  const msg = `Welcome to  \tCLI Web Cloner`;

  figlet(msg, (err, data) => {
    console.log(gradient.rainbow.multiline(data));
  });
}
await usingGradient();

// Function to ask user questions
async function askQuestions() {
  await sleep();
  const questions = [
    {
      name: "url",
      type: "input",
      message: "Enter the URL of the website to clone:",
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
  const answers = await askQuestions();
  console.log(answers);
}

main();
