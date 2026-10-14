// Materialize 2.4.0 supplies declarations, but its import export omits the types condition.
// This adapter describes only the published Toast API used by this application.
declare module '@materializecss/materialize' {
  export class Toast {
    constructor(options?: {
      text?: string;
      displayLength?: number;
      inDuration?: number;
      outDuration?: number;
      classes?: string;
    });
    el: HTMLElement;
    static dismissAll(): void;
    dismiss(): void;
  }
}
