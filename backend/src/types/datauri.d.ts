declare module 'datauri/parser.js' {
  class DataUriParser {
    content: string | undefined;
    format(ext: string, buffer: Buffer): DataUriParser;
  }
  export default DataUriParser;
}
