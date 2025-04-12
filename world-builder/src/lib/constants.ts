import { LicenseTerms, WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";
import { Address, zeroAddress } from "viem";

export const SPG_NFT_CONTRACT_ADDRESS: Address = "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc";

export const DEFAULT_NFT_METADATA = {
  name: "KryptoPlanet #001",
  description: "A mysterious mineral discovered on the Erebos Plain of Mars",
  image:
    "https://raw.githubusercontent.com/ainize-team/imperatorofmars/refs/heads/main/world-builder/public/asset/kryptoplanet.png",
};

export const commercialRemixTerms: LicenseTerms = {
  transferable: true,
  royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
  defaultMintingFee: BigInt(10),
  expiration: BigInt(0),
  commercialUse: true,
  commercialAttribution: true,
  commercializerChecker: zeroAddress,
  commercializerCheckerData: zeroAddress,
  commercialRevShare: 5,
  commercialRevCeiling: BigInt(0),
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: false,
  derivativesReciprocal: true,
  derivativeRevCeiling: BigInt(0),
  currency: WIP_TOKEN_ADDRESS,
  uri: "",
};
