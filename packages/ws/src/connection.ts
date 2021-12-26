import { Stream } from './stream'
import { Address6 } from 'ip-address'
import { Multiaddr } from 'multiaddr'

import debug = require('debug')

console.debug = debug('@p2p/ws')
console.error = debug('@p2p/ws:error')

const multiAddr = (ip: string, port: number) => {
  const ip6 = new Address6(ip)

  return ip6.is4()
    ? new Multiaddr(`/ip4/${ip6.to4().correctForm()}/tcp/${port}`)
    : new Multiaddr(`/ip6/${ip}/tcp/${port}`)
}

export interface Connection {
  conn: {
    source: any
    localAddress: string
    localPort: number
    remoteAddress: string
    remotePort: number
    sink: (arg0: AsyncGenerator<any, void, unknown>) => any
    close: () => any
    destroy: () => unknown
    socket: { once: (arg0: string, arg1: () => void) => any }
  }

  timeline: { close: number; open: number }
  source: any
  localAddr?: Multiaddr
  remoteAddr: Multiaddr

  sink: (source: any) => Promise<void>

  close: () => Promise<void>
}

export default (
  stream: Stream,
  options: { remoteAddr?: Multiaddr } = {},
): Connection => {
  const connection = {
    source: stream.source,
    conn: stream,
    localAddr:
      stream.localAddress && stream.localPort
        ? multiAddr(stream.localAddress, stream.localPort)
        : undefined,
    remoteAddr:
      options.remoteAddr != null ||
      multiAddr(stream.remoteAddress, stream.remotePort),
    timeline: { open: Date.now(), close: -1 },
    async sink(source: any) {
      try {
        await stream.sink(
          (async function* () {
            for await (const chunk of source) {
              yield chunk instanceof Uint8Array ? chunk : chunk.slice()
            }
          })(),
        )
      } catch (err: any) {
        if (err.type !== 'aborted') {
          console.error(err)
        }
      }
    },
    async close() {
      const start = Date.now()

      await Promise.race([
        stream.close(),
        new Promise((resolve) =>
          setTimeout(() => {
            const { host, port } = connection.remoteAddr.toOptions()
            console.debug(
              'destroyed stream to %s:%s after %dms',
              host,
              port,
              Date.now() - start,
            )
            resolve(stream.destroy())
          }, 2000),
        ),
      ])

      connection.timeline.close = Date.now()
    },
  }

  stream.socket.once &&
    stream.socket.once('close', () => {
      if (!connection.timeline.close) {
        connection.timeline.close = Date.now()
      }
    })

  return connection
}
