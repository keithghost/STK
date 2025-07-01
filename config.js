

const config = {
    consumerKey: process.env.CONSUMER_KEY || "",
    consumerSecret: process.env.CONSUMER_SECRET || "",
    shortCode: process.env.SHORTCODE || "174379",
    passkey: process.env.PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    number: process.env.PUSHNUMBER || "254708374149",
    amount: process.env.AMOUNT || "1",
    callbackUrl: process.env.CALLBACK_URL || ""
};

module.exports = config;