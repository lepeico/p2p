import type { EventEmitter } from 'events'

export interface Discovery extends EventEmitter {
  start: () => void

  stop: () => void
}

export namespace Discovery {
  export type Factory = new (nodeID: string, options?: any) => Discovery
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

export interface Transport {}

export namespace Transport {
  export type Factory = new (options?: any) => Transport
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

export interface Muxer {}

export namespace Muxer {
  export type Factory = new (options: any) => Muxer

  export interface Stream<T = Uint8Array> extends AsyncIterable<T> {
    close: () => void
    abort: () => void
    reset: () => void
    sink: (source: AsyncIterable<T>) => Promise<void>
    source: AsyncIterable<T>
    timeline: {
      open: number
      close?: number
    }
    id: string
  }
}
