# Design Document

## Context and Scope
The only purpose for this lib is to provide Node developers an easy access to the world of distributed p2p-communications.
In minimal-valuable form it might be as simple as wrapping whole app with p2p transport layer and then inject p2p data-providers insideee app where it is needed.

For now there are no more nice frameworks for that, except lib-p2p, which is incredible hard to integrate due to serious architecture issues.

## Goals and non-goals
### Goals
* Simple lib with fluent interface
* Fast transporting protocol inside and/or option to select another
### Non-goals
* Too custimizable nodes
* Chassis or distributed computations

## The actual design
### APIs
Injectable provider would consist of getters for current network info, methods to send data and the channel to subscribe for other nodes updates.
### Data storage 
P2P node lib optionally might accept an interface for any Data-repository to save and get meta-info, such as known nodes and las ping time. 
It would use in-memory database as a default.

## Cross-cutting concerns
### Security
It might be nice to have an option to create secured networks (in which nodes would use keys to communicate)
### Observability
Node should be able to shut down gracefully (sending bye-message to the network), also to have a health-endpoint to query its current status and the logger to log info and error messages.
