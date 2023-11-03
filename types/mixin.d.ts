/**
 * @template {typeof HTMLElement } BaseClass
 * @param {BaseClass} Base - Base element class
 * @returns {BaseClass}
 */
export function withContext<BaseClass extends {
    new (): HTMLElement;
    prototype: HTMLElement;
}>(Base: BaseClass): BaseClass;
import { createContext } from './core.js';
export { createContext };
//# sourceMappingURL=mixin.d.ts.map