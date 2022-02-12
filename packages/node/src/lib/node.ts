import { Store } from '@p2p/store'
import type { Discovery, Transport } from '@p2p/types'
import Debug from 'debug'
import { EventEmitter } from 'events'
import type { Multiaddr } from 'multiaddr'

const debug = Debug('@p2p/node')
// const error = Debug('@p2p/node:error')

const DEFAULT_OPTIONS: Node.Options = {
  transports: [],
  discoveries: [],
  addresses: [],
}

export namespace Node {
  export interface Options {
    transports: Transport.Factory[]
    discoveries: Discovery.Factory[]
    addresses: Multiaddr[]
  }
}

export class Node extends EventEmitter {
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
      new Discovery(this.ID, { addresses: this.options.addresses }).on(
        'peer',
        (metadata) => void this.emit('peer', metadata),
      ),
    )

    debug('Created a P2P Node instance')
  }

  public start = () => {
    this.discoveries.forEach((discovery) => void setTimeout(discovery.start))

    this.on('peer', ({ id, multiaddrs }) => this.store.add(id, multiaddrs))
  }

  public stop = () => {
    this.discoveries.forEach((discovery) => {
      debug(discovery)
      setTimeout(discovery.stop)
    })
  }
}
