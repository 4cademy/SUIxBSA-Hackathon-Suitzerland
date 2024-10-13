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


const ForumLogic = () => {
  const navigate = useNavigate();

  const handleRedirect = (arg1: string, arg2: string, arg3: string) => {
    navigate(`/Topic?arg1=${arg1}&arg2=${arg2}&arg3=${arg3}`);
  };

  const currentAccount = useCurrentAccount();
  const [nftUrls, setNftUrls] = useState({});

  const { SuiNSData, isSuiNSPending } = useResolveSuiNSName(currentAccount?.address);

  const forumID = "0x483fa41b9a5c06f7d6dd8ebc2b725470bb0b79aad4d224b3c63403f832015be0";

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

  console.log("A Topic:", topics[0]?.data);
  
  // create array of topic names
  let topicNames = [];
  for (let i = 0; i < topics.length; i++) {
    let myTopic = {
      title: topics[i]?.data?.data?.content?.fields?.value?.fields?.title,
      tableID: topics[i]?.data?.data?.content?.fields?.value?.fields?.posts?.fields?.id?.id
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
          onClick={() => handleRedirect(item.tableID, item.tableID, item.title)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '12px', // This creates rounded corners [[5]]
            cursor: 'pointer',
            width: '200px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
};

export default ForumLogic;
