const mockNodes: {
  [cid: string]: {
    children: string[],
    cid: string,
    id: string,
    message: string,
    type: "message" | "hint"
    data: [],
  }
} = {
  "74f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96": {
    children: [
      '834e7f141b1cd179eddee78e004086b4d88ce198a20ad1448988f240e545e89d'
    ],
    cid: '74f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96',
    id: '74f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96',
    type: "hint",
    message: 'Water exploration.',
    data: []
  },
  "84f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96": {
    children: [
      '834e7f141b1cd179eddee78e004086b4d88ce198a20ad1448988f240e545e89d'
    ],
    cid: '84f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96',
    id: '84f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96',
    type: "hint",
    message: 'Potato farming.',
    data: []
  },
  "834e7f141b1cd179eddee78e004086b4d88ce198a20ad1448988f240e545e89d": {
    children: [
      '9f9f9f76a957d68516bd9e8ea4643db9f11c109a64ac6daf7056e798c4140fc2'
    ],
    cid: '834e7f141b1cd179eddee78e004086b4d88ce198a20ad1448988f240e545e89d',
    id: '834e7f141b1cd179eddee78e004086b4d88ce198a20ad1448988f240e545e89d',
    type: "message",
    message: 'Food shortage crisis occurrence',
    data: []
  },
  "9f9f9f76a957d68516bd9e8ea4643db9f11c109a64ac6daf7056e798c4140fc2": {
    children: [
      '9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2'
    ],
    cid: '9f9f9f76a957d68516bd9e8ea4643db9f11c109a64ac6daf7056e798c4140fc2',
    id: '9f9f9f76a957d68516bd9e8ea4643db9f11c109a64ac6daf7056e798c4140fc2',
    type: "message",
    message: "User Alpha, Mark's Mars Departure!",
    data: []
  },
  "9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2": {
    children: [],
    cid: '9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2',
    id: '9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2',
    type: "message",
    message: "genesis",
    data: []
  }
}

export const mockHintNodes: {[message: string]: string[]} = {
  "Food shortage crisis occurrence": [
    "Potato farming.",
    "Water exploration.",
  ]
}

export default mockNodes;