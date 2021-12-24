const { userModel, commentModel } = require("./../schemas/connection");
var mongoose = require('mongoose');

function update(i){
    return new Promise((resolve, reject)=>{
        let code = 0
        let check = 0;
        let session
    
        userModel
            .startSession()
            .then((_session) => {
                session = _session;
                session.startTransaction();
                return commentModel.updateOne(
                    { userId: '619f60c98dce545979b006e3'},
                    { $push: { comment: { content: i } } },
                    { session }
                );
            })
            .then((result) => {
                if (result.modifiedCount === 1) {
                    return userModel.findOneAndUpdate(
                        { _id: mongoose.Types.ObjectId('619f60c98dce545979b006e3') },
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
                        check = 1
                        return session.abortTransaction();
                    }
                }
                else {
                    check =1
                    return session.abortTransaction()
                }
            })
            .then(() => {
                session.endSession();
                
                    resolve('resolve')
                
            })
            .catch((err) => {
                if(check !== 1){
                    session.abortTransaction().then(() => {
                        session.endSession();
                        return reject(err)
                    });
                }else{
                    session.endSession()
                    return reject(err)
                }
                
            });
    })
    
}
let updateCommentConflict = (req, res, next) => {
    let arr=[]
    for(i=0; i<10; i++){
        let res = await update(i)
        console.log(res);
    }  
};



module.exports = {
    updateCommentConflict,
    
};
