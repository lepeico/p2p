import connection from './connection'
import listener from './listener'
import { Multiaddr } from 'multiaddr'

import debug = require('debug')

const toUri = require('multiaddr-to-uri')
const connect = require('it-ws/client')

console.debug = debug('@p2p/ws')
console.error = debug('@p2p/ws:error')

const DEFAULT_OPTIONS: WS.Options = {
  updateFn: (conn) => conn,
}

export namespace WS {
  export interface Options {
    updateFn: <T>(conn: T) => T
  }
}

export default class WS {
  private readonly options: WS.Options

  constructor(options?: Partial<WS.Options>) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }

    console.debug('Created a WS transport')
  }

  listener = (handler: (conn: any) => void) =>
    listener({
      handler,
      updateFn: this.options.updateFn,
    })

  dial = async (addr: Multiaddr) => {
    console.debug('dialing', addr)

    const conn = connection(await this.connect(addr), { remoteAddr: addr })
    console.debug('new connection %s', conn.remoteAddr)

    const upgradedConn = await this.options.updateFn(conn)
    console.debug('connection %s upgraded', conn.remoteAddr)

    return upgradedConn
  }

  private connect = async (addr: Multiaddr) => {
    const cOpts = addr.toOptions()
    console.debug('dialing %s:%s', cOpts.host, cOpts.port)

    const errPromise: {
      promise?: Promise<any>
      resolve?: (value: any) => void
      reject?: (reason: any) => void
    } = {}
    errPromise.promise = new Promise((resolve, reject) => {
      errPromise.resolve = resolve
      errPromise.reject = reject
    })

    const errFn = (err: { message: string }) => {
      const msg = `connection error: ${err.message}`
      console.error(msg)

      errPromise.reject!(err)
    }

    const rawSocket = connect(toUri(addr), { binary: true })

    if (rawSocket.socket.on) {
      rawSocket.socket.on('error', errFn)
    } else {
      rawSocket.socket.onerror = errFn
    }

    await Promise.race([rawSocket.connected(), errPromise.promise!])
    console.debug('connected', addr)

    return rawSocket
  }
}
