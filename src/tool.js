import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";
import chalk from "chalk";
import { input as promptInput } from "@inquirer/prompts";
import { getAllLinks } from "./getAllLinks.js";
import { scrapeWebsite } from "./scrapper.js";

//for executing the command
export async function executeCommand(cmd = "") {
  return new Promise((res, rej) => {
    exec(cmd, (error, data) => {
      if (error) {
        return res(`Error running command ${error}`);
      } else {
        res(data);
      }
    });
  });
}

//slug extraction function
function getSlugFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Remove trailing slash
    const cleanPath = pathname.replace(/\/$/, "");

    // If empty or just "/", return "index"
    if (!cleanPath || cleanPath === "/") {
      return "index";
    }

    // Get the last part of the path
    const parts = cleanPath.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];

    // Remove any file extensions and sanitize
    const slug = lastPart
      .replace(/\.html?$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    return slug || "index";
  } catch (error) {
    console.error("Error parsing URL:", error);
    return "index";
  }
}

//for scraping the site also save
export async function scraper(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    const folderName = `${hostname.split(".")[0]}-clone`;
    const allLinks = await getAllLinks(url);

    if (allLinks.length >= 1) {
      for (const link of allLinks) {
        console.log(`🌐 Found link: ${link}`);

        // slug extraction function
        const slug = getSlugFromUrl(link);
        console.log(`⚙️ Scraping page: ${link} → ${slug}.html`);

        const {
          html,
          cssFiles,
          jsFiles,
          imageFiles = [],
        } = await scrapeWebsite(link, slug, folderName);

        // Create folder structure first
        await fs.mkdir(folderName, { recursive: true });
        await fs.mkdir(path.join(folderName, "css"), { recursive: true });
        await fs.mkdir(path.join(folderName, "js"), { recursive: true });
        await fs.mkdir(path.join(folderName, "images"), { recursive: true });

        // Save HTML
        const htmlFileName = `${slug}.html`;
        await fs.writeFile(path.join(folderName, htmlFileName), html);
        console.log(`✅ Saved HTML: ${htmlFileName}`);

        // Save CSS
        for (let i = 0; i < cssFiles.length; i++) {
          await fs.writeFile(
            path.join(folderName, cssFiles[i].filename),
            cssFiles[i].content
          );
        }
        console.log(`✅ Saved ${cssFiles.length} CSS files`);

        // Save JS
        for (let i = 0; i < jsFiles.length; i++) {
          await fs.writeFile(
            path.join(folderName, jsFiles[i].filename),
            jsFiles[i].content
          );
        }
        console.log(`✅ Saved ${jsFiles.length} JS files`);

        // Save images
        for (let i = 0; i < imageFiles.length; i++) {
          const filePath = path.join(folderName, imageFiles[i].filename);
          await fs.writeFile(filePath, imageFiles[i].content);
        }
        console.log(`✅ Saved ${imageFiles.length} images`);
      }
    }

    return `✅ Successfully scraped and saved website to folder '${folderName}'`;
  } catch (error) {
    console.error("Full error:", error);
    return `❌ Error during scraping or file writing: ${error.message}`;
  }
}

//for user inquiry
export const inquiry = async (query) => {
  const message = await promptInput({
    message: chalk.greenBright(query),
  });
  return message;
};
