import * as utils from "./utils/api.js";
import banner from "./utils/banner.js";
import log from "./utils/logger.js";
import { readFile, delay } from "./utils/helper.js";

const main = async () => {
  log.info(banner);
  await delay(3);
  const tokens = await readFile("tokens.txt");
  if (tokens.length === 0) {
    log.error("No tokens found in tokens.txt");
    return;
  }
  const proxies = await readFile("proxy.txt");
  if (proxies.length === 0) {
    log.warn("Running without proxy...");
  }

  try {
    log.info(`Starting Program for all accounts:`, tokens.length);

    const accountsProcessing = tokens.map(async (token, index) => {
      const proxy = proxies[index % proxies.length] || null;
      try {
        const userData = await utils.getUserInfo(token, proxy);

        if (userData?.data) {
          const { email, verified, current_tier, points_balance } = userData.data;
          const value = `Email: ${email} | Tier: ${current_tier} | Points: ${points_balance.toFixed(2)} | Verified: ${verified}`;
          log.info(`Account ${index + 1} info:`, value);
        }

        await checkUserRewards(token, proxy);

        setInterval(async () => {
          const connectRes = await utils.connect(token, proxy);
          const { message, code } = connectRes;
          if (code === 200) {
            log.success(`Ping successfully for account ${index + 1}:`, `${message}`);
          } else {
            log.warn(`Ping failed to connect for account ${index + 1}, code: ${code}`, ` ${message}`);
          }

          const result = await utils.getEarnings(token, proxy);
          const data = result?.data;
          if (data) {
            const valueEarn = `Points: ${data.earnings.toFixed(2)} | Epoch: ${data.epoch}`;
            log.success(`Earnings result for account ${index + 1}:`, valueEarn);
          } else {
            log.warn(`Earnings result for account ${index + 1}: No earnings data received.`);
          }
        }, 1000 * 30); // Run every 30 seconds

        setInterval(async () => {
          await checkUserRewards(token, proxy);
        }, 1000 * 60 * 60 * 24); // check every 24 hours
      } catch (error) {
        log.error(`Error processing account ${index}: ${error.message}`);
      }
    });

    await Promise.all(accountsProcessing);
  } catch (error) {
    log.error(`Error in main loop: ${error.message}`);
  }
};

const checkUserRewards = async (token, proxy) => {
  try {
    const response = await utils.getUserRef(token, proxy);
    const { total_unclaimed_points } = response?.data || 0;
    if (total_unclaimed_points > 0) {
      log.info(`Account ${index + 1} has ${total_unclaimed_points} unclaimed points, trying to claim it...`);
      const claimResponse = await utils.claimPoints(token, proxy);
      if (claimResponse.code === 200) {
        log.info(`Account ${index + 1} claimed successfully! ${total_unclaimed_points} points`);
      }
    }
  } catch (error) {
    log.error(`Error checking user rewards: ${error.message}`);
  }
};

process.on("SIGINT", () => {
  log.warn(`Process received SIGINT, cleaning up and exiting program...`);
  process.exit(0);
});

process.on("SIGTERM", () => {
  log.warn(`Process received SIGTERM, cleaning up and exiting program...`);
  process.exit(0);
});

// Run the main function
main();
