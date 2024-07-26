const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
// const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const http = require("http");

const SECRET_KEY = "your-secret-key";
const app = express();

/// Models
let UserModel = require("./models/User");
let PostModel = require("./models/Post");

//// Auth
const { authenticateJWT, verifyToken } = require("./middleware/auth");

/// Multer
const upload = require("./middleware/multer");

//// Middleware setup
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(cookieParser());

// MongoDB connection
connectDB();

/// Register User API
app.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "error", message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      username,
      email,
      password: hash,
    });
    res.json({ status: "OK", user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Login API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "User Not Found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid email or password" });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log("generate-token", token);
    const decodeToken = jwt.decode(token);
    res.json({
      status: "OK",
      token: token,
      decodeToken,
      username: user.username,
      userId: user._id,
    });
  } catch (err) {
    res.json(err);
  }
});

// Post upload API with image
app.post(
  "/addPost",
  authenticateJWT,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const image = req.file.path;
      const userId = req.user.userId;

      const post = new PostModel({
        title,
        description,
        userId,
        image,
      });

      await post.save();
      res.json({ status: "OK", post });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// Get post data API
app.get("/posts", authenticateJWT, async (req, res) => {
  try {
    const posts = await PostModel.find({})
      .populate("userId", "username profilePicture")
      .populate({
        path: "comments",
        populate: [
          {
            path: "userId",
            select: "username profilePicture",
          },
          {
            path: "reply.userId",
            select: "username profilePicture",
          },
        ],
      });
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get my post data API
app.get("/my-posts", authenticateJWT, async (req, res) => {
  try {
    const posts = await PostModel.find({ userId: req.user.userId })
      .populate("userId", "username profilePicture")
      .populate({
        path: "comments",
        populate: [
          {
            path: "userId",
            select: "username profilePicture",
          },
          {
            path: "reply.userId",
            select: "username profilePicture",
          },
        ],
      });
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload profile picture API
app.post(
  "/upload-profile-picture",
  authenticateJWT,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const profilePicture = req.file.path;

      // Find the user to get the old profile picture path
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete the old profile picture if it exists and is not the default
      if (
        user.profilePicture &&
        user.profilePicture !== "uploads/default-profile.png"
      ) {
        const oldImagePath = path.join(__dirname, user.profilePicture);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old profile picture:", err);
          }
        });
      }

      // Update the user's profile picture in the database
      user.profilePicture = profilePicture;
      await user.save();

      res.json({ profilePicture: user.profilePicture });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// const user = await UserModel.findByIdAndUpdate(
//   userId,
//   { profilePicture: profilePicture },
//   { new: true, select: "-password" }
// );

// Get current user API
app.get("/current-user", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/// delete My Post
app.delete("/my-posts/:id", authenticateJWT, async (req, res) => {
  try {
    let deletePost = await PostModel.findByIdAndDelete(req.params.id);
    console.log("delete-post", deletePost);
    if (!deletePost) {
      return res.status(404).json({ error: "Post not found" });
    } else {
      res.status(200).json({ message: "Post deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});
// get post for update
app.get("/my-post/:id", authenticateJWT, async (req, res) => {
  try {
    const getPostForUpdate = await PostModel.findById(req.params.id);
    console.log("get for update user", getPostForUpdate);
    if (!getPostForUpdate) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(getPostForUpdate);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});
/// update Post that get
app.put(
  "/my-post/:id",
  authenticateJWT,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const { id } = req.params;
      const postData = { title, description };

      // Find the post by ID to get the old image path
      const oldPost = await PostModel.findById(id);
      if (!oldPost) {
        return res.status(404).json({ error: "Post not found" });
      }

      // If a new image is uploaded, handle image deletion
      if (req.file) {
        postData.image = req.file.path; // Save the new image path

        // Delete the old image if it exists
        if (oldPost.image) {
          fs.unlink(path.join(__dirname, oldPost.image), (err) => {
            if (err) console.error("Error deleting old image:", err);
          });
        }
      } else {
        // If no new image, keep the old image
        postData.image = oldPost.image;
      }

      const updatedPost = await PostModel.findByIdAndUpdate(id, postData, {
        new: true,
      });

      if (!updatedPost) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ error: "Error updating post" });
    }
  }
);


//// Socket.IO Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow requests from this origin
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  ///// Likes
  socket.on("like_post", async ({ postId, userId, token }) => {
    try {
      // Verify token and user authentication
      const verified = verifyToken(token);
      if (!verified || verified.userId !== userId) {
        return;
      }

      // Update the like count in the database
      const post = await PostModel.findById(postId);
      if (!post) {
        return;
      }

      if (post.likes.includes(userId)) {
        // User already liked the post, so unlike it
        post.likes = post.likes.filter((id) => id.toString() !== userId);
      } else {
        // User hasn't liked the post yet, so like it
        post.likes.push(userId);
      }
      await post.save();

      // Emit the updated like data to all clients
      io.emit("post_liked", { postId, likes: post.likes }); ///
    } catch (error) {
      console.error("Error liking post:", error);
    }
  });
  ///// Comments
  socket.on("comment_post", async ({ postId, userId, comment, token }) => {
    console.log(postId, userId, comment, token); // Log received data for debugging

    try {
      const verified = verifyToken(token);
      if (!verified || verified.userId !== userId) {
        return; // Optionally handle unauthorized access
      }

      const post = await PostModel.findById(postId);
      if (!post) {
        return; // Optionally handle post not found
      }

      post.comments.push({ userId, comment });
      await post.save();

      // Populate the comments after saving with username profilePicture
      const populatedPost = await PostModel.findById(postId)
        .populate("comments.userId", "username profilePicture")
        .exec();
      io.emit("post_commented", { postId, comments: populatedPost.comments });
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  });

  //// reply
  socket.on(
    "reply_comment",
    async ({ postId, commentId, userId, replyText, token }) => {
      console.log(postId, commentId, userId, replyText, token); // Log received data for debugging

      try {
        const verified = verifyToken(token);
        if (!verified || verified.userId !== userId) {
          return; // Optionally handle unauthorized access
        }

        const post = await PostModel.findById(postId);
        if (!post) {
          return; // Optionally handle post not found
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
          return; // Optionally handle comment not found
        }

        comment.reply.push({ userId, replyText });
        await post.save();

        // Populate the replies after saving with username and profilePicture
        const populatedPost = await PostModel.findById(postId)
          .populate("comments.userId", "username profilePicture")
          .populate("comments.reply.userId", "username profilePicture")
          .exec();

        const updatedComment = populatedPost.comments.id(commentId);

        io.emit("comment_replied", {
          postId,
          commentId,
          reply: updatedComment.reply,
        });
      } catch (error) {
        console.error("Error replying to comment:", error);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});