import { useResolveSuiNSName } from '@mysten/dapp-kit';
import { useSuiClientQuery } from '@mysten/dapp-kit';
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit';
import Navbar from './Navbar'; // Import your Navbar component
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
import { SerializedBcs } from '@mysten/bcs';


const ForumLogic = () => {
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

  const navigate = useNavigate();

  const handleRedirect = (arg1: string, arg2: string, arg3: string) => {
    navigate(`/Topic?arg1=${arg1}&arg2=${arg2}&arg3=${arg3}`);
  };

  const currentAccount = useCurrentAccount();
  const [nftUrls, setNftUrls] = useState({});

  const { SuiNSData, isSuiNSPending } = useResolveSuiNSName(currentAccount?.address);

  const forumID = FORUM_OBJECT_ADDR;

  // query the ID of the topic table

  const { data: objectData, isPending, isError, error, refetch } = useSuiClientQuery(
    'getObject',
    { id: forumID ,
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
      enabled: !!forumID,
    },
  );

  console.log("ObjectData: ", objectData)

  let topicTableId = objectData?.data?.content?.fields?.topics?.fields?.id?.id;

  console.log("TopicTableID: ", topicTableId);

  // query the dynamic fields of the topic table

  const { data: tableData, isPending2, isError2, error2, refetch2 } = useSuiClientQuery(
    'getDynamicFields',
    { parentId: topicTableId },
    {
      gcTime: 10000,
      enabled: !!topicTableId,
    },
  );

  console.log("tableData: ", tableData);
  let length = tableData?.data?.length;

  // query the actual objects referenced by the dynamic fields

  const queryResults = [0, 1, 2, 3].map(index => {
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
  const topics = queryResults.map(({ data, isPending3, isError3, error3, refetch3 }) => ({
    data,
    isPending3,
    isError3,
    error3,
    refetch3
  }));

  console.log("A Topic:", topics[1]?.data);
  
  // create array of topic names
  let topicNames = [];
  for (let i = 0; i < topics.length; i++) {
    let myTopic = {
      title: topics[i]?.data?.data?.content?.fields?.value?.fields?.title,
      tableID: topics[i]?.data?.data?.content?.fields?.value?.fields?.posts?.fields?.id?.id,
      addToTopicId: topics[i]?.data?.data?.content?.fields?.name
    }
    topicNames.push(myTopic);
  }

  return (
<div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '20px'
    }}>
      {topicNames.map((item, index) => (
        <button 
          key={index} 
          onClick={() => handleRedirect(item.tableID, item.title, item.addToTopicId)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            width: '200px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          {item.title}
        </button>
      ))}
      
      <hr style={{
        width: '100%',
        margin: '20px 0',
        border: 'none',
        borderTop: '1px solid #ccc'
      }} />
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        marginTop: '20px'
      }}>
        <input 
          type="text" 
          placeholder="Enter new topic"
          id="newTopicInput"
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '200px'
          }}
        />
        <button 
          onClick={() => {
            const inputElement = document.getElementById('newTopicInput') as HTMLInputElement;
            const newTopic = inputElement.value;
            create(newTopic);
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            width: '200px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          Create Topic
        </button>
      </div>
    </div>

  );

  function create(newTopic: string) {
    const tx = new Transaction();

    tx.moveCall({
      arguments: [tx.object(FORUM_OBJECT_ADDR), tx.pure.string(newTopic)],
      target: `${TESTNET_COUNTER_PACKAGE_ID}::social_network::create_topic`,
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

export default ForumLogic;
