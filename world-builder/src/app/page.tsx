/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSignMessage, useWalletClient } from "wagmi";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";
import Navbar from "@/components/sections/Navbar";
import FeedViewer from "@/components/feedViewer";
import FOLViewer from "@/components/folViewer";
import DagVisualizer from "@/components/dagVisualizer";
import { generateCid } from "@/utils/crypto";
import NodeMetadataViewer from "@/components/nodeMetadataViewer";
import { useStory } from "@/lib/context/AppContext";
import { defaultMetadata, SPG_NFT_CONTRACT_ADDRESS } from "@/lib/constants";
import { uploadImageToIPFS, uploadJsonToIPFS } from "@/lib/functions/ipfs";
import { Address } from "viem";
import { getFileHash } from "@/lib/functions/file";
import { mockHintNodes } from "@/moks/mockNodes";
import DiscoveryDialog from "@/components/sections/DiscoveryDialog";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any>();
  const [showDialog, setShowDialog] = useState(false);

  const { data: wallet } = useWalletClient();
  const { signMessageAsync } = useSignMessage();
  const { client } = useStory();

  const handleNodes = (newNode: any) => {
    setNodes((prevNodes: any) => [...prevNodes, newNode]);
  };

  const handleLinks = (newLink: any) => {
    setLinks((prevLinks: any) => [...prevLinks, newLink]);
  };

  const handleSelectedNode = (d: any) => {
    setSelectedNode((prevSelectedNode: any) => {
      console.log('d, prevSelectedNode :>> ', d, prevSelectedNode);
      if (!d) return null;
      if (prevSelectedNode && prevSelectedNode.id === d.id) {
        return null;
      } else {
        console.log('d :>> ', d);
        return d;
      }
    });
  };

  const makeHintNode = (lastNodeCid: string, hintMsgs: string[]) => {
    const hintNodes: any[] = [];
    const hintLinks: any[] = [];
    hintMsgs.forEach((msg) => {
      const newNode = {
        message: msg,
        type: "hint",
        children: [lastNodeCid]
      }
      const cid = generateCid(newNode)
      hintNodes.push({
        ...newNode,
        cid,
        id: cid,
      });

      hintLinks.push({source: cid, target: lastNodeCid, type: "dotted"});
    });
    return {
      hintNodes, hintLinks,
    }
  }
  
  const handleInput = async () => {
    if (!input.trim()) return;

    const parentHash = selectedNode.cid;
    const signature = await signMessage();
    if (!signature) return;

    const FOL = await getFOL(input);
    if (!FOL) return;

    // FIXME(yoojin): change title from getFOL
    await createPullRequest(signature, parentHash, FOL, "Title");

    const newNode = createNewNode(input);
    setSelectedNode(newNode);

    if (input.includes("KryptoPlanet")) {
      setShowDialog(true);
      return;
    }

    setInput("");
  };

  const signMessage = async () => {
    const message = "Sign this message to verify you’re the owner.";
    try {
      const signature = await signMessageAsync({ message });
      console.log("signature created:", signature);
      return signature;
    } catch (err) {
      console.error("signature failed or was rejected:", err);
      toast.error("Signature is required to continue.");
      return null;
    }
  };

  const getFOL = async (input: string) => {
    // TODO(kyungmoon): get FOL data using "src/app/api/gen-fol/route.ts" using input 
    console.log("FRONT-END input :>> ", input);
    try {
      const response = await fetch('/api/gen-fol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching FOL data:", error);
      toast.error("Failed to fetch FOL data.");
      return;
    }
  }

  const createNewNode = (input: string) => {
    const newNode = {
      message: input,
      data: [],
      children: [] as any[],
      type: "message",
    }
    const cid = generateCid(newNode);
    const { hintNodes, hintLinks } = makeHintNode(cid, mockHintNodes[input] || []);

    setNodes(
      (prevNodes: any) => 
        [
          ...prevNodes.filter((node: any) => node.type === "message"), 
          {...newNode, cid, id: cid}, 
          ...hintNodes
        ]
    );

    if (selectedNode) {
      console.log('selectedNode in createnewnode :>> ', selectedNode);
      newNode.children.push(selectedNode.cid);
      setLinks(
        (prevLinks: any) => 
          [
            ...prevLinks.filter((link: any) => link.type !== "dotted"),
            { source: cid, target: selectedNode.id },
            ...hintLinks
          ]
      );
    } else {
      setLinks(
        (prevLinks: any) => 
          [
            ...prevLinks.filter((link: any) => link.type !== "dotted"),
            ...hintLinks
          ]
      );
    }

    
    return {...newNode, cid, id: cid};
  };

  const createPullRequest = async (signature: string, parentHash: string, FOL: string, title: string) => {
    try {
      const res = await fetch("/api/fol/pull-request", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signature,
          contents: FOL,
          title,
          parentHash,
        }),
      })
      console.log('res.json() :>> ', res.json());
      return;
    } catch (error) {
      console.error("Error create PR:", error);
      toast.error("Failed to create Pull Request.");
    }
  }

  const mintAndRegisterNFT = async () => {
    if (!client) return;

    // upload image to IPFS
    const tid1 = toast.loading("Uploading image to IPFS...");
    const image = await fileFromUrl("/asset/kryptoplanet.png");
    const formData = new FormData();
    formData.append("file", image);
    const imageIpfsHash = await uploadImageToIPFS(formData);
    toast.success(`IPFS upload completed. URI: ${imageIpfsHash}`, { id: tid1 });

    // create and upload NFT metadata
    const nftData = {
      name: defaultMetadata.name,
      description: defaultMetadata.description,
      image: `https://ipfs.io/ipfs/${imageIpfsHash}`,
    };
    const nftIpfsCid = await uploadJsonToIPFS(nftData);
    const nftMetadataHash = CryptoJS.SHA256(JSON.stringify(nftData)).toString(CryptoJS.enc.Hex);

    // create and upload IP data
    const tid2 = toast.loading("Creating IP metadata...");
    const ipData = client.ipAsset.generateIpMetadata({
      title: defaultMetadata.name,
      description: defaultMetadata.description,
      image: `https://ipfs.io/ipfs/${imageIpfsHash}`,
      imageHash: await getFileHash(image as File),
      mediaUrl: `https://ipfs.io/ipfs/${imageIpfsHash}`,
      mediaHash: await getFileHash(image as File),
      mediaType: "image/png",
      creators: [
        {
          name: "Test Creator",
          contributionPercent: 100,
          address: wallet?.account.address as Address,
        },
      ],
    });
    const ipIpfsCid = await uploadJsonToIPFS(ipData);
    const ipMetadataHash = CryptoJS.SHA256(JSON.stringify(ipData)).toString(CryptoJS.enc.Hex);
    toast.success(
      `IP metadata created: ${JSON.stringify({
        name: ipData.title,
        description: ipData.description,
        image: ipData.image,
      })} `,
      { id: tid2 }
    );

    // mint and register IPA
    const tid3 = toast.loading("Minting and registering an IP Asset...");
    const response = await client.ipAsset.mintAndRegisterIp({
      spgNftContract: SPG_NFT_CONTRACT_ADDRESS,
      ipMetadata: {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsCid}`,
        ipMetadataHash: `0x${ipMetadataHash}`,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsCid}`,
        nftMetadataHash: `0x${nftMetadataHash}`,
      },
      txOptions: { waitForTransaction: true },
    });
    console.log(`IPA created at tx hash ${response.txHash}, IPA ID: ${response.ipId}`);
    toast.success(`IPA "${defaultMetadata.name}" registered!`, { id: tid3 });
  };

  const fileFromUrl = async (url: string): Promise<File> => {
    const res = await fetch(url, { mode: "no-cors" });
    const blob = await res.blob();
    return new File([blob], "image.png", { type: blob.type });
  };

  const handleInputOnChild = (message: string) => {
    setInput(message);
  }

  const handleConfirmMint = async () => {
    setShowDialog(false);
    console.log("🎉 Minting logic for KryptoPlanet triggered!");
    await mintAndRegisterNFT();
  };

  const handleCancelMint = () => {
    setShowDialog(false);
  };

  return (
    <div className="flex flex-col h-full w-full gap-5">
      <Navbar />
      {/* Contents */}
      <div className="flex flex-row gap-4">
        <FOLViewer />
        <DagVisualizer
          nodes={nodes}
          links={links}
          handleLinks={handleLinks}
          handleNodes={handleNodes}
          selectedNode={selectedNode}
          handleSelectedNode={handleSelectedNode}
          handleInput={handleInputOnChild}
        />
        <div className="flex-1 flex flex-col gap-2 max-w-[350px]">
          <FeedViewer />
          <NodeMetadataViewer node={selectedNode} />
        </div>
      </div>
      {/* Input */}
      <div className="flex flex-row border-2 border-black w-full justify-between p-1">
        <input
          className="flex-1 bg-gray-200"
          placeholder="Input your next story"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleInput();
            }
          }}
        ></input>
        <button
          className=""
          onClick={(e) => {
            e.preventDefault();
            handleInput();
          }}
        >
          Generate
        </button>
        <DiscoveryDialog
          open={showDialog}
          onConfirm={handleConfirmMint}
          onCancel={handleCancelMint}
          name="KryptoPlanet"
        />
      </div>
    </div>
  );
}
