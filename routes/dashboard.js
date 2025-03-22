import express from 'express';
import Log from '../models/log.js';

const router = express.Router();

//Routes logic
router.get('/', async (req, res) => {
    try {
        const { username } = req.user;

        // Grab all logs belonging to the user
        const logs = await Log.find({ user: username });

        //Render dashboard while passing in the logs, and the username, also exiting the function
        return res.render('dashboard.ejs', { logs, username, errorMessage: null });

    } catch (error) {
        const errorMessage = 'Error retrieving logs, please try again later';
        return res.render('dashboard.ejs', { errorMessage });
    }
});

export default router;
