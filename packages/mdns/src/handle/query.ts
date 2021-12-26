import type { Answer } from 'dns-packet'
import type { Multiaddr, MultiaddrObject } from 'multiaddr'
import type { MulticastDNS, QueryPacket } from 'multicast-dns'
import { hostname } from 'os'

import debug = require('debug')

console.debug = debug('@p2p/mdns')

export default function (
  queryPacket: QueryPacket,
  mdns: MulticastDNS,
  nodeID: string,
  multiAddrs: Multiaddr[],
  tag: string,
  broadcast: boolean,
): any {
  if (!broadcast) {
    return
  }

  const addresses = multiAddrs.reduce(
    (acc: MultiaddrObject[], addr: Multiaddr) => {
      if (addr.isThinWaistAddress()) {
        acc.push(addr.toOptions())
      }
      return acc
    },
    [],
  )

  if (addresses.length === 0) {
    return
  }

  if (
    queryPacket.questions[0] != null &&
    queryPacket.questions[0].name === tag
  ) {
    const answers: Answer[] = []

    answers.push({
      name: tag,
      type: 'PTR',
      class: 'IN',
      ttl: 120,
      data: `${nodeID}.${tag}`,
    })

    const port = addresses[0].port

    answers.push({
      name: `${nodeID}.${tag}`,
      type: 'SRV',
      class: 'IN',
      ttl: 120,
      data: {
        priority: 10,
        weight: 1,
        port: port,
        target: hostname(),
      },
    })

    answers.push({
      name: `${nodeID}.${tag}`,
      type: 'TXT',
      class: 'IN',
      ttl: 120,
      data: nodeID,
    })

    addresses.forEach((addr: MultiaddrObject) => {
      if ([4, 6].includes(addr.family)) {
        answers.push({
          name: hostname(),
          type: addr.family === 4 ? 'A' : 'AAAA',
          class: 'IN',
          ttl: 120,
          data: addr.host,
        })
      }
    })

    console.debug('responding to query')
    mdns.respond(answers)
  }
}
