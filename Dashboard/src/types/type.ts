/* eslint-disable @typescript-eslint/no-explicit-any */

export type Node = {
  id: string,
  cid: string,
  message: string,
  data: any,
  type: 'message',
  children: string[]
}