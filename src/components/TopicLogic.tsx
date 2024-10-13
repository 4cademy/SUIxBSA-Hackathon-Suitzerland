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

interface TopicLogicProps {
  arg1: string | null;
  arg2: string | null;
  arg3: string | null;
}

const TopicLogic: React.FC<TopicLogicProps> = ({ arg1, arg2, arg3 }) => {
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

  let postTableId = arg1;
  let topicText = arg2;
  let addToTopicId = arg3;

  // query the dynamic fields of the topic table

  const { data: tableData, isPending2, isError2, error2, refetch2 } = useSuiClientQuery(
    'getDynamicFields',
    { parentId: postTableId },
    {
      gcTime: 10000,
      enabled: !!postTableId,
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
  const posts = queryResults.map(({ data, isPending3, isError3, error3, refetch3 }) => ({
    data,
    isPending3,
    isError3,
    error3,
    refetch3
  }));

  console.log("Posts: ", posts);
  
  // create array of topic names
  let postArray = [];
  for (let i = 0; i < posts.length; i++) {
    if (posts[i]?.data?.data?.content?.fields?.value?.fields?.text == undefined) {
      continue;
    }
    let MyPost = {
      text: posts[i]?.data?.data?.content?.fields?.value?.fields?.text,
      creator: posts[i]?.data?.data?.content?.fields?.value?.fields?.creator,
      topicID: posts[i]?.data?.data?.content?.fields?.value?.fields?.topicID,
      commentsTableID: posts[i]?.data?.data?.content?.fields?.value?.fields?.comments?.fields?.id?.id,
      addToPostId: posts[i]?.data?.data?.content?.fields?.name
    }
    postArray.push(MyPost);
  }

  return (
<div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  padding: '20px'
}}>
  <div style={{
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px'
  }}>
    Topic: {topicText}
  </div>

  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '20px'
  }}>
    {postArray.map((item, index) => (
      <button 
        key={index} 
        onClick={() => handleRedirect(item.topicID, item.commentsTableID, item.text, addToTopicId, item.addToPostId)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#8E44AD',
          color: 'white',
          border: 'none',
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
      placeholder="Enter your post"
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
        backgroundColor: '#8E44AD',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        width: '100%',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      Create Post
    </button>
  </div>
</div>


  );

  function create(postText: string) {
    const tx = new Transaction();

    tx.moveCall({
      arguments: [tx.object(FORUM_OBJECT_ADDR), tx.object(addToTopicId), tx.pure.string(postText), tx.object('0x6')],
      target: `${TESTNET_COUNTER_PACKAGE_ID}::social_network::create_post`,
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

export default TopicLogic;
