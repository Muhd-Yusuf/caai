declare module 'franc' {
  interface FrancOptions {
    minLength?: number;
    only?: string[];
    ignore?: string[];
  }
  // Returns an ISO 639-3 language code, or 'und' when undetermined.
  function franc(value: string, options?: FrancOptions): string;
  export default franc;
}
