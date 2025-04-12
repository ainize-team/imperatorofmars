const mockNodes: {
  [cid: string]: {
    children: string[],
    cid: string,
    message: string,
    data: string[]
  }
} = {
  "ce70fe06306f47cee1fa8ce11134df823f1793108d17c522ce9e8c421fb9e3df": {
    children: [
      'a97c97fdb33b71373559dac5284b085a64a77f84e995f62ad58b489626e9779b'
    ],
    cid: 'ce70fe06306f47cee1fa8ce11134df823f1793108d17c522ce9e8c421fb9e3df',
    message: '사용자 Beta, 식량 부족 위기 상황 발생',
    data: []
  },
  "a97c97fdb33b71373559dac5284b085a64a77f84e995f62ad58b489626e9779b": {
    children: [],
    cid: 'a97c97fdb33b71373559dac5284b085a64a77f84e995f62ad58b489626e9779b',
    message: '사용자 Alpha, Mark의 화성 출발 기록!',
    data: []
  }
}

export default mockNodes;