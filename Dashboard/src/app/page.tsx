"use client";
import Navbar from "@/components/sections/Navbar";
import FeedVeiwer from "@/components/feedViewer";
import FOLViewer from "@/components/folViewer";

export default function Home() {
  return (
    <div className="flex flex-col h-full w-full gap-5">
      <Navbar />
      {/* Contents */}
      <div className="flex flex-row gap-4">
        <FOLViewer />
        <div className="flex-1 border-2 border-black h-[80vh]">Dag visualizer</div>
        <FeedVeiwer />
      </div>
      {/* Input */}
      <div className="flex flex-row border-2 border-black w-full justify-between p-1">
        <input className="flex-1 bg-gray-200" placeholder="Input your next story"></input>
        <button className="">Generate</button>
      </div>
    </div>
  );
}
