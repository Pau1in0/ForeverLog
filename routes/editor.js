import express from 'express';
import Log from '../models/log.js';
import { param, body,  validationResult } from 'express-validator';

const router = express.Router();

const getLogValidator = [
    param('postID')
    .notEmpty().withMessage('A post ID is required')
    .trim() //Trim the outside spaces
    .matches(/^\S+$/).withMessage('ID cannot contain spaces')
    .isLength({min:24, max:24})
    .escape()
];

const postNewLogValidator = [
    body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Must be a string')
    .trim()
    .isLength({ max: 100 })
    .escape(),

    body('content')
    .notEmpty().withMessage('Content is required')
    .isString().withMessage('Must be a string')
    .trim()
    .escape()
];

const updateValidator = [
    body('updatedTitle')
    .optional()
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Must be a string')
    .trim()
    .isLength({ max: 100 })
    .escape(),

    body('updatedContent')
    .optional()
    .notEmpty().withMessage('Content is required')
    .isString().withMessage('Must be a string')
    .trim()
    .escape()
]

//This is the route hit once the user clicks on new log entry in the dashboard after they see the cute puppy eyes no logs found message. Hahahaha.  All it renders is a page to submit the info for a new log.
router.get('/', (req, res) => {
    try{
        return res.render('newLog.ejs', { errorMessage: null });
    } catch (error){
        return res.status(500).json({ 
            message: 'There was an error loading the log creation page, please try again later' 
        });
    }
})

//Viewing a specific log by logID
//This is where you go once a user clicks on a log they have in their dashboard.  All that happens is the previous content is shown, and you can edit it and it will update the original log
router.get('/:postID', getLogValidator, async (req, res) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                message: 'Invalid post ID format' 
            });
        }
        
        const { postID } = req.params;

        //We search the log collection by the ID of the post which is povided through the path parameters
        let post = await Log.findById(postID);

        //If there are no posts with that ID, a json message will be sent
        if(!post){
            const errorMessage = 'There is no post with that ID';
            return res.render('editLog.ejs', { errorMessage });
        }

        //Verify the user
        if(post.user != req.user.username){
            const errorMessage = 'Unauthorized user';
            return res.render('editLog.ejs', { errorMessage });
        }

        //From the result from the db query, deconstruct it and grab the post id, title, and content because it is what will make up the logs the user sees
        const { _id, title, content } = post;

        const logObject = {
            postID: _id,
            title,
            content
        };

        //Return the user the log while providing the frontend with the id, title, and content
        return res.render('editLog.ejs', { logObject, errorMessage: null });

    } catch (error){
        const errorMessage = 'There was an error fetching the log, please try again later';
        return res.render('editLog.ejs', { errorMessage });
    }
});

//After the user creates the log, the title and content will be passed on to here to be processed and evaluated
router.post('/', postNewLogValidator, async (req, res) => {
    try{
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessage = 'Invalid input, both title and content are required';
            return res.render('newLog.ejs', { errorMessage });
        }
        
        const { title, content } = req.body;

        const user = req.user.username;

        await Log.create({ user, title, content });

        return res.redirect('/api/v1/user/dashboard');

    } catch (error){
        const errorMessage = 'There was an error creating the post, please try again';
        return res.render('newLog.ejs', { errorMessage });
    }
});

//Update
//Once the user hits update log, the updatedTitle and updatedContent will be sent here to  update the db
router.post('/:postID', [getLogValidator, updateValidator], async (req, res) => {

    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                message: 'Invalid post ID format'  
            });
        }

        const { postID } = req.params;

        //Query for the log from the db based on ID, this is so you can have a reference to the original one
        let post = await Log.findById(postID);

        //Check if there is no post with that ID
        if(!post){
            return res.status(404).json({
                message: "There was an error grabbing that log, please try again"
            });
        }

        //Verify the user
        if(post.user != req.user.username){
            return res.status(403).json({
                message: 'Unauthorized user' 
            });
        }

        let { updatedTitle, updatedContent } = req.body;

        updatedTitle?.trim();
        updatedContent.trim();

        //Ignore non update fields
        const updates = {};
        
        if (updatedTitle){
            updates.title = updatedTitle;
        }
        
        if (updatedContent){
            updates.content = updatedContent;
        }

        // Checks if an updated title and content was not at all provided, then send an error
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'No updates were provided' 
            });
        }
      
        //Update the database
        await Log.updateOne({ _id: postID },{ $set: updates });

        return res.redirect('/api/v1/user/dashboard');
    } catch (error){
        return res.status(500).json({
            message: 'There was an error updating, please try again later'
        });
    }
});

//Delete
//Finally the delete route, this one is simple, just authorize the user, grab the post id, do the query and redirect to dashboard
router.post('/delete/:postID', [getLogValidator], async (req, res) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                message: 'Invalid post ID format' 
            });
        }

        const { postID } = req.params;

        //Grab the post
        const post = await Log.findById(postID);

        //Check if there is no post with that ID
        if(!post){
            const errorMessage = "There is no post with that ID";
            return res.render('editLog.ejs', { errorMessage });
        }

        //Verify the user
        if(post.user != req.user.username){
            return res.status(403).json({
                message: 'Unauthorized user' 
            });
        }

        await Log.deleteOne({ _id: postID });

        return res.redirect('/api/v1/user/dashboard');
    } catch (error){
        const errorMessage = "There was an error deleting the post";
        return res.render('editLog.ejs', { errorMessage });
    }
});

export default router;