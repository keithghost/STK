const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express();
app.use(bodyParser.json());

const { consumerKey, consumerSecret, shortCode, passkey, number, amount, callbackUrl } = config;

const getAccessToken = async () => {
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const encodedCredentials = new Buffer.from(consumerKey + ":" + consumerSecret).toString('base64');
    const headers = {
        'Authorization': "Basic " + encodedCredentials,
        'Content-Type': 'application/json'
    };
    const response = await axios.get(url, { headers });
    return response.data.access_token;
};

const sendStkPush = async () => {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const stk_password = new Buffer.from(shortCode + passkey + timestamp).toString("base64");

    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    const requestBody = {
        BusinessShortCode: shortCode,
        Password: stk_password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: number,
        PartyB: shortCode,
        PhoneNumber: number,
        AccountReference: "account",
        TransactionDesc: "test",
        CallBackURL: callbackUrl
    };

    const response = await axios.post(url, requestBody, { headers });
    console.log('STK Push Response:', response.data);
};

app.post('/mpesa/callback', (req, res) => {
    const callbackData = req.body;

    if (callbackData.Body?.stkCallback?.ResultCode === 0) {
        const details = callbackData.Body.stkCallback.CallbackMetadata.Item.reduce((acc, item) => {
            acc[item.Name] = item.Value;
            return acc;
        }, {});

        console.log('Payment successful:');
        console.log('Amount:', details.Amount);
        console.log('MpesaReceiptNumber:', details.MpesaReceiptNumber);
        console.log('TransactionDate:', details.TransactionDate);
        console.log('PhoneNumber:', details.PhoneNumber);

        
    } else {
        console.log('Payment failed or was cancelled:', callbackData.Body.stkCallback.ResultDesc);
    }

    res.status(200).send({ ResultCode: 0, ResultDesc: "Accepted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on https://mpesastk-e28452b2a3a3.herokuapp.com`);
});

sendStkPush();