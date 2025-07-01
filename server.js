const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Config
const { 
  consumerKey, 
  consumerSecret, 
  shortCode, 
  passkey, 
  number, 
  amount, 
  callbackUrl 
} = config;

// Helper functions
const getAccessToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.message);
    throw error;
  }
};

const sendStkPush = async () => {
  try {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const requestBody = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: number,
      PartyB: shortCode,
      PhoneNumber: number,
      AccountReference: "Test Payment",
      TransactionDesc: "STK Push Test",
      CallBackURL: callbackUrl
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('STK Push initiated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending STK Push:', error.message);
    throw error;
  }
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/initiate-payment', async (req, res) => {
  try {
    const result = await sendStkPush();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/mpesa/callback', (req, res) => {
  const callbackData = req.body;

  if (callbackData.Body?.stkCallback?.ResultCode === 0) {
    const details = callbackData.Body.stkCallback.CallbackMetadata.Item.reduce((acc, item) => {
      acc[item.Name] = item.Value;
      return acc;
    }, {});

    console.log('Payment successful:', details);
  } else {
    console.log('Payment failed:', callbackData.Body?.stkCallback?.ResultDesc);
  }

  res.status(200).send({ ResultCode: 0, ResultDesc: "Accepted" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});

// Uncomment if you want to auto-initiate payment on server start
// sendStkPush().catch(console.error);
