# readme-agent 🚀

[![license](https://img.shields.io/badge/license-Private-blue.svg)](https://img.shields.io/badge/license-Private-blue.svg) [![node version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/) [![npm version](https://img.shields.io/badge/npm-%5E5.0.0-blue.svg)](https://www.npmjs.com/)

## 📋 Short Description

`readme-agent` is a private Node.js CLI tool designed to automate the creation of professional README.md files for projects by leveraging OpenAI's API. It offers an intelligent and streamlined workflow to generate structured, detailed, and well-formatted README documentation with ease.

## 📑 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [Project Folder Structure](#-project-folder-structure)
- [Dependencies](#-dependencies)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

## ✨ Features

- CLI agent to generate README.md files automatically
- Integration with OpenAI API for AI-powered content generation
- Support for environment variable management via `.env`
- Uses spinners and colorful CLI feedback with `nanospinner` and `chalk`
- Simple command execution utility inside the agent

## 🛠️ Prerequisites

- Node.js version >= 14.0.0
- Yarn or npm package manager
- An OpenAI API key

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd readme_file_create_agent
   ```

2. **Install dependencies**

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Setup environment variables**

   Create a `.env` file in the root directory (if not present) with the following:

   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Run the CLI agent**

   ```bash
   node readmefileAgent.js
   ```

   > Note: The `package.json` mentions a `dev` script running `node src/index.js`, but the `src` folder is not present. Use the above command to run the main script directly.

## 🔑 Environment Variables

```env
# Your OpenAI API key
OPENAI_API_KEY=your_api_key_here
```

> Never share your real API key publicly. Use environment variables to keep them secure.

## 💡 Usage

Run the main CLI script to generate README files:

```bash
node readmefileAgent.js
```

Run globaly with any project

```bash
yarn link  && npm link
```

then run `readme-agent` in any project terminal

```bash
readme-agent
```

This will start the interactive CLI agent that helps generate a README.md file in the current directory based on the project context.

## 📂 Project Folder Structure

```
readme_file_create_agent/
├── .env                 # Environment variables file
├── .git                 # Git repository data
├── .gitignore           # Git ignore rules
├── node_modules/        # Node.js dependencies
├── package.json         # Project config and dependencies
├── readmefileAgent.js   # Main CLI executable file
├── yarn.lock            # Yarn lockfile
```

## 📦 Dependencies

- [`chalk`](https://www.npmjs.com/package/chalk): Terminal string styling
- [`dotenv`](https://www.npmjs.com/package/dotenv): Loads environment variables from `.env`
- [`nanospinner`](https://www.npmjs.com/package/nanospinner): CLI spinner animations
- [`openai`](https://www.npmjs.com/package/openai): Official OpenAI API client

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the repository and submit pull requests or open issues for bugs or improvements.

## 📄 License

This project is marked as private in `package.json`, so it's not publicly licensed.

## 🙋 Author

**Mahesh Kunwar**

- GitHub: [https://github.com/maheshkunwar](https://github.com/maheshkunwar)

---

_Thank you for using `readme-agent`! 🎉_
