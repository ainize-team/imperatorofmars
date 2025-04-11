export default function Home() {
  return (
    <div className="flex flex-col h-full w-full gap-5">
      <h1 className="font-bold text-4xl">Imperator of Mars</h1>
      {/* Contents */}
      <div className="flex flex-row gap-4">
        <div className="flex-1 border-2 border-black h-[80vh]">FOI</div>
        <div className="flex-1 border-2 border-black h-[80vh]">Dag visualizer</div>
        <div className="flex-1 border-2 border-black h-[80vh]">Feed</div>
      </div>
      {/* Input */}
      <div className="flex flex-row border-2 border-black w-full justify-between p-1">
        <input className="flex-1 bg-gray-200" placeholder="Input your next story"></input>
        <button className="">Generate</button>
      </div>
    </div>
  );
}
