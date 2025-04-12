const mockNodes: {
  [cid: string]: {
    children: string[],
    cid: string,
    message: string,
    data: string[]
  }
} = {
  "45bf53dec9e2c1268b3e91ad9e191566cd46d43190b0b2cb6a49c07d7ea8d4ea": {
    children: [
      '15ecdfabdd09d9e4308a0ff887e27574084b2e5b94c985f30ee3630690f7f942'
    ],
    cid: '45bf53dec9e2c1268b3e91ad9e191566cd46d43190b0b2cb6a49c07d7ea8d4ea',
    message: 'Food shortage crisis occurrence',
    data: []
  },
  "15ecdfabdd09d9e4308a0ff887e27574084b2e5b94c985f30ee3630690f7f942": {
    children: [
      '9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2'
    ],
    cid: '15ecdfabdd09d9e4308a0ff887e27574084b2e5b94c985f30ee3630690f7f942',
    message: "User Alpha, Mark's Mars Departure!",
    data: []
  },
  "9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2": {
    children: [],
    cid: '9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2',
    message: "genesis",
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