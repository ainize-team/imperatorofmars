import { SimulationNodeDatum } from 'd3-force';

// 사용자 정의 타입으로 확장
interface NodeDatum extends SimulationNodeDatum {
  id: string;
  // 추가로 필요한 속성이 있다면 여기에 추가
  group?: number;
}

export default NodeDatum;
