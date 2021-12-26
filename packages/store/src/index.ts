import { EventEmitter } from 'events'
import type { Multiaddr } from 'multiaddr'

import Debug = require('debug')

const debug = Debug('@p2p/store')
const error = Debug('@p2p/store:error')

const DEFAULT_OPTIONS: Store.Options = {}

export namespace Store {
  export interface Options {}
}

export default class Store extends EventEmitter {
  public nodes: Map<string, Set<Multiaddr>> = new Map()

  protected readonly options: Store.Options

  constructor(options?: Partial<Store.Options>) {
    super()

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }

    debug('Created a Store instance')
  }

  public add = (nodeID: string, multiAddrs: Multiaddr[]): void => {
    if (!multiAddrs.length) {
      return
    }

    const entry = new Set(this.nodes.get(nodeID))
    if (entry && entry.size) {
      multiAddrs.forEach((addr) => {
        if (entry.has(addr)) {
          error(`the address ${addr} is already stored for ${nodeID}`)
          return
        }

        entry.add(addr)
      })
    }

    this.nodes.set(nodeID, entry)

    debug(`added multiaddrs for ${nodeID}`)

    return
  }

  public get = (id: string): Multiaddr[] => {
    return this.nodes.has(id) ? [...this.nodes.get(id)!] : []
  }

  public delete = (id: string): boolean => {
    return this.nodes.delete(id)
  }
}
