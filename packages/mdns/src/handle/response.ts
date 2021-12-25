'use strict'

import { QueryPacket } from 'multicast-dns'
import { Multiaddr } from 'multiaddr'
import { Answer, SrvAnswer, StringAnswer, TxtAnswer } from 'dns-packet'
import debug = require('debug')

console.debug = debug('@p2p/mdns')

export default function (
  queryPacket: QueryPacket,
  nodeID: string,
  tag: string,
) {
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
  const multiaddrs: Multiaddr[] = []

  answers.a.forEach((a) => {
    const ma = new Multiaddr(`/ip4/${a.data}/tcp/${port}`)

    if (!multiaddrs.some((m: Multiaddr) => m.equals(ma))) {
      multiaddrs.push(ma)
    }
  })

  answers.aaaa.forEach((a) => {
    const ma = new Multiaddr(`/ip6/${a.data}/tcp/${port}`)

    if (!multiaddrs.some((m: Multiaddr) => m.equals(ma))) {
      multiaddrs.push(ma)
    }
  })

  console.debug('found:', id)
  return { id, multiaddrs }
}
