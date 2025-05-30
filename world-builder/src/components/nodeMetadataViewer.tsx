/* eslint-disable @typescript-eslint/no-explicit-any */

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

type props = {
  node: any
}
export default function NodeMetadataViewer({ node }: props) {

  const showNodeDetail = () => {
    if (!node) {
      return `Select node.`
    }
    return `
      ID: ${node.id}
      Message: ${node.message}
      Children: ${node.children.toString()}
    `;
    //   Data: ${node.data ? node.data.toString() : ""}
      
  }

  return (
    <div className="flex-1 border-2 border-black overflow-hidden p-2">
      <div>Node Details</div>
      <div className="overflow-scroll h-full text-[.8rem] truncate">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {showNodeDetail()}
        </ReactMarkdown>
      </div>
    </div>
  )
}