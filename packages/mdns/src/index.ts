import type { Discovery } from '@p2p/interfaces'
import { EventEmitter } from 'events'
import type { Multiaddr } from 'multiaddr'
import type { MulticastDNS, QueryPacket } from 'multicast-dns'

import Debug = require('debug')
import mDNS = require('multicast-dns')
import handle = require('./handle')

const debug = Debug('@p2p/mdns')
const error = Debug('@p2p/mdns:error')

const DEFAULT_OPTIONS: MDNS.Options = {
  tag: 'p2p',
  port: 13579,
  multiAddrs: [],
  distribute: true,
  queryInterval: 1000 * 15,
}

export namespace MDNS {
  export interface Options {
    tag: string
    port: number
    distribute: boolean
    queryInterval: number
    multiAddrs: Multiaddr[]
  }
}

export default class MDNS extends EventEmitter implements Discovery {
  private readonly nodeID: string
  private readonly options: MDNS.Options

  private mdns?: MulticastDNS
  private queryInterval?: NodeJS.Timeout

  constructor(nodeID: string, options?: Partial<MDNS.Options>) {
    super()

    this.nodeID = nodeID

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }

    debug('Created a MNDS instance')
  }

  start = () => {
    if (this.mdns != null) return

    this.mdns = mDNS({ port: this.options.port })
    this.mdns.on('query', this.handleQuery)
    this.mdns.on('response', this.handleResponse)

    this.queryInterval = this.query()
  }

  private query() {
    const query = () => {
      debug('query', this.options.tag)

      this.mdns!.query({
        questions: [
          {
            name: this.options.tag,
            type: 'PTR',
          },
        ],
      })
    }

    query()
    return setInterval(query, this.options.queryInterval)
  }

  private readonly handleQuery = (queryPacket: QueryPacket) => {
    handle.query(
      queryPacket,
      this.mdns!,
      this.nodeID,
      this.options.multiAddrs,
      this.options.tag,
      this.options.distribute,
    )
  }

  private readonly handleResponse = (queryPacket: QueryPacket) => {
    try {
      const foundPeer = handle.response(
        queryPacket,
        this.nodeID,
        this.options.tag,
      )

      if (foundPeer != null) {
        this.emit('peer', foundPeer)
      }
    } catch (err) {
      error('Error processing peer response', err)
    }
  }

  stop = async () => {
    if (this.mdns == null) {
      return
    }

    this.mdns.removeListener('query', this.handleQuery)
    this.mdns.removeListener('response', this.handleResponse)

    clearInterval(this.queryInterval!)
    this.queryInterval = undefined

    await new Promise((resolve) => this.mdns!.destroy(() => resolve(true)))
    this.mdns = undefined
  }
}
