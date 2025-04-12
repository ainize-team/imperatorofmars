import { SimulationLinkDatum } from 'd3-force';
import NodeDatum from './nodeDatum';

// 사용자 정의 타입으로 확장
interface LinkDatum extends SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
  // 필요하다면 추가 속성도 정의 가능
  value?: number;
}

export default LinkDatum;
