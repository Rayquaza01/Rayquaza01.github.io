const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItFootnote = require("markdown-it-footnote");

const sharp = require("sharp");

const monthText = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Formats the date as Year Month, Day
 * @param {Date} date
 * @returns {string}
 */
function toReadableDate(date) {
  const year = date.getUTCFullYear().toString();
  const month = monthText[date.getUTCMonth()];
  const day = date.getUTCDate().toString();
  return `${month} ${day}, ${year}`;
}

/**
 * Formats the date as YYYY/MM/DD
 * @param {Date} date
 * @returns {string}
 */
function toUTCDatePermalink(date) {
  const year = date.getUTCFullYear().toString();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
}

async function ImageWidth(src) {
  const metadata = await sharp(src.substring(1)).metadata();

  return metadata.width;
}

async function ImageHeight(src) {
  const metadata = await sharp(src.substring(1)).metadata();

  return metadata.height;
}

module.exports = function (eleventyConfig) {
  const markdownLib = markdownIt({html: true, typographer: true});
  markdownLib
    .use(markdownItFootnote)
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.linkInsideHeader()
    });
  eleventyConfig.setLibrary("md", markdownLib);

  // https://alex.pearwin.com/2020/06/jekyll-to-eleventy/#cross-referencing-posts
  // Define a posts collection for all blog posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_posts/**/*.md");
  });

  eleventyConfig.addCollection("drafts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_drafts/**/*.md");
  });

  // Define a post_url Liquid tag for cross referencing
  // https://rusingh.com/articles/2020/04/24/implement-jekyll-post-url-tag-11ty-shortcode/
  eleventyConfig.addShortcode("post_url", (collection, slug) => {
    try {
      if (collection.length < 1) {
        throw "Collection appears to be empty";
      }
      if (!Array.isArray(collection)) {
        throw "Collection is an invalid type - it must be an array!";
      }
      if (typeof slug !== "string") {
        throw "Slug is an invalid type - it must be a string!";
      }

      const found = collection.find(p => p.fileSlug == slug);
      if (found === 0 || found === undefined) {
        throw `${slug} not found in specified collection.`;
      } else {
        return found.url;
      }
    } catch (e) {
      console.error(
        `An error occured while searching for the url to ${slug}. Details:`,
        e
      );
    }
  });

  // When `permalink` is false, the file is not written to disk
  eleventyConfig.addGlobalData("eleventyComputed.permalink", function () {
    return (data) => {
      // Always skip during non-watch/serve builds
      if (data.draft && !process.env.BUILD_DRAFTS) {
        return false;
      }

      return data.permalink;
    };
  });

  // When `eleventyExcludeFromCollections` is true, the file is not included in any collections
  eleventyConfig.addGlobalData(
    "eleventyComputed.eleventyExcludeFromCollections",
    function () {
      return (data) => {
        // Always exclude from non-watch/serve builds
        if (data.draft && !process.env.BUILD_DRAFTS) {
          return true;
        }

        return data.eleventyExcludeFromCollections;
      };
    }
  );

  eleventyConfig.on("eleventy.before", ({ runMode }) => {
    // Set the environment variable
    if (runMode === "serve" || runMode === "watch") {
      process.env.BUILD_DRAFTS = true;
    }
  });

  eleventyConfig.addLiquidFilter("ImageWidth", ImageWidth);
  eleventyConfig.addLiquidFilter("ImageHeight", ImageHeight);

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
      name: "posts"
    },
    metadata: {
      language: "en",
      title: "Arnaught's Blog",
      subtitle: "",
      base: "https://Rayquaza01.github.io/",
      author: {
        name: "Arnaught"
      }
    }
  });

  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy("assets")

  eleventyConfig.addPassthroughCopy({
    "node_modules/photoswipe/dist/photoswipe-lightbox.esm.min.js": "assets/js/photoswipe/photoswipe-lightbox.esm.min.js",
    "node_modules/photoswipe/dist/photoswipe.esm.min.js": "assets/js/photoswipe/photoswipe.esm.min.js",
    "node_modules/photoswipe/dist/photoswipe.css": "assets/css/photoswipe.css"
  });

  eleventyConfig.addFilter("keys", obj => Object.keys(obj));

  eleventyConfig.addNunjucksFilter("toUTCDatePermalink", toUTCDatePermalink);
  eleventyConfig.addLiquidFilter("toUTCDatePermalink", toUTCDatePermalink);

  eleventyConfig.addLiquidFilter("toReadableDate", toReadableDate);
  eleventyConfig.addNunjucksFilter("toReadableDate", toReadableDate)

  return {
    dir: {
      layouts: "_layouts",
      includes: "_includes"
    }
  }
}
