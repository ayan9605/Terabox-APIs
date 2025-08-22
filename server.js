const express = require("express");
const { chromium } = require("playwright");

let isStopped = false;
let shouldSkip = false;

function stopDownload() {
  isStopped = true;
}
function skipDownload() {
  shouldSkip = true;
}
function logHeader(title, log) {
  const line = "═".repeat(title.length + 4);
  log(`\n${line}\n  ${title}\n${line}`);
}

// 🔑 main fetch function (instead of saving file, returns dlink)
async function fetchDlink(link, log) {
  let dlinkFound = null;
  let fileName = null;
  let fileSize = null;

  const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/brave-browser", // check actual path
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--window-size=1280,800"
  ]
});

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // listen for API responses
  page.on("response", async (response) => {
    try {
      const url = response.url();

      if (url.includes("https://ronnieverse.site/v2/api") && response.request().method() === "POST") {
        const json = await response.json();

        // skip empty response (the first one is usually empty)
        if (!json || Object.keys(json).length === 0) return;

        log("📡 API response captured:", url);

        // case 1: list[]
        if (json.list && json.list.length > 0) {
        const first = json.list[0];
          if (first?.dlink) {
           dlinkFound = first.dlink;
         log(`✅ Found dlink (list): ${dlinkFound}`);
        }
        if (first?.server_filename) {
        fileName = first.server_filename;
        }
        if (first?.size) {
        fileSize = first.size;
        }
        }

        // case 2: direct dlink
        if (json.dlink) {
           dlinkFound = json.dlink;
            log(`✅ Found dlink (direct): ${dlinkFound}`);
        }
        if (json.server_filename) {
            fileName = json.server_filename;
        }
        if (json.size) {
         fileSize = json.size;
        }

        // case 3: urls[]
        if (json.urls && json.urls.length > 0) {
          dlinkFound = json.urls[0].url;
          log(`✅ Found dlink (urls): ${dlinkFound}`);
        }
        if (fileName) {
          log(`📂 File Name: ${fileName}`);
        }
        if (fileSize) {
          const mb = (fileSize / (1024 * 1024)).toFixed(2);
          const gb = (fileSize / (1024 * 1024 * 1024)).toFixed(2);
           log(`📦 File Size: ${fileSize} bytes (${mb} MB / ${gb} GB)`);
        }
      }
    } catch (err) {
      log("⚠️ Parse error:", err.message);
    }
  });

  try {
    await page.goto("https://teraboxdl.site/");
    log("🌐 Opened teraboxdl.site");

    // accept cookies if needed
    try {
      const acceptBtn = await page.waitForSelector('button:has-text("Accept All")', { timeout: 1000 });
      await acceptBtn.click();
      log("🍪 Cookie popup accepted.");
    } catch {
      log("👍 No cookie popup.");
    }

    try {
  const adBtn = await page.waitForSelector('span.fc-list-item-text.fc-rewarded-ad-option-text', { timeout: 2000 });
  await adBtn.click();
  log("📺 Ad clicked. Waiting 1 minute...");
  await page.waitForTimeout(60000); // wait 1 min

  try {
    const closeAd = await page.waitForSelector('#close-button[role="button"]', { timeout: 5000 });
    await closeAd.click();
    log("❌ Ad closed. Continuing...");
  } catch {
    log("⚠️ Close button not found after ad.");
  }

} catch {
  log("👍 No ad popup found.");
    }

    // fill input
    await page.fill('input[placeholder="Paste your Terabox URL here..."]', link);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000);

    try {
      const closeAdBtn = await page.waitForSelector('button[aria-label="Close advertisement"]', { timeout: 2000 });
      await closeAdBtn.click();
      log("❎ Closed advertisement popup.");
    } catch {
      log("👍 No advertisement popup found.");
    }
    log("🔍 Submitted link...");


    // wait for fetch button if required
    //try {
    //  const fetchBtn = await page.waitForSelector('button:has(span:has(span:text("Fetch Files")))', { timeout: 4000 });
    //  await fetchBtn.click();
    //  log("📥 Clicked Fetch Files.");
    //} catch {
    //  log("⚠️ Fetch button not found (maybe auto-fetch).");
    //}

    // wait max 30s for dlink to be captured
    let waited = 0;
    while (!dlinkFound && waited < 30000) {
      await page.waitForTimeout(500);
      waited += 500;
    }
  } catch (err) {
    log(`❌ Error: ${err.message}`);
  } finally {
    await browser.close();
  }

  return {
  dlink: dlinkFound || null,
  name: fileName || null,
  size: (fileSize / (1024 * 1024)).toFixed(2) + " MB" || null
  } //fileSize
    //? {
        //bytes: fileSize,
        //mb: (fileSize / (1024 * 1024)).toFixed(2) + " MB",
        //gb: (fileSize / (1024 * 1024 * 1024)).toFixed(2) + " GB"
      //}
    //: null
//};
}

// 🚀 Express API
const app = express();

app.get("/api", async (req, res) => {
  const link = req.query.link;
  if (!link) return res.status(400).json({ success: false, error: "Missing link parameter ?link=" });

  console.log(`📎 Received link: ${link}`);

  const dlink = await fetchDlink(link, console.log);

  if (dlink) {
    res.json({ success: true, dlink });
  } else {
    res.json({ success: false, error: "No dlink found" });
  }
});

app.listen(3000, () => {
  console.log("✅ API running at http://localhost:3000/api?");
});

// exports (optional)
module.exports = { stopDownload, skipDownload };
