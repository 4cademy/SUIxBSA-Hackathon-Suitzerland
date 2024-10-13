
import Navbar from '../components/Navbar';
import { Transaction, TransactionArgument } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";

import {
  TESTNET_COUNTER_PACKAGE_ID,
  FORUM_OBJECT_ADDR,
} from "../constants.ts";


const Home = () => {

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

  return (
   
    <div className="flex justify-center items-center bg-base-200 " >


      <Navbar />

      <main className="container mx-auto px-4 mt-20">
        <section className="hero bg-base-100 rounded-lg shadow-md mb-8">
          <div className="hero-content text-center  py-12">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-4 text-blue-600">Suitzerland</h1>
            <p className="mb-6">
              Where you own your social future!
            </p>
            <input
              type="text"
              placeholder="Username"
              className="input input-bordered w-full mb-2"
              id="username"
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full mb-2"
              id="email"
            />
            <button
              className="btn btn-primary bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                const username = (document.getElementById('username') as HTMLInputElement).value;
                const email = (document.getElementById('email') as HTMLInputElement).value;
                create(username, email);
              }}
            >
              Create an account
            </button>
          </div>

          </div>
        </section>
      </main>

      
      </div>
  );

  function create(username: string, email: string) {
    const tx = new Transaction();

    tx.moveCall({
      arguments: [tx.object(FORUM_OBJECT_ADDR), tx.pure.string(username), tx.pure.string(email), tx.object('0x6')],
      target: `${TESTNET_COUNTER_PACKAGE_ID}::social_network::create_user`,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: (result) => {
          // Refresh the page
          window.location.href = '/Forum';
        },
      },
    );
  }
};

export default Home;
