import { useState, useEffect } from "react";

// Type definition for PR data (user information is removed)
interface PRItemProps {
  number: number;
  title: string;
  html_url: string;
  head: {
    ref: string;
    sha: string;
  };
  state: string;
}

// Function to determine the icon according to the state
function getStateIcon(state: string) {
  if (state === "open") return "🟢";
  if (state === "closed") return "🔴";
  return "⚪";
}

// Component to render a single PR
function PRItem({ number, title, html_url, head, state }: PRItemProps) {
  // Display only the first 7 characters of head.sha
  const stateIcon = getStateIcon(state);

  return (
    <div className="p-2 border border-gray-300 rounded-md mb-2 text-sm">
      <h3 className="font-bold text-base">
        <a
          href={html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {stateIcon} PR #{number}
        </a>
        <br />
        {title}
      </h3>
    </div>
  );
}

// Component to render the entire feed
export default function FeedViewer() {
  const [nodePRs, setNodePRs] = useState<PRItemProps[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/fol/feed");
        if (!res.ok) {
          throw new Error("Failed to load the feed.");
        }
        const data = await res.json();
        if (data.nodePRs && data.nodePRs.length > 0) {
          // Exclude unnecessary user information and set
          const prList: PRItemProps[] = data.nodePRs.map((pr: any) => ({
            number: pr.number,
            title: pr.title,
            html_url: pr.html_url,
            head: pr.head,
            state: pr.state,
          }));
          setNodePRs(prList);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchFeed();
  }, []);

  return (
    <div className="flex flex-col border-2 border-black p-2">
      <h2 className="text-base font-bold mb-2">Feed</h2>
      <div className="overflow-auto max-h-[400px] mx-2 text-sm">
        {error && <p className="text-red-500">{error}</p>}
        {!error && nodePRs.length === 0 && <p>There are no PRs for the current node branch.</p>}
        {nodePRs.map((pr) => (
          <PRItem
            key={pr.number}
            number={pr.number}
            title={pr.title}
            html_url={pr.html_url}
            head={pr.head}
            state={pr.state}
          />
        ))}
      </div>
    </div>
  );
}
