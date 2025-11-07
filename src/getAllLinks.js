import { JSDOM } from "jsdom";
import fetch from "node-fetch";

export const getAllLinks = async (url) => {
  // Downloads the web page HTML
  const response = await fetch(url);

  // Converts the HTML into a string
  const html = await response.text();

  const allLinks = [];
  const confirmLinks = [];

  //Loads HTML into a fake browser dom to  parses HTML string and get a real DOM tree
  const DOM = new JSDOM(html);
  const document = DOM.window.document; //Finds all links in that HTML

  const pageLinks = [...document.querySelectorAll("a")]; //Collect all tags

  // If no links found, return the page itself
  if (pageLinks.length === 0) {
    confirmLinks.push(url);
    return confirmLinks;
  }

  //if there are links loop through all tags
  for (const link of pageLinks) {
    // Get the href attribute
    let hrefAttribute = link.getAttribute("href");
    if (!hrefAttribute) continue;

    // Skip external links
    if (hrefAttribute.startsWith("http")) continue;

    //  Remove leading slash
    hrefAttribute = hrefAttribute.replace(/^\//, "");
    // hrefAttribute = hrefAttribute.startsWith('/') ? hrefAttribute.slice(1) : hrefAttribute;

    allLinks.push(hrefAttribute);
  }

  // Removes duplicate links using a Set.
  const uniqueLinks = [...new Set(allLinks)];

  //  Validate each link by combining with base URL
  for (const link of uniqueLinks) {
    // Construct full absolute URL
    const finalUrl = `${url}/${link}`;
    console.log(`Checking links :${finalUrl}`);

    try {
      // Sends HTTP requests to check if each URL is valid.
      const response = await fetch(finalUrl);
      if (response.ok) {
        confirmLinks.push(finalUrl);
      } else {
        console.log(
          `❌ Invalid Links ${finalUrl}: (status: ${response.status})`
        );
      }
    } catch (error) {
      console.error(`⚠️ Error fetching ${finalUrl}:`, err.message);
    }
  }

  //   Returns only confirmed links
  return confirmLinks;
};
