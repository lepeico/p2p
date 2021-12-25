# Design Document

## Context and Scope

The only purpose for this lib is to provide Node developers easy access to the world of distributed p2p-communications.
In minimal-valuable form, it might be as simple as wrapping the whole app with the p2p transport layer and then injecting the p2p data-providers inside app where it is needed.

For now, there are no more nice frameworks for that, except lib-p2p, which is incredibly hard to integrate due to serious architecture issues.

## Goals and non-goals

### Goals

- Simple lib with a fluent interface
- Fast transporting protocol inside and/or option to select another

### Non-goals

- Too custimizable nodes
- Chassis or distributed computations

## The actual design

### System-context-diagram

TODO (Is it applicable?)

### APIs

#### Node-wrapper might have constructor (builder) for optional configuration via "Options" pattern with next options:

- Transport (default TCP or WS + TLS, WebRTC or QUIC)
- Peer discovery method (probably direct connection for all-known addresses, MDNS or Rendezvous)
- Securing Strategy (using Noise protocol or similar)

#### Injectable provider would consist of

- getters for current network info
- methods to send data
- the channel to subscribe for other nodes updates.

### Data storage

P2P node lib optionally might accept an interface for any Data-repository to save and get meta-info, such as known nodes and last ping time.
It would use the in-memory database as a default.

### Degree of constraint

The easiest way is to develop a node with no security options and an algorithm in which all the nodes know about all the members of the network. The first additional feature will be network optimization by reducing node peering.

## Cross-cutting concerns

### Security

It might be nice to have an option to create secured networks (in which nodes would use keys to communicate)

### Observability

The node should be able to shut down gracefully (sending bye-message to the network), also to have a health-endpoint to query its current status and the logger to log info and error messages.

## Demo - CLI chat

2 IO-handlers for reading and writing messages from/to network.
