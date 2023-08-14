
export function load (): Promise<void>

export function decompressCallback<T> (data: Uint8Array, rawSize: number, callback: (data: Uint8Array) => T): Promise<T>

export function decompress (data: Uint8Array, rawSize: number): Promise<Uint8Array>
