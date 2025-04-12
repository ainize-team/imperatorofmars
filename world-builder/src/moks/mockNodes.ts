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
      '50ba8359337fa9eedfbf6e62f8b54808f44da3ce3dd9f9f0dfc62a98767f7be9'
    ],
    cid: '74f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96',
    type: "hint",
    message: 'Water exploration.',
    data: []
  },
  "84f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96": {
    children: [
      '50ba8359337fa9eedfbf6e62f8b54808f44da3ce3dd9f9f0dfc62a98767f7be9'
    ],
    cid: '84f457f76039d15a97703adfb672bba75fa86e6ac74f5a12679a96ecc4edfb96',
    type: "hint",
    message: 'Potato farming.',
    data: []
  },
  "50ba8359337fa9eedfbf6e62f8b54808f44da3ce3dd9f9f0dfc62a98767f7be9": {
    children: [
      'd70f3fd2d671f3c9b62e27aabc73152af5d97a2f9cecfcc630aad3f79193d7ba'
    ],
    cid: '50ba8359337fa9eedfbf6e62f8b54808f44da3ce3dd9f9f0dfc62a98767f7be9',
    type: "message",
    message: 'Food shortage crisis occurrence',
    data: []
  },
  "d70f3fd2d671f3c9b62e27aabc73152af5d97a2f9cecfcc630aad3f79193d7ba": {
    children: [
      '9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2'
    ],
    cid: 'd70f3fd2d671f3c9b62e27aabc73152af5d97a2f9cecfcc630aad3f79193d7ba',
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
    "Potato farming.",
    "Water exploration.",
  ]
}

export default mockNodes;