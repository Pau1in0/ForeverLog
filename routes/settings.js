import express from 'express';

const router = express.Router();

//Middleware

//Routes logic
router.get('/', (req, res) => {
    console.log(`Look at the JSON`);
    res.json({
        message: "Welcome to the settings, right now there is nothing"
    });
});

export default router;