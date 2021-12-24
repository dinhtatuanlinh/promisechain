const express = require("express");
const {
    createComment,
    getComment,
    updateComment,
    deleteComment,
    createUser,
    usePromiseAllToDelete
} = require('./../controllers/commentController');
const {updateCommentConflict} = require('./../controllers/testConflict')
const user = require('./../schemas/connection').userModel;

let router = express.Router();


module.exports = () => {
    // cau hình router trang chủ
    // ##################
    router.get('/', (req, res, next)=> {
        user.find().then(result=>res.send(result))
        
    });
    // router.get('/story', (req, res, next)=>{
    //     polulation(req, res, next)
    // } )
    // ##################
    router.post('/createuser', (req, res, next)=> createUser(req, res, next))
    router.post('/createcomment', (req, res, next)=> createComment(req, res, next) )
    router.get('/read', (req, res, next)=>getComment(req, res, next))
    router.put('/update', (req, res, next)=>updateComment(req, res, next))
    router.delete('/delete', (req, res, next)=>usePromiseAllToDelete(req, res, next))
    router.put('/updateconflict', (req, res, next)=>updateCommentConflict(req, res, next))
    return router;
}