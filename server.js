import app from './app.js';
import dotenv from 'dotenv';
import mongoDB from './db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

mongoDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));