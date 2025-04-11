import mokFOI from "@/moks/mok_foi"
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

export default function FOLViewer() {
  
  return (
    <div className="flex-1 border-2 border-black h-[80vh] overflow-hidden p-2">
      <div>FOL</div>
      <div className="flex flex-col w-full h-full overflow-scroll mx-2 text-[0.75rem]">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {"```" + mokFOI + "```"}
        </ReactMarkdown>
      </div>
    </div>
  )
}