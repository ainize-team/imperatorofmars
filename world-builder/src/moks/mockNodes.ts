const mockNodes: {
  [cid: string]: {
    children: string[],
    cid: string,
    message: string,
    data: string[]
  }
} = {
  "d1beca51d662898fadca92bb438af55cfffd7a911faebba29801f2eedc8d25a2": {
    children: [
      '15ecdfabdd09d9e4308a0ff887e27574084b2e5b94c985f30ee3630690f7f942'
    ],
    cid: 'd1beca51d662898fadca92bb438af55cfffd7a911faebba29801f2eedc8d25a2',
    message: 'Plant potatoes',
    data: []
  },
  "45bf53dec9e2c1268b3e91ad9e191566cd46d43190b0b2cb6a49c07d7ea8d4ea": {
    children: [
      '15ecdfabdd09d9e4308a0ff887e27574084b2e5b94c985f30ee3630690f7f942'
    ],
    cid: '45bf53dec9e2c1268b3e91ad9e191566cd46d43190b0b2cb6a49c07d7ea8d4ea',
    message: 'Find water',
    data: []
  },
  "15ecdfabdd09d9e4308a0ff887e27574084b2e5b94c985f30ee3630690f7f942": {
    children: [
      'ebf6267e59b8ca6124d7532cb5fd130e75c338d88c8bf8b182bfa644e6bce2df'
    ],
    cid: '15ecdfabdd09d9e4308a0ff887e27574084b2e5b94c985f30ee3630690f7f942',
    message: 'Food shortage crisis occurrence',
    data: []
  },
  "ebf6267e59b8ca6124d7532cb5fd130e75c338d88c8bf8b182bfa644e6bce2df": {
    children: [],
    cid: 'ebf6267e59b8ca6124d7532cb5fd130e75c338d88c8bf8b182bfa644e6bce2df',
    message: "User Alpha, Mark's Mars Departure!",
    data: []
  }
}

export const mockHintNodes: {[message: string]: string[]} = {
  "Food shortage crisis occurrence": [
    "Plant potatoes.",
    "Find water.",
  ]
}

export default mockNodes;