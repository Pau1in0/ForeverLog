import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    try{
        res.render('home.ejs');
    } catch(error){
        return res.json({
            message: "There was an error loading the homepage, please try again"
        });
    }
});

export default router;