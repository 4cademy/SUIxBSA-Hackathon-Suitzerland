import { useResolveSuiNSName } from '@mysten/dapp-kit';
import { useSuiClientQuery } from '@mysten/dapp-kit';
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit';
import Navbar from '../components/Navbar'; // Import your Navbar component
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import TopicLogic from '../components/TopicLogic';
import { useLocation } from 'react-router-dom';


const Topic = () => {
  const currentAccount = useCurrentAccount();

  const { SuiNSData, isSuiNSPending } = useResolveSuiNSName(currentAccount?.address);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const arg1 = searchParams.get('arg1');
  const arg2 = searchParams.get('arg2');
  const arg3 = searchParams.get('arg3');

  console.log("Arg1: ", arg1);
  console.log("Arg2: ", arg2);
  console.log("Arg3: ", arg3);

  return (
    <div className=" bg-base-200 " >
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <section className="hero bg-base-100 rounded-lg shadow-md ">  
        <TopicLogic arg1={arg1} arg2={arg2} arg3={arg3} />
        </section>
      </main>
    </div>

  );
};

export default Topic;
