// import the models
const Post = require("../modules/post/postModel")
const Comments =require("../modules/post/commentModel");

exports.createcomment = async(req,res) =>{
    try{
     //  fetch data from the request body 
     const {post,user,body} = req.body;
     const comment = new Comments({
        post,user,body
     });
     const savedcomment = await comment.save();
    //  now find a post by id and update in it also 
    const updatedPost = await Post.findByIdAndUpdate(post,{$push:{comments:savedcomment._id}},{new:true})
    .populate("comments") // populate the comments array with comments documents 
    res.json({
        post:updatedPost
    })
    }
    catch(err){
        return res.status(400).json({
            error:"Error while/.."
        })
    }
}