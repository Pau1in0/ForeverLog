import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/users.js';
import { body, validationResult} from 'express-validator';

const router = express.Router();

// This is step1, this is what gets hit first after clicking register in the home screen.

router.get('/', (req, res) => {
    try{
        return res.render('register.ejs', { errorMessage: null });
    } catch (error){
        return res.json({ message: 'There was an error loading the register route'});
    }
});

const validateRegistration = [

    body('username')
    .notEmpty().withMessage('The username cannot be empty')
    .escape()
    .trim()
    .isLength({ min: 3, max: 20}).withMessage('Username needs to be between 3 - 20 characters long')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
    .matches(/^\S+$/).withMessage('Username cannot contain spaces'),

    body('password')
    .notEmpty().withMessage('The username cannot be empty')
    .escape()
    .trim()
    .isLength({ min:8 }).withMessage('The password needs to be 8 chcaracters long minimum')
    .matches(/^\S+$/).withMessage('Password cannot contain spaces')
    .matches(/[A-Z]/).withMessage('Password must contain at least one upper letter')
    .matches(/\d/).withMessage('Password must contain at least one number')

];

//Register a new account
//This is step 2, user input gets validated by validateRegistration, sanitizing, and validating the input.
router.post('/', validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const errorMessage = 'Invalid username, or password';
        return res.render('register.ejs', { errorMessage });
    }

   try{
     let { username, password } = req.body;

     username = username.toLowerCase();

    const existingUser = await User.findOne({ username: username });

    //If existingUser returns true, then return an error message and stop the function
    if(existingUser){
        const errorMessage = 'Invalid username or password';
        return res.render('register.ejs', { errorMessage });
    }

    //If the username is not taken, grab the password and hash it
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create a new user object using the User model
    const newUser = new User({ 
        username: username, 
        password: hashedPassword 
    });

    //Use the mongoose model built in method to save it to the database.
    await newUser.save();

    //After the newUser has been saved to the database, redirect the user to the login page
    return res.redirect('/api/v1/auth/login');
   } catch (error){
    const errorMessage = 'There was an error creating a new account, please try again later';
    return res.render('register.ejs', { errorMessage });
   }
});

export default router;
