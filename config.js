

const config = {
    consumerKey: process.env.CONSUMER_KEY || "zL7LkIMIYGuaIKcG8hXvp0dmtcofUUN2rToWINbBBYqIV4Fh",
    consumerSecret: process.env.CONSUMER_SECRET || "RoFc8lYb8pP5TGgMjWeIeYtU2QJXWz0z8CqSinPiWAJB0DwphMEDQqSZst0FYoEd",
    shortCode: process.env.SHORTCODE || "174379",
    passkey: process.env.PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    number: process.env.PUSHNUMBER || "254748387615",
    amount: process.env.AMOUNT || "1",
    callbackUrl: process.env.CALLBACK_URL || "https://stk-1wop.onrender.com"
};

module.exports = config;
