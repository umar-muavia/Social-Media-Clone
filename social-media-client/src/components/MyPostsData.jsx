import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faComment,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

const socket = io("http://localhost:4000");

function MyPostsData() {
  const [posts, setPosts] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const defaultProfilePicture = "https://via.placeholder.com/40";
  const [commentInputs, setCommentInputs] = useState({});
  const [commentValues, setCommentValues] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyInput, setActiveReplyInput] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  //// read more / read less
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:4000/my-posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const fetchedPosts = response.data.reverse();

        // Update liked status based on the fetched posts
        const likedPostsData = {};
        fetchedPosts.forEach((post) => {
          likedPostsData[post._id] = post.likes.includes(
            localStorage.getItem("userId")
          );
        });

        setPosts(fetchedPosts);
        setLikedPosts(likedPostsData); // Set liked status for posts
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [posts]);

  //// edit / delete
  const handleOptionsClick = (postId) => {
    setShowOptions((prev) => (prev === postId ? null : postId));
  };
  /// delete Post
  const handleDelete = async (postId) => {
    console.log(postId);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.delete(`http://localhost:4000/my-posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        alert("Post are deleted")
      }
    } catch (error) {
      console.error("Error deleting user:", error.response || error);
    }
  };
  //// edit
  const handleEdit = (postId) => {
    navigate(`/my-posts/edit/${postId}`);
  };

  const handleLike = (postId) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // Emit the like event to the server
      socket.emit("like_post", { postId, userId, token });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentValues((prevValues) => ({
      ...prevValues,
      [postId]: value,
    }));
  };

  const handlePostComment = (postId) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const comment = commentValues[postId];
      console.log(comment, token, postId, userId);
      socket.emit("comment_post", { postId, comment, token, userId });

      setCommentValues("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const toggleCommentInput = (postId) => {
    setCommentInputs((prevInputs) => ({
      ...prevInputs,
      [postId]: !prevInputs[postId],
    }));
  };

  const toggleReplyInput = (commentId) => {
    setActiveReplyInput(commentId === activeReplyInput ? null : commentId);
  };

  const handleReplyInputChange = (commentId, value) => {
    setReplyInputs((prevInputs) => ({
      ...prevInputs,
      [commentId]: value,
    }));
  };

  const handlePostReply = (commentId, postId) => {
    const replyText = replyInputs[commentId];
    if (!replyText) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    socket.emit("reply_comment", {
      postId,
      commentId,
      userId,
      replyText,
      token,
    });

    setReplyInputs("");
  };

  return (
    <div className="bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto pb-2">
        <h2 className="font-semibold text-gray-800">My Posts</h2>
      </div>
      {posts.length === 0 ? (
        <h4 className="text-center text-gray-500">No posts uploaded</h4>
      ) : (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="mt-2">
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-gray-50 p-4 rounded-lg shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={
                          post.userId.profilePicture
                            ? `http://localhost:4000/${post.userId.profilePicture}`
                            : defaultProfilePicture
                        }
                        alt="User profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = defaultProfilePicture;
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {post.userId.username}
                        </h4>
                      </div>
                      <h5 className="text-lg font-semibold card-content">
                        {post.title}
                      </h5>
                      <p className="card-content">
                        {showFullDescription
                          ? post.description
                          : `${post.description.slice(0, 200)}...`}
                        {post.description.length > 200 && (
                          <button
                            onClick={() =>
                              setShowFullDescription((prev) => !prev)
                            }
                            className="text-blue-500 hover:underline focus:outline-none"
                          >
                            {showFullDescription ? "...Read Less" : "Read More"}
                          </button>
                        )}
                      </p>{" "}
                      <div className="mt-2">
                        <img
                          src={`http://localhost:4000/${post.image}`}
                          alt="Post"
                          className="w-full rounded-md"
                        />
                      </div>
                      <div className="mt-4 flex space-x-4">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                            likedPosts[post._id]
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <FontAwesomeIcon icon={faThumbsUp} />
                          <span>{post.likes.length} Likes</span>
                        </button>
                        <button
                          onClick={() => toggleCommentInput(post._id)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                            commentInputs[post._id]
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800 hover:bg-blue-100"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faComment}
                            className={`text-${
                              commentInputs[post._id] ? "white" : "black"
                            }`}
                          />
                          <span>{post.comments.length} Comments</span>
                        </button>
                      </div>
                      {commentInputs[post._id] && (
                        <div className="mt-4">
                          <div className="mb-4">
                            <textarea
                              placeholder="Write a comment..."
                              value={commentValues[post._id] || ""}
                              onChange={(e) =>
                                handleCommentInputChange(
                                  post._id,
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none"
                            ></textarea>
                            <button
                              onClick={() => handlePostComment(post._id)}
                              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                            >
                              Post Comment
                            </button>
                          </div>
                          <div className="space-y-4">
                            {post.comments.map((comment) => (
                              <div
                                key={comment._id}
                                className="p-2 border rounded-lg"
                              >
                                <div className="flex items-start space-x-4">
                                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                    <img
                                      src={
                                        comment.userId.profilePicture
                                          ? `http://localhost:4000/${comment.userId.profilePicture}`
                                          : "https://via.placeholder.com/40"
                                      }
                                      alt="Comment user profile"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src =
                                          "https://via.placeholder.com/40";
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center mb-1">
                                      <h5 className="font-semibold text-gray-800">
                                        {comment.userId.username}
                                      </h5>
                                    </div>
                                    <p className="card-content">
                                      {comment.comment}
                                    </p>
                                    <button
                                      onClick={() =>
                                        toggleReplyInput(comment._id)
                                      }
                                      className="mt-2 mb-3 text-blue-500 focus:outline-none"
                                    >
                                      Reply ({comment.reply.length})
                                    </button>
                                    {activeReplyInput === comment._id && (
                                      <div className="mt-2">
                                        <textarea
                                          placeholder="Write a reply..."
                                          value={replyInputs[comment._id] || ""}
                                          onChange={(e) =>
                                            handleReplyInputChange(
                                              comment._id,
                                              e.target.value
                                            )
                                          }
                                          className="w-full p-2 border rounded-lg focus:outline-none"
                                        ></textarea>
                                        <button
                                          onClick={() =>
                                            handlePostReply(
                                              comment._id,
                                              post._id
                                            )
                                          }
                                          className="mt-2 mb-3 bg-blue-500 text-white px-4 py-2 rounded-lg"
                                        >
                                          Post Reply
                                        </button>
                                        <div className="space-y-4 mt-2">
                                          {(comment.reply || []).map(
                                            (reply) => (
                                              <div
                                                key={reply._id}
                                                className="p-2 border rounded-lg ml-4"
                                              >
                                                <div className="flex items-start space-x-4">
                                                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                    <img
                                                      src={
                                                        reply.userId
                                                          .profilePicture
                                                          ? `http://localhost:4000/${reply.userId.profilePicture}`
                                                          : "https://via.placeholder.com/40"
                                                      }
                                                      alt="Reply user profile"
                                                      className="w-full h-full object-cover"
                                                      onError={(e) => {
                                                        e.target.src =
                                                          "https://via.placeholder.com/40";
                                                      }}
                                                    />
                                                  </div>
                                                  <div className="flex-1">
                                                    <div className="flex items-center mb-1">
                                                      <h6 className="font-semibold text-gray-800">
                                                        {reply.userId.username}
                                                      </h6>
                                                    </div>
                                                    <p className="card-content">
                                                      {reply.replyText}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* ... dots */}
                    <div className="relative">
                      <button
                        onClick={() => handleOptionsClick(post._id)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                      {showOptions === post._id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg">
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none" onClick={() => {
                            handleEdit(post._id);
                          }}>
                            Edit
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none" onClick={() => {
                            handleDelete(post._id);
                          }}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPostsData;
