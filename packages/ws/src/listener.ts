import connection, { Connection } from './connection'
import type { Stream } from './stream'
import { Multiaddr, Protocol, protocols } from 'multiaddr'
import {
  NetworkInterfaceInfoIPv4,
  NetworkInterfaceInfoIPv6,
  networkInterfaces,
} from 'os'

import debug = require('debug')
import WebSocket = require('ws')
import EventEmitter = require('events')

const { createServer } = require('it-ws')

console.debug = debug('@p2p/ws')
console.error = debug('@p2p/ws:error')

export default ({
  handler,
  updateFn,
}: {
  handler: (conn: any) => void
  updateFn: <T>(conn: T) => T
}) => {
  const listener = new EventEmitter()

  const server = createServer({}, async (stream: Stream) => {
    let conn, updatedConn

    try {
      conn = connection(stream)
      console.debug('new connection', conn.remoteAddr)
      updatedConn = await updateFn(conn)
    } catch (err) {
      console.error('failed to update connection', err)

      if (conn != null) {
        conn.close()
      }

      return
    }

    console.debug('updated connection', conn.remoteAddr)

    trackConn(server, conn)

    if (handler) handler(updatedConn)
    listener.emit('connection', updatedConn)
  })

  server
    .on('listening', () => listener.emit('listening'))
    .on('error', (err: any) => listener.emit('error', err))
    .on('close', () => listener.emit('close'))

  server.__connections = []

  let listeningMultiaddr: any

  // @ts-expect-error
  listener.close = () => {
    server.__connections.forEach((conn: { close: () => any }) => conn.close())
    return server.close()
  }

  // @ts-expect-error
  listener.listen = (addr) => {
    listeningMultiaddr = addr

    return server.listen(addr.toOptions())
  }

  // @ts-expect-error
  listener.getAddrs = () => {
    const multiaddrs = []
    const address = server.address()

    if (!address) {
      throw new Error('Listener is not ready yet')
    }

    const nodeID = listeningMultiaddr!.getPeerId()
    const protos = listeningMultiaddr!.protos()

    if (
      protos.some((proto: Protocol) => proto.code === protocols('ip4').code)
    ) {
      const wsProto = protos.some(
        (proto: Protocol) => proto.code === protocols('ws').code,
      )
        ? '/ws'
        : '/wss'
      let m = listeningMultiaddr!.decapsulate('tcp')
      m = m.encapsulate(`/tcp/${address.port}${wsProto}`)
      if (listeningMultiaddr!.getPeerId()) {
        m = m.encapsulate(`/p2p/${nodeID}`)
      }

      if (m.toString().indexOf('0.0.0.0') !== -1) {
        const netInterfaces = networkInterfaces()
        Object.keys(netInterfaces).forEach((niKey) => {
          netInterfaces[niKey]!.forEach(
            (ni: NetworkInterfaceInfoIPv4 | NetworkInterfaceInfoIPv6) => {
              if (ni.family === 'IPv4') {
                multiaddrs.push(
                  new Multiaddr(m.toString().replace('0.0.0.0', ni.address)),
                )
              }
            },
          )
        })
      } else {
        multiaddrs.push(m)
      }
    }

    return multiaddrs
  }

  return listener
}

function trackConn(server: WebSocket.Server, conn: Connection): void {
  // @ts-expect-error
  server.__connections.push(conn)
}
