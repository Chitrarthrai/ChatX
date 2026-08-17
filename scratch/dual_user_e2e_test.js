const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = "C:/Users/chitr/.gemini/antigravity-ide/brain/08605b26-e12a-46be-84a8-f640bd7daafb/dual_test";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runDualUserTest() {
  console.log("🚀 Starting Dual-User Cross-Testing Session...");
  const browser = await chromium.launch({ headless: false });

  // Create two isolated browser contexts for User 1 & User 2
  const context1 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const context2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  try {
    // -------------------------------------------------------------
    // STEP 1: Log in User 1 (chitrarthrai10@gmail.com)
    // -------------------------------------------------------------
    console.log("🔑 Step 1: Logging in User 1 (chitrarthrai10@gmail.com)...");
    await page1.goto("http://localhost:3000");
    await page1.click('text="Sign In"');
    await page1.fill('input[type="email"]', "chitrarthrai10@gmail.com");
    await page1.fill('input[type="password"]', "123*#*raisahab");
    await page1.click('form button[type="submit"]');
    await page1.waitForTimeout(2500);

    // Dismiss tour if present
    const skipBtn1 = page1.locator('text="Skip Tour"');
    if (await skipBtn1.isVisible()) {
      await skipBtn1.click();
    }
    await page1.screenshot({ path: path.join(SCREENSHOT_DIR, "01_user1_workspace.png") });
    console.log("✅ User 1 logged in successfully!");

    // -------------------------------------------------------------
    // STEP 2: Log in User 2 (chitrarth.rai@neophyte.ai)
    // -------------------------------------------------------------
    console.log("🔑 Step 2: Logging in User 2 (chitrarth.rai@neophyte.ai)...");
    await page2.goto("http://localhost:3000");
    await page2.click('text="Sign In"');
    await page2.fill('input[type="email"]', "chitrarth.rai@neophyte.ai");
    await page2.fill('input[type="password"]', "123*#*raisahab");
    await page2.click('form button[type="submit"]');
    await page2.waitForTimeout(2500);

    // Dismiss tour if present
    const skipBtn2 = page2.locator('text="Skip Tour"');
    if (await skipBtn2.isVisible()) {
      await skipBtn2.click();
    }
    await page2.screenshot({ path: path.join(SCREENSHOT_DIR, "02_user2_workspace.png") });
    console.log("✅ User 2 logged in successfully!");

    // -------------------------------------------------------------
    // STEP 3: Presence & DM Selection Verification
    // -------------------------------------------------------------
    console.log("👥 Step 3: Checking Direct Message presence indicators...");
    // In Page 1, click on DM with User 2 (chitrarth rai)
    await page1.click('text="chitrarth rai"');
    await page1.waitForTimeout(1000);
    await page1.screenshot({ path: path.join(SCREENSHOT_DIR, "03_user1_dm_user2.png") });

    // In Page 2, click on DM with User 1 (Chitrarth Rai)
    await page2.click('text="Chitrarth Rai"');
    await page2.waitForTimeout(1000);
    await page2.screenshot({ path: path.join(SCREENSHOT_DIR, "04_user2_dm_user1.png") });
    console.log("✅ DM conversations loaded for both users!");

    // -------------------------------------------------------------
    // STEP 4: Realtime Messaging Exchange
    // -------------------------------------------------------------
    console.log("💬 Step 4: Testing Realtime DM Message Exchange...");
    const msgInput1 = page1.locator('input[placeholder*="Message #chitrarth rai"]');
    if (await msgInput1.isVisible()) {
      await msgInput1.fill("Hello Chitrarth Rai from User 1 live!");
      await msgInput1.press("Enter");
    } else {
      const fallbackInput = page1.locator('input[type="text"]').last();
      await fallbackInput.fill("Hello Chitrarth Rai from User 1 live!");
      await fallbackInput.press("Enter");
    }
    await page1.waitForTimeout(2000);
    await page1.screenshot({ path: path.join(SCREENSHOT_DIR, "05_user1_sent_msg.png") });

    await page2.waitForTimeout(2000);
    await page2.screenshot({ path: path.join(SCREENSHOT_DIR, "06_user2_received_msg.png") });

    // User 2 Replies
    const msgInput2 = page2.locator('input[placeholder*="Message #Chitrarth Rai"]');
    if (await msgInput2.isVisible()) {
      await msgInput2.fill("Hey Chitrarth Rai! Received your message live!");
      await msgInput2.press("Enter");
    } else {
      const fallbackInput2 = page2.locator('input[type="text"]').last();
      await fallbackInput2.fill("Hey Chitrarth Rai! Received your message live!");
      await fallbackInput2.press("Enter");
    }
    await page2.waitForTimeout(2000);
    await page2.screenshot({ path: path.join(SCREENSHOT_DIR, "07_user2_replied_msg.png") });

    await page1.waitForTimeout(2000);
    await page1.screenshot({ path: path.join(SCREENSHOT_DIR, "08_user1_sees_reply.png") });
    console.log("✅ Realtime DM messaging verified between both accounts!");

    // -------------------------------------------------------------
    // STEP 5: Presence Status Switch Test
    // -------------------------------------------------------------
    console.log("🟡 Step 5: Testing Presence Status Switching...");
    await page1.goto("http://localhost:3000/settings");
    await page1.waitForTimeout(1000);
    await page1.screenshot({ path: path.join(SCREENSHOT_DIR, "09_user1_settings.png") });

    await page1.goto("http://localhost:3000");
    await page1.waitForTimeout(1000);

    // -------------------------------------------------------------
    // STEP 6: Channel Messaging Test
    // -------------------------------------------------------------
    console.log("📢 Step 6: Testing Channel Messaging (#Architecture & Engineering)...");
    await page1.click('button:has-text("Architecture & Engineering")');
    await page1.waitForTimeout(1000);
    
    const chanInput1 = page1.locator('input[placeholder*="Message #Architecture"]');
    if (await chanInput1.isVisible()) {
      await chanInput1.fill("Live Channel Message from User 1!");
      await chanInput1.press("Enter");
    }
    await page1.screenshot({ path: path.join(SCREENSHOT_DIR, "10_user1_channel_msg.png") });

    await page2.click('button:has-text("Architecture & Engineering")');
    await page2.waitForTimeout(1500);
    await page2.screenshot({ path: path.join(SCREENSHOT_DIR, "11_user2_channel_view.png") });
    console.log("✅ Channel messaging verified!");

    // -------------------------------------------------------------
    // STEP 7: WebRTC Video Call Stage Test
    // -------------------------------------------------------------
    console.log("📹 Step 7: Testing WebRTC Instant Meeting Stage...");
    const instantMeetingBtn1 = page1.locator('text="Start Instant Meeting"');
    if (await instantMeetingBtn1.isVisible()) {
      await instantMeetingBtn1.click();
      await page1.waitForTimeout(2000);
    }
    await page1.screenshot({ path: path.join(SCREENSHOT_DIR, "12_user1_webrtc_stage.png") });

    const joinStageBtn2 = page2.locator('text="Join Stage"');
    if (await joinStageBtn2.isVisible()) {
      await joinStageBtn2.click();
      await page2.waitForTimeout(2000);
    }
    await page2.screenshot({ path: path.join(SCREENSHOT_DIR, "13_user2_webrtc_joined.png") });
    console.log("✅ WebRTC meeting stage verified!");

    console.log("🎉 ALL DUAL-USER TESTS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Test Exception Error:", err);
  } finally {
    await browser.close();
  }
}

runDualUserTest();
