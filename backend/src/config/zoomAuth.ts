// zoomAuth.js
const axios = require("axios");

/**
 * Get Zoom access token using server-to-server OAuth
 * @param {string} clientId - Zoom Client ID
 * @param {string} clientSecret - Zoom Client Secret
 * @param {string} accountId - Zoom Account ID
 * @returns {Promise<string>} Access token
 */
export async function getZoomAccessToken(clientId : string, clientSecret : string, accountId : string) {
  try {
    const response = await axios.post(
      "https://zoom.us/oauth/token",
      {
        grant_type: "account_credentials",
        account_id: accountId,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error getting Zoom access token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to get Zoom access token");
  }
}

// module.exports = getZoomAccessToken;
