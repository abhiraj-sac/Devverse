const Post = require("../modules/post/postModel");

exports.createpost = async (req, res) => {
  try {
    const { title, body } = req.body;
    const post = new Post({
      title,
      body,
    });

    const savedpost = await post.save();

    res.json({
      post: savedpost,
    });
  } catch (err) {
    return res.status(400).json({
      error: "Error while/..",
    });
  }
};

exports.getpost = async (req, res) => {
  try {
    // const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search || "";
    const sort = req.query.sort || "latest";

    // const skip = (page - 1) * limit;

    // for cursor pagination 
    const cursor = req.query.cursor;

    const query = {};
    
    if (cursor) {
    query._id = {
        $lt: cursor,
    };
    }
    
    
    if (search.trim()) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          body: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // =========================
    // MOST LIKED
    // =========================
    if (sort === "likes") {
      const posts = await Post.aggregate([
        {
          $match: query,
        },
        {
          $addFields: {
            likesCount: {
              $size: "$likes",
            },
          },
        },
        {
          $sort: {
            likesCount: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      await Post.populate(posts, [
        { path: "comments" },
        { path: "likes" },
      ]);

      return res.json({
        posts,
      });
    }

    // =========================
    // LATEST / OLDEST
    // =========================
    let sortOption = {};

    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const post = await Post.find(query)
      .sort({ _id: -1 })
      // .skip(skip)
      .limit(limit)
      .populate("comments")
      .populate("likes")
      .exec();

    const nextCursor =
    post.length > 0
        ? post[post.length - 1]._id
        : null;

res.json({
    posts: post,
    nextCursor,
});

  } catch (err) {
    return res.status(400).json({
      error: "Error while fetching posts",
    });
  }
};