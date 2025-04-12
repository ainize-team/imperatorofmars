import { useState, useEffect } from "react";

// PR 데이터를 위한 타입 정의 (유저 정보는 제거)
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

// 상태에 따른 아이콘 결정 함수
function getStateIcon(state: string) {
  if (state === "open") return "🟢";
  if (state === "closed") return "🔴";
  return "⚪";
}

// PR 하나를 렌더링하는 컴포넌트
function PRItem({ number, title, html_url, head, state }: PRItemProps) {
  // head.sha의 앞 7자리만 표시
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

// 피드 전체를 렌더링하는 컴포넌트
export default function FeedViewer() {
  const [nodePRs, setNodePRs] = useState<PRItemProps[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/fol/feed");
        if (!res.ok) {
          throw new Error("피드를 불러오는데 실패했습니다.");
        }
        const data = await res.json();
        if (data.nodePRs && data.nodePRs.length > 0) {
          // 불필요한 유저 정보는 제외하여 설정
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
        {!error && nodePRs.length === 0 && <p>현재 노드 브랜치의 PR이 없습니다.</p>}
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
