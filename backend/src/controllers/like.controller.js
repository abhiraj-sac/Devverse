const Post  =require("../modules/post/postModel")
const Like = require("../modules/post/likeModel");
exports.likePost = async(req,res) =>{
    try{
        const {user,post} = req.body;

        const existingLike = await Like.findOne({ post, user });

        if (existingLike) {
            const updatedPost = await Post.findById(post).populate("likes").exec();
            return res.json({
                post: updatedPost,
                liked: true,
            });
        }

        const like= new Like({
            post,user
        });
        const saveLike=await like.save();

        // now we have to update into the like array 
        const updatedPost = await Post.findByIdAndUpdate(post,{$push :{likes:saveLike._id}},{new:true}).populate("likes").exec()
        res.json({
  post:updatedPost
 })
    }
  catch(error){
    console.log(error);
    return res.status(500).json({
        error:error.message
    })
}
}
exports.unlikepost = async (req,res) =>{
        try{
            const {post,user} = req.body;

            const deletedLike = await Like.findOneAndDelete({ post, user });

            if(!deletedLike){
                return res.status(404).json({
                    error: "Like not found"
                });
            }

            const updatedpost = await Post.findByIdAndUpdate(
                post,
                { $pull: { likes: deletedLike._id } },
                { new: true }
            ).populate("likes").exec();

            res.json({
                post: updatedpost,
                liked: false,
            });

        } catch(error){
            console.log(error);
            return res.status(500).json({
                error:error.message
            });
        }
}