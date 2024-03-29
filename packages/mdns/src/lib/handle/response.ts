import Debug from 'debug'
import type { Answer, SrvAnswer, StringAnswer, TxtAnswer } from 'dns-packet'
import { Multiaddr } from 'multiaddr'
import type { QueryPacket } from 'multicast-dns'

console.debug = Debug('@p2p/mdns/response')

export function response(
  queryPacket: QueryPacket,
  nodeID: string,
  tag: string,
): any {
  if (!queryPacket.answers) {
    return
  }

  const answers: {
    txt?: TxtAnswer
    a: StringAnswer[]
    srv?: SrvAnswer
    aaaa: StringAnswer[]
    ptr?: StringAnswer
  } = {
    a: [],
    aaaa: [],
  }

  queryPacket.answers.forEach((answer: Answer) => {
    switch (answer.type) {
      case 'PTR':
        answers.ptr = answer
        break
      case 'SRV':
        answers.srv = answer
        break
      case 'TXT':
        answers.txt = answer
        break
      case 'A':
        answers.a.push(answer)
        break
      case 'AAAA':
        answers.aaaa.push(answer)
        break
      default:
        break
    }
  })

  if (answers.ptr!.name !== tag) {
    return
  }

  const id = answers.txt!.data[0].toString()
  if (nodeID === id) {
    return
  }

  const port = answers.srv!.data.port
  const multiaddrs: Set<Multiaddr> = new Set()

  answers.a.forEach((a) => {
    const ma = new Multiaddr(`/ip4/${a.data}/tcp/${port}`)

    if (![...multiaddrs].some((m: Multiaddr) => m.equals(ma))) {
      multiaddrs.add(ma)
    }
  })

  answers.aaaa.forEach((a) => {
    const ma = new Multiaddr(`/ip6/${a.data}/tcp/${port}`)

    if ([...multiaddrs].some((m: Multiaddr) => m.equals(ma))) {
      multiaddrs.add(ma)
    }
  })

  console.debug(`found ${id} with addrs: ${[...multiaddrs].join(', ')}`)
  return { id, multiaddrs }
}
