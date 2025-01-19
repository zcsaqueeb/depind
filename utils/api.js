import randomUseragent from "random-useragent";
import axios from "axios";
import log from "./logger.js";
import { newAgent } from "./helper.js";

const userAgent = randomUseragent.getRandom();
const headers = {
  "User-Agent": userAgent,
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
  Referer: "https://app.depined.org/",
  Origin: "https://app.depined.org",
  "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};

export const registerUser = async (email, password) => {
  const url = "https://api.depined.org/api/user/register";

  try {
    const response = await axios.post(
      url,
      { email, password },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
    log.info("User registered successfully:", response.data.message);
    return response.data;
  } catch (error) {
    log.error("Error registering user:", error.response ? error.response.data : error.message);
    return null;
  }
};

export const loginUser = async (email, password) => {
  const url = "https://api.depined.org/api/user/login";

  try {
    const response = await axios.post(
      url,
      { email, password },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
    log.info("User Login successfully:", response.data.message);
    return response.data;
  } catch (error) {
    log.error("Error Login user:", error.response ? error.response.data : error.message);
    return null;
  }
};

export const createUserProfile = async (token, payload) => {
  const url = "https://api.depined.org/api/user/profile-creation";

  try {
    const response = await axios.post(url, payload, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    log.info("Profile created successfully:", payload);
    return response.data;
  } catch (error) {
    log.error("Error creating profile:", error.response ? error.response.data : error.message);
    return null;
  }
};

export const confirmUserReff = async (token, referral_code) => {
  const url = "https://api.depined.org/api/access-code/referal";

  try {
    const response = await axios.post(
      url,
      { referral_code },
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    log.info("Confirm User referral successfully:", response.data.message);
    return response.data;
  } catch (error) {
    log.error("Error Confirm User referral:", error.response ? error.response.data : error.message);
    return null;
  }
};

export async function getUserInfo(token, proxy) {
  const agent = newAgent(proxy);
  try {
    const response = await axios.get("https://api.depined.org/api/user/details", {
      headers: {
        ...headers,
        Authorization: "Bearer " + token,
      },
      httpsAgent: agent,
      httpAgent: agent,
    });

    return response.data;
  } catch (error) {
    log.error("Error fetching user info:", error.message || error);
    return null;
  }
}
export async function getUserRef(token, proxy) {
  const agent = newAgent(proxy);
  try {
    const response = await axios.get("https://api.depined.org/api/referrals/stats", {
      headers: {
        ...headers,
        Authorization: "Bearer " + token,
      },
      httpsAgent: agent,
      httpAgent: agent,
    });

    return response.data;
  } catch (error) {
    log.error("Error fetching user info:", error.message || error);
    return null;
  }
}
export async function getEarnings(token, proxy) {
  const agent = newAgent(proxy);
  try {
    const response = await axios.get("https://api.depined.org/api/stats/epoch-earnings", {
      headers: {
        ...headers,
        Authorization: "Bearer " + token,
      },
      httpsAgent: agent,
      httpAgent: agent,
    });

    return response.data;
  } catch (error) {
    log.error("Error fetching user info:", error.message || error);
    return null;
  }
}
export async function connect(token, proxy) {
  const agent = newAgent(proxy);
  try {
    const payload = { connected: true };
    const response = await axios.post("https://api.depined.org/api/user/widget-connect", payload, {
      headers: {
        ...headers,
        Authorization: "Bearer " + token,
      },
      httpsAgent: agent,
      httpAgent: agent,
    });

    return response.data;
  } catch (error) {
    log.error(`Error when update connection: ${error.message}`);
    return null;
  }
}

export async function claimPoints(token, proxy) {
  const agent = newAgent(proxy);
  try {
    const payload = {};
    const response = await axios.post("https://api.depined.org/api/referrals/claim_points", payload, {
      headers: {
        ...headers,
        Authorization: "Bearer " + token,
      },
      httpsAgent: agent,
      httpAgent: agent,
    });

    return response.data;
  } catch (error) {
    log.error(`Error when claiming points: ${error.message}`);
    return null;
  }
}
