import React, { useState } from "react";
import "./CommentSection.css";
import arrowIcon from "../../../public/images/arrow.svg";
import Image from "next/image";

const CommentSection = ({
  comments,
  commentText,
  setCommentText,
  submittingComment,
  handleCommentSubmit,
  handleReplySubmit,
}) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleReplyClick = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyText("");
  };

  const submitReply = (commentId) => {
    if (!replyText.trim()) return;

    handleReplySubmit(commentId, replyText);
    setReplyText("");
    setReplyingTo(null);
  };

  const handleKeyDown = (e, submitFn) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      submitFn();
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-input-wrapper">
        <div className="comment-input-container">
          <textarea
            className="comment-input"
            placeholder="დაწერე კომენტარი"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleCommentSubmit)}
            disabled={submittingComment}
          />
          <button
            className="submit-comment-btn"
            onClick={handleCommentSubmit}
            disabled={!commentText.trim() || submittingComment}
          >
            {submittingComment ? "იგზავნება..." : "დააკომენტარე"}
          </button>
        </div>
      </div>

      <div className="comments-list">
        <h3 className="comments-list-header">
          კომენტარები
          {comments && comments.length > 0 ? (
            <span className="comments-list-header-num">{comments.length}</span>
          ) : (
            <span className="comments-list-header-num"> 0</span>
          )}
        </h3>

        {!comments || comments.length === 0 ? (
          <div className="no-comments">
            <p>ამ დავალებას ჯერ არ აქვს კომენტარები</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-container">
              <div className="comment">
                <div className="comment-avatar">
                  <img
                    src={comment.author_avatar}
                    alt={comment.author_nickname}
                  />
                </div>
                <div className="comment-content">
                  <div className="comment-author">
                    {comment.author_nickname}
                  </div>
                  <div className="comment-text">{comment.text}</div>
                  <button
                    className="reply-button"
                    onClick={() => handleReplyClick(comment.id)}
                  >
                    <Image
                      className="reply-button-arrow"
                      width={16}
                      height={16}
                      alt="arrow icon"
                      src={arrowIcon}
                    ></Image>
                    უპასუხე
                  </button>
                </div>
              </div>

              {replyingTo === comment.id && (
                <div className="reply-input-container">
                  <textarea
                    className="reply-input"
                    placeholder="შეიყვანე პასუხი..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(e, () => submitReply(comment.id))
                    }
                  />
                  <button
                    className="submit-reply-btn"
                    onClick={() => submitReply(comment.id)}
                    disabled={!replyText.trim()}
                  >
                    პასუხი
                  </button>
                </div>
              )}

              {comment.sub_comments && comment.sub_comments.length > 0 && (
                <div className="sub-comments">
                  {comment.sub_comments.map((reply) => (
                    <div key={reply.id} className="reply">
                      <div className="comment-avatar">
                        <img
                          src={reply.author_avatar}
                          alt={reply.author_nickname}
                        />
                      </div>
                      <div className="comment-content">
                        <div className="comment-author">
                          {reply.author_nickname}
                        </div>
                        <div className="comment-text">{reply.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
