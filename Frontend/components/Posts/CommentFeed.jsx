import { useState, useEffect } from "react";

import CardActions from "@mui/material/CardActions";

import Button from "@mui/material/Button";
import { Divider } from "@mui/material";

import * as commentAPI from "../../api/comment.js";
import CreateComment from "./CreateComment";
import HandleComment from "./HandleComment";
import * as React from "react";

function CommentFeed(props) {
  const { post, userId } = props;

  const [comments, setComments] = useState([]);

  const [showComments, setShowComments] = useState(false);
  const [ numComments, setNumComments ] = useState(0);
  const [commentsUpdated, setCommentsUpdated] = useState(false);

  const token = localStorage.getItem("user-token");

  const onShowComments = () => {
    setShowComments(!showComments);
  };

  useEffect(() => {
    (async () => {
      let data = await commentAPI.getCommentByFilter(token, { postId: post.id });
      setComments(data.data);
      setNumComments(data.data.length);
    })();
  }, []);

  const getComments = async () => {
    try {
      let data = await commentAPI.getCommentByFilter(token, { postId: post.id });
      setComments(data.data);
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    if (commentsUpdated) {
      (async () => {
        await getComments();
        setCommentsUpdated(false);
      })();
    }
  }, [commentsUpdated]);

  return (
    <>
      <CreateComment
        setComments={setComments}
        comments={comments}
        setShowComments={setShowComments}
        post={post}
        setCommentsUpdated={setCommentsUpdated}
        userId={userId}
      />
      <CardActions>
        {showComments ? (
          <Button onClick={onShowComments}>Hide Comments</Button>
        ) : (
          <Button onClick={onShowComments}>{numComments === 0 ? `This post has no comments` : `This post has ${numComments} comments`}</Button>
        )}
      </CardActions>
      {showComments ? (
        <>
          {comments.map((comment, index) => (
          
              <React.Fragment key={comment.id}>
                <HandleComment
                  userId={comment.userId}
                  comment={comment}
                  setCommentsUpdated={setCommentsUpdated}
                  editable={comment.userId === userId}
                />
              </React.Fragment>
          
          ))}
        </>
      ) : (
        <></>
      )}
    </>
  );
}

export default CommentFeed;
