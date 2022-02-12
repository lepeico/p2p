import { MDNS } from '@p2p/mdns'
import { Node } from '@p2p/node'
// import WS from '@p2p/ws'
import { Multiaddr } from 'multiaddr'

export async function chat() {
  const node = new Node(Math.random().toString(32), {
    // transports: [WS],
    discoveries: [MDNS],
    addresses: [
      new Multiaddr('/ip4/127.0.0.1/tcp/11111'),
      // new Multiaddr('/ip4/127.0.0.1/tcp/22222'),
    ],
  })

  console.log(node.ID)
  node.on('peer', (metadata) => {
    console.log(metadata.id)
  })

  node.start()
}
