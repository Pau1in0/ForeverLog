import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

//Once the user is registered they will be redirected here, or if they already have an account, they will be sent here so they can authenticate themselves and receive a token
router.get('/', (req, res) => {
    try{
        return res.render('login.ejs', { errorMessage: null });
    } catch (error){
        return res.json({ 
            message: 'There was an error loading the login page, please try again later'
        });
    }
}); 

const validateLogin = [
    body('username').trim().notEmpty().withMessage('Username is required').escape(),

    body('password').trim().notEmpty().withMessage('Password is required').escape()
];

//After the user clicks submit, the username and password will be sent to this route to be evaluated.
router.post('/', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()){
        const errorMessage = 'Invalid username or password';
        return res.render('login.ejs', { errorMessage });
    }

    try{
        let { username, password } = req.body;

        //We need to modify the username to make it lowercase so it has to be a let
        username = username.toLowerCase();

        //We then search the DB to look for a document that has the username the user provided
        const userSearch = await User.findOne({ username });

        //If there are no usernames that match in the db we send an error and escape the function to prevent errors
        if(!userSearch){
            const errorMessage = 'Invalid username or password';
            return res.render('login.ejs', { errorMessage });
        }

        //hasedPassword will be set to the password from the DB if there is a result.  Otherwise the password from the .env file will be used.
        const hashedPassword = userSearch ? userSearch.password : process.env.MONGO_PASSWORD;

        //Now we compare the user provided password with the password from the db.  Returns a boolean
        const isMatch = bcrypt.compare(password, hashedPassword);
        
        if(!isMatch){
            const errorMessage = 'Invalid username or password';
            return res.render('login.ejs', { errorMessage });
        }

        //Now, since username and password match, we have authenticated the user, so we will generate a token and store it inside a cookie. The token lasts 2 hours
        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
            expiresIn: "2h"
        });
        
        //Since the token is created, we now make the cookie, we pass in the token.
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Secure only in production
            sameSite: 'Strict', // Prevent CSRF
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });

        //Now the user has a cookie with a token in it, so we can redirect them to the dashboard, where the authentication middleware will check the cookie for the token
        return res.redirect('/api/v1/user/dashboard');

    } catch (error){
        const errorMessage = 'There was an error signing in the user, please try again later';
        return res.render('login.ejs', { errorMessage });
    }
});

export default router;