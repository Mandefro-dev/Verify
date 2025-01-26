const MTProto = require("@mtproto/core");
require("dotenv").config();

const mtproto = new MTProto({
  api_id: process.env.API_ID,
  api_hash: process.env.API_HASH,
});

async function sendCode(phoneNumber) {
  try {
    const result = await mtproto.call("auth.sendCode", {
      phone_number: phoneNumber,
      settings: {
        _: "codeSettings",
      },
    });

    return result;
  } catch (error) {
    console.error("Error sending code:", error);
    throw error;
  }
}

async function signIn(phoneNumber, phoneCodeHash, code) {
  try {
    const result = await mtproto.call("auth.signIn", {
      phone_number: phoneNumber,
      phone_code_hash: phoneCodeHash,
      phone_code: code,
    });

    return result;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

module.exports = { sendCode, signIn };
