/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
import {
  commercialRemixTerms,
  DEFAULT_NFT_METADATA,
  SPG_NFT_CONTRACT_ADDRESS,
} from "@/lib/constants";
import { Address } from "viem";
import { getFileHash } from "@/lib/functions/file";
import mockNodes, { mockHintNodes } from "@/moks/mockNodes";
import DiscoveryDialog from "@/components/sections/DiscoveryDialog";
import { delay } from "@/utils/time";
import {
  extractRegistrationMetadata,
  parseClaudeRawOutputToMessage,
  readStreamAsText,
} from "@/utils/stream";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any>();
  const [showDialog, setShowDialog] = useState(false);
  const [useMcp, setUseMcp] = useState(false);

  const { data: wallet } = useWalletClient();
  const { signMessageAsync } = useSignMessage();
  const { client } = useStory();

  useEffect(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    for (const [cid, node] of Object.entries(mockNodes)) {
      nodes.push(node);
      node.children.forEach((cid: string) => {
        links.push({
          source: node.cid,
          target: cid,
          group: node.type === "hint" ? "dotted" : "solid",
        });
      });
    }

    setNodes(nodes);
    setLinks(links);
  }, []);

  const handleNodes = (newNode: any) => {
    setNodes((prevNodes: any) => [...prevNodes, newNode]);
  };

  const handleLinks = (newLink: any) => {
    setLinks((prevLinks: any) => [...prevLinks, newLink]);
  };

  const handleSelectedNode = (d: any) => {
    setSelectedNode((prevSelectedNode: any) => {
      if (!d) return null;
      if (prevSelectedNode && prevSelectedNode.id === d.id) {
        return null;
      } else {
        console.log("d :>> ", d);
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
        children: [lastNodeCid],
      };
      const cid = generateCid(newNode);
      hintNodes.push({
        ...newNode,
        cid,
        id: cid,
      });

      hintLinks.push({ source: cid, target: lastNodeCid, type: "dotted" });
    });
    return {
      hintNodes,
      hintLinks,
    };
  };

  const handleInput = async () => {
    if (!input.trim()) return;

    const signature = await signMessage();
    if (!signature) return;

    // resTxt2Fol: { fol: string, title: string }
    const loadingToast = toast.loading("FOL 생성 중...");
    const resTxt2Fol = await getFOL(input);
    if (!resTxt2Fol) {
      toast.error("FOL 생성 실패", { id: loadingToast });
      return;
    }
    toast.success("FOL 생성 완료", { id: loadingToast });

    const FOL = resTxt2Fol.fol;
    const folTitle = resTxt2Fol.title;

    const prToast = toast.loading("Pull Request 생성 중...");
    const newCid = await createPullRequest({
      signature,
      parentHash: selectedNode ? selectedNode.cid : "0x1234",
      FOL,
      title: folTitle,
    });
    toast.success("Pull Request 생성 완료", { id: prToast });

    const newNode = createNewNode(input, newCid);
    setSelectedNode(newNode);

    if (input.toLowerCase().includes("water")) {
      const discoveryToast = toast.loading("발견된 스토리 분석 중...");
      setShowDialog(true);
      toast.success("발견된 스토리 분석 완료", { id: discoveryToast });
      return;
    }

    setInput("");
  };

  const signMessage = async () => {
    const message = "Sign this message to verify you're the owner.";
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
      const response = await fetch("/api/gen-fol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching FOL data:", error);
      toast.error("Failed to fetch FOL data.");
      return;
    }
  };

  const createNewNode = (input: string, cid?: string) => {
    cid = cid ? cid : generateCid(input);
    const newNode = {
      id: cid,
      cid,
      message: input,
      data: [],
      children: [] as any[],
      type: "message",
    };
    const { hintNodes, hintLinks } = makeHintNode(cid, mockHintNodes[input] || []);

    setNodes((prevNodes: any) => [...prevNodes, newNode, ...hintNodes]);

    if (selectedNode) {
      console.log("selectedNode in createnewnode :>> ", selectedNode);
      newNode.children.push(selectedNode.cid);
      setLinks((prevLinks: any) => [
        ...prevLinks,
        { source: cid, target: selectedNode.id },
        ...hintLinks,
      ]);
    } else {
      setLinks((prevLinks: any) => [
        ...prevLinks.filter((link: any) => link.type !== "dotted"),
        ...hintLinks,
      ]);
    }

    return { ...newNode, cid, id: cid };
  };

  const createPullRequest = async ({
    signature,
    FOL,
    title,
    parentHash,
  }: {
    signature: string;
    FOL: string;
    title: string;
    parentHash?: string;
  }) => {
    try {
      const res = await fetch("/api/fol/pull-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature,
          contents: FOL,
          title,
          parentHash,
        }),
      });
      const data = await res.json();
      console.log("res.json() :>> ", data);
      return data.hash;
    } catch (error) {
      console.error("Error create PR:", error);
      toast.error("Failed to create Pull Request.");
    }
  };

  const fileFromUrl = async (url: string): Promise<File> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], "image.png", { type: blob.type });
  };

  const handleInputOnChild = (message: string) => {
    setInput(message);
  };

  const handleConfirmMint = async ({
    imageUrl,
    name,
    description,
  }: {
    imageUrl: string;
    name: string;
    description: string;
  }) => {
    setShowDialog(false);
    if (useMcp) {
      await mintNFTWithMCP(imageUrl, name, description);
    } else {
      await mintNFTWithSDK(imageUrl, name, description);
    }
  };

  const mintNFTWithSDK = async (imageUrl: string, name: string, description: string) => {
    if (!client) return;

    const image = await fileFromUrl(imageUrl);
    const imageIpfsHash = await uploadImageToIPFS(image);
    const imageIpfsUrl = `https://ipfs.io/ipfs/${imageIpfsHash}`;

    const nftData = {
      name,
      description,
      image: imageIpfsUrl,
    };
    const nftIpfsCid = await uploadJsonToIPFS(nftData);
    const nftMetadataHash = hashJson(nftData);

    const ipMetadata = await generateIPMetadata(name, description, image, imageUrl);
    const ipIpfsCid = await uploadJsonToIPFS(ipMetadata);
    const ipMetadataHash = hashJson(ipMetadata);

    await mintAndRegister(ipIpfsCid, ipMetadataHash, nftIpfsCid, nftMetadataHash);
  };

  const uploadImageToIPFS = async (image: Blob | File): Promise<string> => {
    const toastId = toast.loading("Uploading image to IPFS...");
    const formData = new FormData();
    formData.append("file", image);
    const res = await fetch("/api/ipfs/image", { method: "POST", body: formData });
    const { ipfsHash } = await res.json();
    toast.success(`IPFS upload completed: ${ipfsHash}`, { id: toastId });
    return ipfsHash;
  };

  const uploadJsonToIPFS = async (data: any): Promise<string> => {
    const res = await fetch("/api/ipfs/json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const { ipfsHash } = await res.json();
    return ipfsHash;
  };

  const hashJson = (data: any): string => {
    return CryptoJS.SHA256(JSON.stringify(data)).toString(CryptoJS.enc.Hex);
  };

  const generateIPMetadata = async (
    name: string,
    description: string,
    image: File,
    imageUrl: string,
  ): Promise<any> => {
    const toastId = toast.loading("Creating IP metadata...");

    const hash = await getFileHash(image);
    const metadata = client!.ipAsset.generateIpMetadata({
      title: name,
      description: description,
      image: imageUrl,
      imageHash: hash,
      mediaUrl: imageUrl,
      mediaHash: hash,
      mediaType: "image/png",
      creators: [
        {
          name: "Test Creator",
          contributionPercent: 100,
          address: wallet?.account.address as Address,
        },
      ],
    });

    toast.success(`IP metadata created`, { id: toastId });
    return metadata;
  };

  const mintAndRegister = async (
    ipIpfsCid: string,
    ipMetadataHash: string,
    nftIpfsCid: string,
    nftMetadataHash: string,
  ) => {
    const toastId = toast.loading("Minting and registering an IP Asset...");

    const response = await client!.ipAsset.mintAndRegisterIpAssetWithPilTerms({
      spgNftContract: SPG_NFT_CONTRACT_ADDRESS,
      licenseTermsData: [{ terms: commercialRemixTerms }],
      ipMetadata: {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsCid}`,
        ipMetadataHash: `0x${ipMetadataHash}`,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsCid}`,
        nftMetadataHash: `0x${nftMetadataHash}`,
      },
      txOptions: { waitForTransaction: true },
    });

    console.log(`IPA created at tx hash ${response.txHash}, IPA ID: ${response.ipId}`);
    toast.success(`IPA "${DEFAULT_NFT_METADATA.name}" registered! Tx Hash: ${response.txHash}`, {
      id: toastId,
    });
  };

  const mintNFTWithMCP = async (imageUrl: string, name: string, description: string) => {
    const toast1 = toast.loading("Uploading image to IPFS...");
    try {
      // Step 1: upload_image_to_ipfs
      const resp1 = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Call upload_image_to_ipfs() with image_data=${imageUrl}` }),
      });
      const text1 = await readStreamAsText(resp1.body!);
      console.log(text1);

      const ipfsUriMatch = text1.match(/ipfs:\/\/[a-zA-Z0-9]+/);
      const ipfsUri = ipfsUriMatch
        ? ipfsUriMatch[0]
        : "ipfs://QmX7cVQrc8tgDVcGRaC9sTttH2Xrbc2a4REsvJQkJa6B4z";
      console.log("Image IPFS URI: ", ipfsUri);

      const result1 = parseClaudeRawOutputToMessage(text1);
      toast.success(`🤖 IPFS Uploaded: ${result1}`, { id: toast1 });
      await delay(5000);

      // Step 2: create_ip_metadata
      const toast2 = toast.loading("Creating IP metadata...");
      const res2 = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Call create_ip_metadata() with image_uri=${ipfsUri}, name=${name}, description=${description}`,
        }),
      });
      const text2 = await readStreamAsText(res2.body!);
      console.log(text2);

      const metadata = extractRegistrationMetadata(text2);

      const ipMetadata = {
        ipMetadataURI: metadata.ip_metadata_uri,
        ipMetadataHash: metadata.ip_metadata_hash,
        nftMetadataURI: metadata.nft_metadata_uri,
        nftMetadataHash: metadata.nft_metadata_hash,
      };
      console.log(ipMetadata);

      const result2 = parseClaudeRawOutputToMessage(text2);
      toast.success(`🤖 Metadata created: ${result2}`, { id: toast2 });
      await delay(5000);

      // Step 3: mint_and_register_ip_with_terms
      const toast3 = toast.loading("Minting and registering IP asset...");
      const res3 = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Call mint_and_register_ip_with_terms() with commercial_rev_share=5, derivatives_allowed=true, registration_metadata=${JSON.stringify(
            ipMetadata
          )}, spg_nft_contract=${SPG_NFT_CONTRACT_ADDRESS}`,
        }),
      });
      const text3 = await readStreamAsText(res3.body!);
      console.log(text3);

      const txHashMatch = text3.match(/Transaction Hash: ([a-fA-F0-9]+)/);
      const tokenIdMatch = text3.match(/Token ID: (\d+)/);
      const explorerUrlMatch = text3.match(
        /(https:\/\/aeneid\.explorer\.story\.foundation\/ipa\/[a-zA-Z0-9x]+)/
      );

      const txHash = txHashMatch ? txHashMatch[1] : "";
      const tokenId = tokenIdMatch ? tokenIdMatch[1] : "";
      const explorerUrl = explorerUrlMatch ? explorerUrlMatch[0] : "";

      console.log({ txHash, tokenId, explorerUrl });

      const result3 = parseClaudeRawOutputToMessage(text3);
      toast.success(`🎉 IP Registered! ${result3}`, { id: toast3 });

      console.log("✅ MCP Mint Complete:", {
        step1: text1,
        step2: text2,
        step3: text3,
      });
    } catch (err) {
      console.error("MCP mint error:", err);
      toast.error("Something went wrong during MCP minting.");
    }
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
        />
      </div>
    </div>
  );
}
