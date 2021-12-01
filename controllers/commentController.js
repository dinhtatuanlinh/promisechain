const { userModel, commentModel } = require("./../schemas/connection");

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
            if (result && result._id) {
                let comment = new commentModel({ userId: result._id })
                return comment.save({ session });
            } else {
                code = 2;
            }
        })
        .then((result) => {
            if(result && result._id){
                return session.commitTransaction();
            }
            else {
                code = 3;
            }
        })
        .then(() => {
            if (code === 1 || code === 2 || code === 3 || code === 4 ) {
                return session.abortTransaction();
            }

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
    let userId = req.body.userid;
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
                    { userId: userId },
                    { $inc: { commentCount: 1 } },
                    { session }
                );
            } else {
                code = 1;
            }
        })
        .then((result) => {
            if (result & result._id) {
                return session.commitTransaction();
            }
            else{
                code = 2;
            }
        })
        .then(() => {
            if(code === 1 || code === 2){
                return session.abortTransaction();
            }

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
    console.log(userid && from && to && from <= to);
    // get all comments of this user
    if (userid && from >= 0 && to >= 0 && from <= to) {
        commentModel
            .find({ 
                userId: userid,
            })
            .populate("userId")
            .where("comment")
            .slice([from, to - from + 1])
            .then((result) => {
                if(result && result._id){
                    res.send(result[0].comment)
                }
                else{
                    res.send('not found')
                }
                
            });
    } else {
        res.send("wrong input!");
    }
};
let updateComment = (req, res, next) => {
    let user = req.body.name;
    let id = req.body.commentid;
    let content = req.body.content;
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
                res.send("user not existed");
            }
        })
        .then(result => {
            if(result && result._id){
                res.send(200);
            }else{
                res.send("user not existed");
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
        .findOne({ user: user })
        .then((result) => {
            if (result) {
                return commentModel.startSession();
            } else {
                code = 1;
            }
        })
        .then((_session) => {
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
        })
        .then((result) => {
            if (result.modifiedCount === 1) {
                return userModel.updateOne(
                    { _id: userid },
                    { $inc: { commentCount: -1 } },
                    { session }
                );
            } else {
                code = 2;
            }
        })
        .then(result=>{
            if(result.modifiedCount === 0){
                code = 3;
            }
            else {
                return session.commitTransaction();
            }
        })
        .then(() => {
            if (code === 1 || code === 2 || code === 3) {
                return session.abortTransaction();
            }
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
module.exports = {
    createComment,
    getComment,
    updateComment,
    deleteComment,
    createUser,
};
