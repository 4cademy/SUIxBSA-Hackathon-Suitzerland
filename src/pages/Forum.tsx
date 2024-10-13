import { useResolveSuiNSName } from '@mysten/dapp-kit';
import { useSuiClientQuery } from '@mysten/dapp-kit';
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit';
import Navbar from '../components/Navbar'; // Import your Navbar component
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import ForumLogic from '../components/ForumLogic';


const Forum = () => {
  const currentAccount = useCurrentAccount();

  const { SuiNSData, isSuiNSPending } = useResolveSuiNSName(currentAccount?.address);

  return (
    <div className=" bg-base-200 " >
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <section className="hero bg-base-100 rounded-lg shadow-md ">  
          <ForumLogic />
        </section>
      </main>
    </div>

  );
};

export default Forum;
