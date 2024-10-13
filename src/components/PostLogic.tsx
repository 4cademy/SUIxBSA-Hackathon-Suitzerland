import { useResolveSuiNSName } from '@mysten/dapp-kit';
import { useSuiClientQuery } from '@mysten/dapp-kit';
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit';
import Navbar from '../components/Navbar'; // Import your Navbar component
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { network } from '../main';
import { json } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ButtonList from './ButtonList';
import Subpage from './Subpage';
import { useNavigate } from 'react-router-dom';
import { Transaction, TransactionArgument } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

import {
  TESTNET_COUNTER_PACKAGE_ID,
  FORUM_OBJECT_ADDR,
} from "../constants.ts";

interface PostLogicProps {
  arg1: string | null;
  arg2: string | null;
  arg3: string | null;
  arg4: string | null;
  arg5: string | null;
}

const PostLogic: React.FC<PostLogicProps> = ({ arg1, arg2, arg3, arg4, arg5 }) => {
  console.log("arg1: ", arg1);
  console.log("arg2: ", arg2);
  console.log("arg3: ", arg3);
  console.log("arg4: ", arg4);
  console.log("arg5: ", arg5);
  const suiClient = useSuiClient();

  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          // Raw effects are required so the effects can be reported back to the wallet
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });
  const createArray = (n: number): number[] => {
    return Array.from({ length: n }, (_, index) => index);
  };

  const navigate = useNavigate();

  const handleRedirect = (arg1: string, arg2: string, arg3: string, arg4: string, arg5: string) => {
    navigate(`/Post?arg1=${arg1}&arg2=${arg2}&arg3=${arg3}&arg4=${arg4}&arg5=${arg5}`);
  };

  const currentAccount = useCurrentAccount();
  const [nftUrls, setNftUrls] = useState({});

  const { SuiNSData, isSuiNSPending } = useResolveSuiNSName(currentAccount?.address);

  const forumID = FORUM_OBJECT_ADDR;

  let topicID = JSON.parse(arg1);
  let commentsTableID = arg2;
  let postText = arg3;
  let addToTopicId = topicID[0];
  let addToPostId = topicID[1];

  // query the dynamic fields of the topic table

  const { data: tableData, isPending2, isError2, error2, refetch2 } = useSuiClientQuery(
    'getDynamicFields',
    { parentId: commentsTableID },
    {
      gcTime: 10000,
      enabled: !!commentsTableID,
    },
  );

  console.log("tableData: ", tableData);
  let length = tableData?.data?.length || 0;

  // query the actual objects referenced by the dynamic fields
  
  let a = createArray(20);

  const queryResults = a.map(index => {
    return useSuiClientQuery(
      'getObject',
      { 
        id: tableData?.data[index]?.objectId,
        options: {
          "showBcs": false,
          "showContent": true,
          "showDisplay": false,
          "showOwner": true,
          "showPreviousTransaction": false,
          "showStorageRebate": false,
          "showType": true,
        }
      },
      {
        gcTime: 10000,
        enabled: !!tableData,
      }
    );
  });
  
  // Access the data from the array
  const comments = queryResults.map(({ data, isPending3, isError3, error3, refetch3 }) => ({
    data,
    isPending3,
    isError3,
    error3,
    refetch3
  }));

  console.log("Comments: ", comments);
  
  // create array of topic names
  let commentsArray = [];
  for (let i = 0; i < comments.length; i++) {
    if (comments[i]?.data?.data?.content?.fields?.value?.fields?.text == undefined) {
      continue;
    }
    let MyComment = {
      text: comments[i]?.data?.data?.content?.fields?.value?.fields?.text,
      creator: comments[i]?.data?.data?.content?.fields?.value?.fields?.creator,
      topicID: comments[i]?.data?.data?.content?.fields?.value?.fields?.topicID,
      postID: comments[i]?.data?.data?.content?.fields?.value?.fields?.postID,
      commentsTableID: comments[i]?.data?.data?.content?.fields?.value?.fields?.comments?.fields?.id?.id
    }
    commentsArray.push(MyComment);
  }

  console.log("addToTopicId: ", addToTopicId);
  console.log("addToPostId: ", addToPostId);

  return (
<div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  padding: '20px'
}}>
  <button style={{
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
    backgroundColor: '#8E44AD', // New background color
    color: 'white', // Changed text color for better contrast
    padding: '15px 30px', // Added padding for better appearance
    border: 'none', // Removed border
    borderRadius: '12px', // Added border radius for consistency
    cursor: 'pointer', // Changed cursor to pointer on hover
    width: '80%', // Made the button wider
    maxWidth: '400px', // Set a maximum width
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)', // Added shadow for depth
    transition: 'all 0.3s ease' // Added transition for smooth hover effects
  }}>
    Post: {postText}
  </button>
  Comments:
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '20px'
  }}>
    {commentsArray.map((item, index) => (
      <button 
        key={index} 
        style={{
          padding: '10px 20px',
          backgroundColor: '#F4E6C3', // Changed to a parchment-like color
          color: '#333', // Changed text color to dark gray for better contrast
          border: '1px solid #D3C6A6', // Added a subtle border
          borderRadius: '12px',
          cursor: 'pointer',
          width: '200px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <span style={{
          fontWeight: 'bold',
          fontSize: '18px',
          marginBottom: '5px'
        }}>
          {item.text}
        </span>
        <span style={{
          fontSize: '12px'
        }}>
          Creator: {item.creator.slice(0, 10)}...
        </span>
      </button>
    ))}
  </div>

  <div style={{
    width: '100%',
    height: '1px',
    backgroundColor: '#ccc',
    margin: '10px 0'
  }}></div>

  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    maxWidth: '300px'
  }}>
    <input
      type="text"
      id="post-input"
      placeholder="Enter your comment"
      style={{
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc'
      }}
    />
    <button
      onClick={() => {
        const inputElement = document.getElementById('post-input') as HTMLInputElement;
        const newPost = inputElement.value;
        create(newPost);
      }}
      style={{
        padding: '10px 20px',
        backgroundColor: '#F4E6C3',
        color: '#333',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        width: '100%',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      Create Comment
    </button>
  </div>
</div>

  );

  function create(postText: string) {
    const tx = new Transaction();

    console.log("addToTopicId: ", addToTopicId);
    console.log("addToPostId: ", addToPostId);

    tx.moveCall({
      arguments: [tx.object(FORUM_OBJECT_ADDR), tx.object(addToTopicId), tx.object(addToPostId), tx.pure.string(postText), tx.object('0x6')],
      target: `${TESTNET_COUNTER_PACKAGE_ID}::social_network::create_comment`,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: (result) => {
          // Refresh the page
          location.reload();
        },
      },
    );
  }
};

export default PostLogic;
