export class ContextRequestEvent extends Event {
    constructor(context: any, callback: any, subscribe: any);
    context: any;
    callback: any;
    subscribe: any;
}
export type Context = any;
export type ContextGetter = {
    /**
     * Function that is called in provider
     */
    getter: Function;
    /**
     * Payload passed to getter
     */
    payload?: any;
};
export const noContext: unique symbol;
/**
 * @typedef {Object} Context
 */
/**
 * @typedef {Object} ContextGetter
 * @property {Function} getter Function that is called in provider
 * @property {any} [payload] Payload passed to getter
 */
/**
 * @param {string} key Identify the context
 * @return {Context}
 */
export function createContext(key: string): Context;
/**
 * @param {HTMLElement} provider HTMLElement acting as a context provider
 * @param {string | Context} context  Context identifier
 * @param {*} payload Value passed to getter
 * @param {Function} [getter=providerGetter]
 */
export function registerContext(provider: HTMLElement, context: string | Context, payload: any, getter?: Function): void;
/**
 * @param {HTMLElement} provider HTMLElement that provides a context
 * @param {string | Context} context Context identifier
 * @param {*} [payload=context] Value passed to provider context getter
 */
export function updateContext(provider: HTMLElement, context: string | Context, payload?: any): void;
/**
 * @description Observes a context in a consumer. Optionally define how the context value is set
 * @param {HTMLElement} consumer HTMLElement that consumes a context
 * @param {string | Context} context Context identifier
 * @param {*} [payload=context] Value passed to setter
 * @param {Function} [setter=consumerSetter]
 */
export function observeContext(consumer: HTMLElement, context: string | Context, payload?: any, setter?: Function): void;
/**
 * @description Unobserves a context in a consumer
 * @param {HTMLElement} consumer HTMLElement that consumes a context
 * @param {string | Context} context Context identifier
 */
export function unobserveContext(consumer: HTMLElement, context: string | Context): void;
export function consumerSetter(consumer: any, value: any, name: any): void;
/**
 * @description Default context getter implementation. Just returns the payload
 * @param {HTMLElement} provider HTMLElement acting as a context provider
 * @param {*} payload Options passed to the callback
 * @return {*}
 */
export function providerGetter(provider: HTMLElement, payload: any): any;
/**
 * @param {HTMLElement} provider
 * @param {string | Context} context Context identifier
 * @param {Function} callback
 */
export function onContextObserve(provider: HTMLElement, context: string | Context, callback: Function): void;
/**
 * @param {HTMLElement} provider
 * @param {string | Context} context Context identifier
 * @param {Function} callback
 */
export function onContextUnobserve(provider: HTMLElement, context: string | Context, callback: Function): void;
/**
 *
 *
 * @param {HTMLElement} consumer
 * @param {Context | string} context
 * @return {*}
 */
export function getContext(consumer: HTMLElement, context: Context | string): any;
//# sourceMappingURL=core.d.ts.map