'use strict'

import debug = require('debug')
import mDNS = require('multicast-dns')
import handle = require('./handle')
import { EventEmitter } from 'events'
import { MulticastDNS, QueryPacket } from 'multicast-dns'
import { Multiaddr } from 'multiaddr'

console.debug = debug('@p2p/mdns')
console.error = debug('@p2p/mdns:error')

const DEFAULT_OPTIONS: MDNS.Options = {
  tag: 'p2p',
  multiAddrs: [],
  distribute: true,
  queryInterval: 1000 * 5,
}

export namespace MDNS {
  export interface Options {
    tag: string
    distribute: boolean
    multiAddrs: Multiaddr[]
    queryInterval: number
  }
}

export default class MDNS extends EventEmitter {
  private readonly nodeID: string
  private readonly options: MDNS.Options

  private mdns?: MulticastDNS
  private queryInterval?: NodeJS.Timeout

  constructor(nodeID: string, options?: MDNS.Options) {
    super()

    this.nodeID = nodeID

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }

    console.debug('Created a MNDS instance')
  }

  start = async (port: number = 13579) => {
    if (this.mdns) return

    this.mdns = mDNS({ port })
    this.mdns.on('query', this.handleQuery)
    this.mdns.on('response', this.handleResponse)

    this.queryInterval = this.query()
  }

  private query() {
    const query = () => {
      console.debug('query', this.options.tag)

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

  private handleQuery = (queryPacket: QueryPacket) => {
    handle.query(
      queryPacket,
      this.mdns!,
      this.nodeID,
      this.options.multiAddrs,
      this.options.tag,
      this.options.distribute,
    )
  }

  private handleResponse = (queryPacket: QueryPacket) => {
    try {
      const foundPeer = handle.response(
        queryPacket,
        this.nodeID,
        this.options.tag,
      )

      if (foundPeer) {
        this.emit('peer', foundPeer)
      }
    } catch (err) {
      console.error('Error processing peer response', err)
    }
  }

  stop = async () => {
    if (!this.mdns) {
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
