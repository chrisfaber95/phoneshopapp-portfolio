// pdfmake 0.3 ships no type definitions: only what the receipt service uses
declare module 'pdfmake' {
  interface PdfDocument {
    getBuffer(): Promise<Buffer>;
  }
  interface PdfMake {
    setFonts(fonts: Record<string, unknown>): void;
    setUrlAccessPolicy(policy: (url: string) => boolean): void;
    setLocalAccessPolicy(policy: (file: string) => boolean): void;
    createPdf(definition: Record<string, unknown>): PdfDocument;
  }
  const pdfmake: PdfMake;
  export = pdfmake;
}

declare module 'pdfmake/fonts/Roboto' {
  const fonts: Record<string, unknown>;
  export = fonts;
}
