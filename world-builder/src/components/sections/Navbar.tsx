import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-10 w-full border-b border-zinc-200 bg-white py-4">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-black">Imperator of Mars</h1>
        <ConnectButton />
      </div>
    </div>
  );
}
