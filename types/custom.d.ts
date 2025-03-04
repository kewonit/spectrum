declare module 'dom-to-image' {
  export function toPng(node: HTMLElement, options?: Object): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: Object): Promise<string>;
  export function toBlob(node: HTMLElement, options?: Object): Promise<Blob>;
  export function toPixelData(node: HTMLElement, options?: Object): Promise<Uint8Array>;
  export function toSvg(node: HTMLElement, options?: Object): Promise<string>;
}
