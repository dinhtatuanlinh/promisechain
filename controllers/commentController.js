const { userModel, commentModel } = require("./../schemas/connection");
var mongoose = require('mongoose');

let createUser = (req, res, next) => {
    let username = req.body.username;
    let session;
    let code = 0;
    userModel
        .startSession()
        .then((_session) => {
            session = _session;
            session.startTransaction();
            return userModel.exists({ user: username });
        })
        .then((result) => {
            if (result) {
                code = 1;
            }
            else {
                let user = new userModel({ user: username })
                return user.save({ session });
            }
        })
        .then((result) => {
            if(code === 0){
                if (result && result._id) {
                    let comment = new commentModel({ userId: result._id })
                    return comment.save({ session });
                }else{
                    code = 2;
                }
            }
        })
        .then((result) => {
            if(code === 0){
                if(result && result._id){
                    return session.commitTransaction();
                }else{
                    code = 3;
                    return session.abortTransaction();
                }
            }else{
                return session.abortTransaction();
            }
        })
        .then(() => {
            session.endSession();

            if (code === 1) {
                res.send("existed!");
            } 
            else if (code === 2) {
                res.send("create user fail!");
            } 
            else if (code === 3) {
                res.send("create comment fail");
            }
            else {
                res.send("successful!");
            }
        })
        .catch((err) => {
            session.abortTransaction().then(() => {
                session.endSession();
                res.send(err);
            });
        });
};
let createComment = (req, res, next) => {
    // req.body;
    let userId = req.body.userId;
    let content = req.body.content;
    let code = 0;
    let session;
    userModel
        .startSession()
        .then((_session) => {
            session = _session;
            session.startTransaction();
            return commentModel.updateOne(
                { userId: userId},
                { $push: { comment: { content: content } } },
                { session }
            );
        })
        .then((result) => {
            if (result.modifiedCount === 1) {
                return userModel.findOneAndUpdate(
                    { _id: mongoose.Types.ObjectId(userId) },
                    { $inc: { commentCount: 1 } },
                    { session }
                );
            } else {
                code = 1;
            }
        })
        .then((result) => {
            if(code === 0){
                if (result && result._id) {
                    return session.commitTransaction();
                }
                else{
                    code = 2;
                    return session.abortTransaction();
                }
            }
            return session.abortTransaction();
        })
        .then(() => {
            session.endSession();
            
            if (code === 1) {
                res.send("update comment fail");
            } else if (code === 2) {
                res.send("nonbeing");
            } else {
                res.send("successful!");
            }
        })
        .catch((err) => {
            session.abortTransaction().then(() => {
                session.endSession();
                res.send(err);
            });
        });
};
let getComment = (req, res, next) => {
    let userid = req.query.userid;
    let from = parseInt(req.query.from);
    let to = parseInt(req.query.to);
    // get all comments of this user
    if (userid && from >= 0 && from <= to) {
        commentModel.aggregate([
            {$match: ({userId: mongoose.Types.ObjectId(userid)})},
            
            {$lookup: {from: "users", localField: "userId",foreignField: '_id', as: "users"}},
            {$project:{getComment: {$slice: ["$comment", from, to - from +1]}, userId: 1, users: {user: 1, commentCount: 1}}},
        ])
        .then(result=>{
            res.send(result);
        })
        // commentModel
        //     .findOne({ 
        //         userId: userid,
        //     })
        //     .populate("userId")
        //     .where("comment")
        //     .slice([from, to - from + 1])
        //     .then((result) => {
        //         console.log(result);
        //         if(result && result._id){
                    
        //             res.send(result.comment)
        //         }
        //         else{
        //             res.send('not found')
        //         }
        //     });
    } else {
        res.send("wrong input!");
    }
};
let updateComment = (req, res, next) => {
    let user = req.body.name;
    let id = req.body.commentid;
    let content = req.body.content;
    let code = 0;
    userModel
        .findOne({ user: user })
        .then((result) => {
            if (result) {
                return commentModel.findOneAndUpdate(
                    {
                        userId: result._id,
                        comment: { $elemMatch: { _id: id } },
                    },
                    { $set: { "comment.$.content": content } }
                );
            } else {
                code = 1;
            }
        })
        .then(result => {
            if (code === 0){
                if(result && result._id){
                    res.send(200);
                }else{
                    res.end("update err")
                }
            }
            else {
                res.end("user not exist")
            }
            
        })
        .catch((err) => {
            res.send(err.message);
        });
};
let deleteComment = (req, res, next) => {
    let userid = req.body.userid;
    let id = req.body.commentid;
    let session;
    let code = 0;
    userModel
        .findOne({ _id: userid })
        .then((result) => {
            if (result) {
                return commentModel.startSession();
            } else {
                code = 1;
            }
        })
        .then((_session) => {
            if(code === 0){
                session = _session;
                session.startTransaction();
                return commentModel.updateOne(
                    {
                        userId: userid,
                    },
                    {
                        $pull: {
                            comment: { _id: id },
                        },
                    },
                    { session }
                );
            }
        })
        .then((result) => {
            if(code === 0){
                if (result.modifiedCount === 1) {
                    return userModel.updateOne(
                        { _id: userid },
                        { $inc: { commentCount: -1 } },
                        { session }
                    );
                } else {
                    code = 2;
                }
            }
            
        })
        .then(result=>{
            if(code === 0){
                if(result.modifiedCount === 1){
                
                    return session.commitTransaction();
                }
                else {
                    code = 3;
                    return session.abortTransaction();
                }
            }
            return session.abortTransaction();
        })
        .then(() => {
            session.endSession();
            if (code === 1) {
                res.send("user not exist!");
            } else if (code === 2) {
                res.send("update comment fail!");
            } else if (code === 3){
                res.send("update user fail!");
            } else {
                res.send("successful!");
            }
        })
        .catch((err) => {
            session.abortTransaction().then(() => {
                session.endSession();
                res.send(err);
            });
        });
};
let usePromiseAllToDelete = (req, res, next)=>{

    let userid = req.body.userid;
    let id = req.body.commentid;
    let session;
    let code = 0;
    let checkAbort = 0;
    userModel.startSession()
        .then(_session =>{
            session =_session;
            session.startTransaction();
            return Promise.all([
                commentModel.updateOne(
                    { userId: userid },
                    { $pull:{comment:{_id: id}}},
                    {session}
                ),
                userModel.updateOne(
                    { _id: userid },
                    { $inc:{commentCount: -1}},
                    {session}
                )
            ])
            
        })
        .then(result=>{
            console.log(result);
            for(i=0; i<result.length; i++){
                let res = result[i];
                if(res.modifiedCount === 1){
                    code = 1;
                    break;
                }
            }
            if(code === 1){
                checkAbort = 1;
                return session.abortTransaction()
            }
            else{
                return session.commitTransaction(); 
            }
        })
        .then(()=>{
            session.endSession();
            if(code ===1){
                res.send('update fail')
            }else{
                res.send('success')
            }

        })
        .catch(err=>{
            console.log(err);
            if(checkAbort === 1){
                session.endSession();
                res.send(err)
            }
            else{
                session.abortTransaction().then(()=>{
                    session.endSession();
                    res.send(err)
                })
            }
        })
}

module.exports = {
    createComment,
    getComment,
    updateComment,
    deleteComment,
    createUser,
    usePromiseAllToDelete
};
