import express, { json } from 'express';
import cors from 'cors';

import { estimateTime } from './estimateTime.js';

const app = express();
app.use(cors());
app.use(json());

const PORT = 8080;

app.listen(
    PORT,
    () => console.log(`its alive on http://localhost:${PORT}`)
)

app.get('/estimate-time', async (req, res) => {

    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const time = await estimateTime(username);

        return res.status(200).json({ message: `Estimation done for ${username}`, time: time });
    } catch(error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});