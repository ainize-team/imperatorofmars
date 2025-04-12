import mockFeed from "@/moks/mockFeed";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

export default function FeedViewer() {
  
  return (
    <div className="flex flex-col border-2 border-black overflow-hidden p-2">
      <div>Feed</div>
      <div className="overflow-scroll mx-2 text-[.9rem]">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {"```" + mockFeed + "```"}
        </ReactMarkdown>
      </div>
    </div>
  )
}