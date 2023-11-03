export type Context = import('./core.js').Context;
export type ContextConsumerCallback = (host: HTMLElement, value?: any) => void;
/**
 * @callback ContextConsumerCallback
 * @param {HTMLElement} host
 * @param {*} [value]
 * @returns {void}
 */
export class ContextConsumer {
    /**
     * Creates an instance of ContextProvider.
     * @param {HTMLElement} host
     * @param {string | Context} context Context identifier
     * @param {ContextConsumerCallback} callback
     */
    constructor(host: HTMLElement, context: string | Context, callback: ContextConsumerCallback);
    host: HTMLElement;
    context: any;
    callback: ContextConsumerCallback;
    _value: any;
    get value(): any;
    hostConnected(): void;
    hostDisconnected(): void;
}
export class ContextProvider {
    /**
     * Creates an instance of ContextProvider.
     * @param {HTMLElement} host
     * @param {string | Context} context Context identifier
     * @param {*} initialValue
     */
    constructor(host: HTMLElement, context: string | Context, initialValue: any);
    host: HTMLElement;
    context: any;
    _value: any;
    _initialized: boolean;
    _finalized: boolean;
    set value(arg: any);
    get value(): any;
    connect(): void;
    disconnect(): void;
    hostConnected(): void;
    hostDisconnected(): void;
    initialize(): void;
    finalize(): void;
}
//# sourceMappingURL=controllers.d.ts.map