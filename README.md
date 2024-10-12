# Decentralized Social Media Infrastructure on Sui Blockchain

Welcome to the [BSA](https://bsaepfl.ch/) x [SUI](https://sui.io/) Hackathon Project!

## Introduction

The project aims to develop a decentralized social media infrastructure (protocol) built on the Sui blockchain using the Sui Move programming language. The protocol will store all social media data—such as profiles, posts, comments, and other interactions—directly on the blockchain. This allows different client applications to access the data and provide a user friendly view on top of the underlying data along with various additional functionalities, such as encryption, ads, and different methods of querying and presenting the data.

## Benefits of Decentralization/Sui

## Objectives

* Create a decentralized protocol for social media data storage on the Sui blockchain.
* Enable multiple client applications to interact with the protocol, offering diverse functionalities and user experiences.
* Ensure data interoperability and accessibility, allowing clients to query and present data in various ways.
* leverage the Sui language features to implement efficient and secure smart contracts.
* Promote user control and privacy by leveraging blockchain's decentralized nature.

## Architecture Overview
(Note: Replace with an actual architecture diagram.)
* Data Layer: Decentralized storage of all social media data on the sui blockchain. 
* Client Applications: Various front-end applications developed by third parties or the community, providing different user experiences. 
* Wallet Integration: Users interact with the protocol using wallets that manage their identities and assets.
* APIs and SDKs: Tools and libraries for developers to build client applications that interact with the protocol.

## Deploying the project

### Install Sui cli

Before deploying your move code, ensure that you have installed the Sui CLI. You
can follow the [Sui installation instruction](https://docs.sui.io/build/install)
to get everything set up.

This template uses `testnet` by default, so we'll need to set up a testnet
environment in the CLI:

```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
```

If you haven't set up an address in the sui client yet, you can use the
following command to get a new address:

```bash
sui client new-address secp256k1
```

This well generate a new address and recover phrase for you. You can mark a
newly created address as you active address by running the following command
with your new address:

```bash
sui client switch --address 0xYOUR_ADDRESS...
```

We can ensure we have some Sui in our new wallet by requesting Sui from the
faucet (make sure to replace the address with your address):

```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "<YOUR_ADDRESS>"
    }
}'
```

### Publishing the move package

The move code for this template is located in the `move` directory. To publish
it, you can enter the `move` directory, and publish it with the Sui CLI:

```bash
cd move
sui client publish --gas-budget 100000000 counter
```

In the output there will be an object with a `"packageId"` property. You'll want
to save that package ID to the `src/constants.ts` file as `PACKAGE_ID`:

```ts
export const TESTNET_COUNTER_PACKAGE_ID = "<YOUR_PACKAGE_ID>";
```

Now that we have published the move code, and update the package ID, we can
start the app.

## Starting your dApp

To install dependencies you can run

```bash
pnpm install
```

To start your dApp in development mode run

```bash
pnpm dev
```

## Building

To build your app for deployment you can run

```bash
pnpm build
```
