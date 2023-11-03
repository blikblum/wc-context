export type Context = import('./core.js').Context;
export type ElementPart = import('lit').ElementPart;
export type ClassDescriptor = import('@lit/reactive-element/decorators/base.js').ClassDescriptor;
/**
 * @typedef {import('@lit/reactive-element/decorators/base.js').ClassDescriptor} ClassDescriptor
 */
/**
 * @template {typeof HTMLElement } BaseClass
 * @param {BaseClass} classOrDescriptor - Base element class
 * @returns {BaseClass}
 */
export function withContext<BaseClass extends {
    new (): HTMLElement;
    prototype: HTMLElement;
}>(classOrDescriptor: BaseClass): BaseClass;
export const contextProvider: (...values: unknown[]) => import("lit-html/directive.js").DirectiveResult<typeof ContextProviderDirective>;
import { createContext } from './core.js';
declare class ContextProviderDirective extends Directive {
    /**
     * @type {string | Context}
     */
    context: string | Context;
    /**
     * @type {any}
     * @memberof ContextProviderDirective
     */
    value: any;
    /**
     * @param {ElementPart} part
     * @param {[Context | string, *]} [context, value] directive arguments
     * @return {*}
     * @memberof ContextProviderDirective
     */
    update(part: ElementPart, [context, value]?: [Context | string, any]): any;
}
import { Directive } from 'lit/directive.js';
export { createContext };
//# sourceMappingURL=lit.d.ts.map