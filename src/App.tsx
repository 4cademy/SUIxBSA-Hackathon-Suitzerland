import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { Counter } from "./components/CounterComponents/Counter";
import { CreateCounter } from "./components/CounterComponents/CreateCounter";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Topic from './pages/Topic';
import Main from './pages/Main';
import Forum from './pages/Forum';
import Post from './pages/Post';

<Route path="/Topic" element={<Topic />} />

function App() {
  const currentAccount = useCurrentAccount();
  const [counterId, setCounter] = useState(() => {
    const hash = window.location.hash.slice(1);
    return isValidSuiObjectId(hash) ? hash : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/Forum" element={<Forum />} />
        <Route path="/Topic" element={<Topic />} />
        <Route path="/Post" element={<Post />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
