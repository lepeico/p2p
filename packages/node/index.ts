import Store from '@p2p/store'
import type { Multiaddr } from 'multiaddr'
import type { Discovery, Transport } from 'packages/types'

import Debug = require('debug')
import EventEmitter = require('events')

const debug = Debug('@p2p/node')
// const error = Debug('@p2p/node:error')

const DEFAULT_OPTIONS: Node.Options = {
  transports: [],
  discoveries: [],
  multiAddrs: [],
}

export namespace Node {
  export interface Options {
    transports: Transport.Factory[]
    discoveries: Discovery.Factory[]
    multiAddrs: Multiaddr[]
  }
}

export default class Node extends EventEmitter {
  protected readonly options: Node.Options
  protected readonly discoveries: Discovery[]

  public readonly ID: string
  public readonly store: Store = new Store()

  constructor(ID: string, options?: Partial<Node.Options>) {
    super()

    this.ID = ID

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }

    this.discoveries = this.options.discoveries.map((Discovery) =>
      new Discovery(this.ID, { multiAddrs: this.options.multiAddrs }).on(
        'peer',
        (metadata) => void this.emit('peer', metadata),
      ),
    )

    debug('Created a P2P Node instance')
  }

  public start = () => {
    this.discoveries.forEach((discovery) => void setImmediate(discovery.start))

    this.on('peer', ({ id, multiaddrs }) => this.store.add(id, multiaddrs))
  }

  public stop = () => {
    this.discoveries.forEach((discovery) => {
      debug(discovery)
      setImmediate(discovery.stop)
    })
  }
}
