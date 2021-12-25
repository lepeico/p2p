import debug = require('debug')

console.debug = debug('@p2p/node')
console.error = debug('@p2p/mdns:node')

const DEFAULT_OPTIONS: Node.Options = {}

export namespace Node {
  export interface Options {}
}

export default class Node {
  private readonly options: Node.Options

  constructor(options?: Partial<Node.Options>) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }

    console.debug('Created a P2P Node instance')
  }
}
