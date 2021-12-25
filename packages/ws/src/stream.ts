export interface Stream {
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
