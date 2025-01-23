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

  log.info(`Starting Program for all accounts:`, tokens.length);

  const accountsProcessing = tokens.map(async (token, index) => {
    const proxy = proxies[index % proxies.length] || null;

    // Start processing the account
    await processAccount(token, index, proxy);
  });

  // Wait for all accounts to be processed
  await Promise.all(accountsProcessing);
};

const processAccount = async (token, index, proxy) => {
  try {
    const userData = await utils.getUserInfo(token, proxy);
    
    if (userData?.data) {
      const { email, verified, current_tier, points_balance } = userData.data;
      const value = `Email: ${email} | Tier: ${current_tier} | Points: ${points_balance.toFixed(2)} | Verified: ${verified}`;
      log.info(`Account ${index + 1} info:`, value);
    }

    await checkUserRewards(index, token, proxy);

    // Start pinging and checking earnings
    startPingAndEarningsCheck(token, index, proxy);
    
    // Check rewards daily
    setInterval(async () => {
      await checkUserRewards(index, token, proxy);
    }, 1000 * 60 * 60 * 24); // Check every 24 hours

  } catch (error) {
    log.error(`Error processing account ${index}: ${error.message}`);
    // Optionally retry or handle specific errors here
  }
};

const startPingAndEarningsCheck = (token, index, proxy) => {
  setInterval(async () => {
    try {
      const connectRes = await utils.connect(token, proxy);
      
      if (connectRes) {
        if (connectRes.code === 200) {
          log.success(`Ping successfully for account ${index + 1}:`, `${connectRes.message}`);
        } else {
          log.warn(`Ping failed to connect for account ${index + 1}, code: ${connectRes.code}`, ` ${connectRes.message}`);
        }
      } else {
        log.error(`Ping response for account ${index + 1} is null or undefined.`);
      }

      const result = await utils.getEarnings(token, proxy);
      const data = result?.data;
      if (data) {
        const valueEarn = `Points: ${data.earnings.toFixed(2)} | Epoch: ${data.epoch}`;
        log.success(`Earnings result for account ${index + 1}:`, valueEarn);
      } else {
        log.warn(`Earnings result for account ${index + 1}: No earnings data received.`);
      }
      
    } catch (error) {
      log.error(`Error during ping or earnings check for account ${index + 1}: ${error.message}`);
    }
    
  }, 1000 * 30); // Run every 30 seconds
};

const checkUserRewards = async (index, token, proxy) => {
  try {
    const response = await utils.getUserRef(token, proxy);
    const { total_unclaimed_points } = response?.data || { total_unclaimed_points: 0 };
    
    if (total_unclaimed_points > 0) {
      log.info(`Account ${index + 1} has ${total_unclaimed_points} unclaimed points, trying to claim it...`);
      const claimResponse = await utils.claimPoints(token, proxy);
      
      if (claimResponse.code === 200) {
        log.info(`Account ${index + 1} claimed successfully! Claimed ${total_unclaimed_points} points`);
      }
    }
    
  } catch (error) {
    log.error(`Error checking user rewards for account ${index + 1}: ${error.message}`);
  }
};

// Handle graceful shutdown
const handleShutdown = () => {
  log.warn(`Process received termination signal. Cleaning up and exiting...`);
  
  // Perform any necessary cleanup here
  
  process.exit(0);
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

// Run the main function continuously
const runContinuously = async () => {
   while (true) {
     try {
       await main();
     } catch (error) {
       log.error(`Error in main loop: ${error.message}`);
     }
     await delay(1000 * 60); // Delay before restarting the main function
   }
};

// Start the continuous run
runContinuously();
