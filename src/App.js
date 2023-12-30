// src/App.js
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

import starNotaryArtifact from "./truffle/build/contracts/StarNotaryV2.json";

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [starName, setStarName] = useState("");
  const [starId, setStarId] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [lookedUpStar, setLookedUpStar] = useState("");

  const [newOwner, setNewOwner] = useState(false);

  const addSepoliaContract = "0xFcD73381EdE18fDC456e9FABa1F60EfC97AA7e19";

  useEffect(() => {
    connectWallet();
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    if (window.ethereum || window.web3) {
      // Use the injected provider (e.g., MetaMask)
      const _web3 = new Web3(window.ethereum);
      const _contract = new _web3.eth.Contract(
        starNotaryArtifact.abi,
        addSepoliaContract
      );
      setWeb3(_web3);
      setContract(_contract);
      try {
        // Request account access if needed
        await window.eth_requestAccounts;
        const acc = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccounts(acc[0]);
        console.log(accounts);
        setWeb3(_web3);
      } catch (error) {
        console.log("User denied account access");
      }
    } else if (window.web3) {
      // Use the web3 provided by the browser (legacy)
      const _web3 = new Web3(window.web3.currentProvider);
      const _contract = new web3.eth.Contract(
        starNotaryArtifact.abi,
        addSepoliaContract
      );
      setContract(_contract);
      setWeb3(_web3);
    } else {
      console.log(
        "No web3 detected. Install MetaMask or use a web3-enabled browser."
      );
    }
  };

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      // From now on, this should always be true:
      provider === window.ethereum;
      console.log("Ethereum successfully detected!");
    } else {
      console.error("Please install MetaMask!");
    }
  };

  const createStar = async () => {
    try {
      await contract.methods
        .createStar(starName, starId)
        .send({ from: accounts });

      setNewOwner(true);
    } catch (error) {
      console.log(error);
    }
  };

  const lookUpStar = async (id) => {
    try {
      const star = await contract.methods
        .lookUptokenIdToStarInfo(id)
        .call({ from: accounts });
      setLookedUpStar(star);

      if (star[0] === "") {
        alert("Star not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>StarNotary Token DAPP</h1>
      <hr></hr>
      <h1>Create a Star</h1>
      <label htmlFor="starName">Star Name:</label>
      <input
        type="text"
        id="starName"
        onChange={(e) => setStarName(e.target.value)}
        value={starName}
      />
      <br />
      <br />
      <label htmlFor="starId">Star ID:</label>
      <input
        type="text"
        onChange={(e) => setStarId(e.target.value)}
        value={starId}
      />{" "}
      &nbsp;
      <button onClick={async () => createStar()} id="createStar">
        Create Star
      </button>
      <br />
      <br />
      <h1>Look up a Star</h1>
      <label htmlFor="name">Star ID:</label>
      <input
        type="text"
        onChange={(e) => setLookupId(e.target.value)}
        value={lookupId}
      />{" "}
      &nbsp;
      <button onClick={async () => lookUpStar(lookupId)}>Look Up a Star</button>
      {lookUpStar.length !== 0 && <div>{<p>Star Name: {lookedUpStar}</p>}</div>}
      <br />
      <br />
      <h1>Star Owner</h1>
      {newOwner && <p>New Star Owner is {accounts}</p>}
    </div>
  );
}

export default App;
