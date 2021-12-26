import MDNS from '@p2p/mdns'
import Node from '@p2p/node'
import { Multiaddr } from 'multiaddr'

// import WS from '@p2p/ws'

const node = new Node(Math.random().toString(32), {
  // transports: [WS],
  discoveries: [MDNS],
  multiAddrs: [
    new Multiaddr('/ip4/127.0.0.1/tcp/11111'),
    // new Multiaddr('/ip4/127.0.0.1/tcp/22222'),
  ],
})

console.log(node.ID)
node.on('peer', (metadata) => {
  console.log(metadata.id)
})

node.start()
