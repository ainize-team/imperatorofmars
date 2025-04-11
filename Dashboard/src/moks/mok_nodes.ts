const mokNodes: {
  [cid: string]: {
    children: string[],
    cid: string,
    message: string,
    data: string[]
  }
} = {
  "1f76cfcc484e26c8a61aaf5465c3fad759f847c93f6bbe50048b5556309d594e": {
    children: [
      'ce70fe06306f47cee1fa8ce11134df823f1793108d17c522ce9e8c421fb9e3df'
    ],
    cid: '1f76cfcc484e26c8a61aaf5465c3fad759f847c93f6bbe50048b5556309d594e',
    message: '고고고',
    data: []
  },
  "ce70fe06306f47cee1fa8ce11134df823f1793108d17c522ce9e8c421fb9e3df": {
    children: [
      'a97c97fdb33b71373559dac5284b085a64a77f84e995f62ad58b489626e9779b'
    ],
    cid: 'ce70fe06306f47cee1fa8ce11134df823f1793108d17c522ce9e8c421fb9e3df',
    message: '유유유',
    data: []
  },
  "a97c97fdb33b71373559dac5284b085a64a77f84e995f62ad58b489626e9779b": {
    children: [],
    cid: 'a97c97fdb33b71373559dac5284b085a64a77f84e995f62ad58b489626e9779b',
    message: '진진진',
    data: []
  }
}

export default mokNodes