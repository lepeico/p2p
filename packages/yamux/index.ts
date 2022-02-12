import debug = require('debug')

console.debug = debug('@p2p/yamux')
console.error = debug('@p2p/yamux:error')

const DEFAULT_OPTIONS: Yamux.Options = {}

export namespace Yamux {
  export interface Options {}
}

export default class Yamux {
  protected readonly options: Yamux.Options

  constructor(options?: Partial<Yamux.Options>) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }

    console.debug('Created a Yamux instance')
  }
}
