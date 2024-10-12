import { useResolveSuiNSName } from '@mysten/dapp-kit';
import { useSuiClientQuery } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from "react";


import { useSuiClientQueries } from '@mysten/dapp-kit';

const forumObjectId = '0xFORUM_OBJECT_ID'; // Replace with your forum object ID

const { data: postsData, isPending, isError, error } = useSuiClientQuery(
  'getDynamicFields',
  { parentId: forumObjectId },
  {
    gcTime: 10000,
  },
);

const posts = postsData?.data || [];


const PostDetail = ({ postField }) => {
    const { data: postData, isPending, isError, error } = useSuiClientQuery(
      'getDynamicFieldObject',
      {
        parentId: forumObjectId,
        name: postField.name, // Name of the dynamic field
      },
      {
        gcTime: 10000,
      },
    );
  
    const postObjectId = postData?.data?.objectId;
  
    // Fetch the actual post object
    const { data: postDetail } = useSuiClientQuery(
      'getObject',
      { id: postObjectId },
      {
        gcTime: 10000,
      },
    );
  
    // Handle loading and error states
    if (isPending || !postDetail) return <div>Loading post...</div>;
    if (isError) return <div>Error loading post: {error.message}</div>;
  
    return (
      <div>
        <h2>{postDetail.data.content.title}</h2>
        <p>{postDetail.data.content.body}</p>
        <CommentsList postId={postObjectId} />
      </div>
    );
  };
const CommentsList = ({ postId }) => {
    const { data: commentsData } = useSuiClientQuery(
      'getDynamicFields',
      { parentId: postId },
      {
        gcTime: 10000,
      },
    );
  
    const comments = commentsData?.data || [];
  
    return (
      <div>
        {comments.map((commentField) => (
          <CommentDetail
            key={commentField.name}
            postId={postId}
            commentField={commentField}
          />
        ))}
      </div>
    );
  };
  
const CommentDetail = ({ postId, commentField }) => {
    const { data: commentData } = useSuiClientQuery(
      'getDynamicFieldObject',
      {
        parentId: postId,
        name: commentField.name,
      },
      {
        gcTime: 10000,
      },
    );
  
    const commentObjectId = commentData?.data?.objectId;
  
    // Fetch the actual comment object
    const { data: commentDetail } = useSuiClientQuery(
      'getObject',
      { id: commentObjectId },
      {
        gcTime: 10000,
      },
    );
  
    if (!commentDetail) return <div>Loading comment...</div>;
  
    return (
      <div>
        <p>{commentDetail.data.content.text}</p>
      </div>
    );
  };
  
const Forum = () => {
    const forumObjectId = '0xFORUM_OBJECT_ID'; // Replace with your forum object ID
  
    const { data: postsData, isPending, isError, error } = useSuiClientQuery(
      'getDynamicFields',
      { parentId: forumObjectId },
      {
        gcTime: 10000,
      },
    );
  
    if (isPending) return <div>Loading posts...</div>;
    if (isError) return <div>Error loading posts: {error.message}</div>;
  
    const posts = postsData?.data || [];
  
    return (
      <div>
        {posts.map((postField) => (
          <PostDetail key={postField.name} postField={postField} />
        ))}
      </div>
    );
  };
  
export default Forum;
