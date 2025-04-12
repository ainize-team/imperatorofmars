const mockNodes: {
  [cid: string]: {
    children: string[],
    cid: string,
    message: string,
    type: "message" | "hint"
    data: [],
  }
} = {
  "74f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96": {
    children: [
      '94f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96'
    ],
    cid: '74f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96',
    type: "hint",
    message: 'Water exploration.',
    data: []
  },
  "84f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96": {
    children: [
      '94f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96'
    ],
    cid: '84f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96',
    type: "hint",
    message: 'Potato parming.',
    data: []
  },
  "94f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96": {
    children: [
      '4210236ad56d88af16b8f80a155bdec8e1fc04a79f062567db1db212de9c4c26'
    ],
    cid: '94f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96',
    type: "message",
    message: 'Food shortage crisis occurrence',
    data: []
  },
  "4210236ad56d88af16b8f80a155bdec8e1fc04a79f062567db1db212de9c4c26": {
    children: [
      '9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2'
    ],
    cid: '4210236ad56d88af16b8f80a155bdec8e1fc04a79f062567db1db212de9c4c26',
    type: "message",
    message: "User Alpha, Mark's Mars Departure!",
    data: []
  },
  "9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2": {
    children: [],
    cid: '9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2',
    type: "message",
    message: "genesis",
    data: []
  }
}

export const mockHintNodes: {[message: string]: string[]} = {
  "Food shortage crisis occurrence": [
    "Potato parming.",
    "Water exploration.",
  ]
}

export default mockNodes;