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

import {
  TESTNET_COUNTER_PACKAGE_ID,
  FORUM_OBJECT_ADDR,
} from "../constants.ts";

interface TopicLogicProps {
  arg1: string | null;
  arg2: string | null;
  arg3: string | null;
}

const PostLogic: React.FC<TopicLogicProps> = ({ arg1, arg2, arg3 }) => {
  const createArray = (n: number): number[] => {
    return Array.from({ length: n }, (_, index) => index);
  };

  const navigate = useNavigate();

  const handleRedirect = (arg1: string, arg2: string, arg3: string) => {
    navigate(`/Post?arg1=${arg1}&arg2=${arg2}&arg3=${arg3}`);
  };

  const currentAccount = useCurrentAccount();
  const [nftUrls, setNftUrls] = useState({});

  const { SuiNSData, isSuiNSPending } = useResolveSuiNSName(currentAccount?.address);

  const forumID = FORUM_OBJECT_ADDR;

  let topicID = arg1;
  let commentsTableID = arg2;

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
    Post: {arg3}
  </div>
  
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
</div>

  );
};

export default PostLogic;
