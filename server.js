const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

const api_key = '0be78ad020ac057fb04b63623f6f99af-us13';
const data_center = 'us13';
const list_id = '373154b31b';

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    credentials: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

const getSubscriberHash = (email) => {
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
};

app.get('/', (req, res) => {
    res.send('Welcome to the Mailchimp Integration API');
});

app.get('/get-members', async (req, res) => {
    const url = `https://${data_center}.api.mailchimp.com/3.0/lists/${list_id}/members`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `apikey ${api_key}`
            }
        });

        res.json(response.data.members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).send('Error fetching members');
    }
});

app.put('/update-member', async (req, res) => {
    const { email, updateFields } = req.body;
    const subscriberHash = getSubscriberHash(email);
    const url = `https://${data_center}.api.mailchimp.com/3.0/lists/${list_id}/members/${subscriberHash}`;

    try {
        const response = await axios.patch(url, updateFields, {
            headers: {
                'Authorization': `apikey ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).send('Error updating member');
    }
});

app.put('/unsubscribe-member', async (req, res) => {
    const { email } = req.body;
    const subscriberHash = getSubscriberHash(email);
    const url = `https://${data_center}.api.mailchimp.com/3.0/lists/${list_id}/members/${subscriberHash}`;

    try {
        const response = await axios.patch(url, { status: 'unsubscribed' }, {
            headers: {
                'Authorization': `apikey ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error unsubscribing member:', error);
        res.status(500).send('Error unsubscribing member');
    }
});

app.post('/add-member', async (req, res) => {
    const { email, status, fname, lname, phone, birthday } = req.body;
    const url = `https://${data_center}.api.mailchimp.com/3.0/lists/${list_id}/members`;

    try {
        const response = await axios.post(url, {
            email_address: email,
            status: status,
            merge_fields: {
                FNAME: fname,
                LNAME: lname,
                PHONE: phone,
                BIRTHDAY: birthday
            }
        }, {
            headers: {
                'Authorization': `apikey ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).send('Error adding member');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
