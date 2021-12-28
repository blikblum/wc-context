import { observeContext } from '../core.js'
import { ContextProvider } from '../provider.js'
import { LitElement } from 'lit'

const ProviderComponent = class extends LitElement {
  ctxProvider = new ContextProvider(this, 'controllerContext', 7)
}

customElements.define('lit-controller-provider', ProviderComponent)

describe('ContextProvider', () => {
  let rootEl
  let grandfatherEl
  let parentEl
  let childEl

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <div id="grandfather">
          <div id="parent">
            <div id="child"></div>
          </div>
          <div id="parent2">
            <div id="child2"></div>
          </div>
        </div>       
      </div>
    `
    rootEl = document.getElementById('root')
    grandfatherEl = document.getElementById('grandfather')
    parentEl = document.getElementById('parent')
    childEl = document.getElementById('child')
  })

  it('should provide context for children with', () => {
    new ContextProvider(grandfatherEl, 'key', 'value')
    observeContext(parentEl, 'key')
    expect(parentEl.key).toBe('value')
  })

  it('should update context when value property is set', () => {
    const provider = new ContextProvider(grandfatherEl, 'key', 'value')
    observeContext(parentEl, 'key')
    provider.value = 'value2'
    expect(parentEl.key).toBe('value2')
  })

  it('should call initialize once when context is first observed', () => {
    const initialize = jest.fn()
    class CustomProvider extends ContextProvider {
      initialize() {
        initialize()
      }
    }
    new CustomProvider(grandfatherEl, 'key', 'value')
    expect(initialize).toHaveBeenCalledTimes(0)
    observeContext(parentEl, 'key')
    expect(initialize).toHaveBeenCalledTimes(1)
    observeContext(childEl, 'key')
    expect(initialize).toHaveBeenCalledTimes(1)
  })

  it('should call finalize once when disconnect is called after', () => {
    const finalize = jest.fn()
    class CustomProvider extends ContextProvider {
      finalize() {
        finalize()
      }
    }
    const provider = new CustomProvider(grandfatherEl, 'key', 'value')
    provider.disconnect()
    expect(finalize).toHaveBeenCalledTimes(0)
    observeContext(parentEl, 'key')
    expect(finalize).toHaveBeenCalledTimes(0)
    provider.disconnect()
    expect(finalize).toHaveBeenCalledTimes(1)
    provider.disconnect()
    expect(finalize).toHaveBeenCalledTimes(1)
  })

  it('should call initialize again after disconnect followed by connect are called', () => {
    const initialize = jest.fn()
    class CustomProvider extends ContextProvider {
      initialize() {
        initialize()
      }
    }
    const provider = new CustomProvider(grandfatherEl, 'key', 'value')
    observeContext(parentEl, 'key')
    expect(initialize).toHaveBeenCalledTimes(1)
    provider.disconnect()
    expect(initialize).toHaveBeenCalledTimes(1)
    provider.connect()
    expect(initialize).toHaveBeenCalledTimes(2)
  })

  it('should call connect and disconnect when ReactiveControllerHost element is connected / disconnected', () => {
    const el = document.createElement('lit-controller-provider')
    const controller = el.ctxProvider
    const connectFn = jest.spyOn(controller, 'connect')
    const disconnectFn = jest.spyOn(controller, 'disconnect')
    rootEl.appendChild(el)
    expect(connectFn).toHaveBeenCalledTimes(1)
    expect(disconnectFn).toHaveBeenCalledTimes(0)
    el.remove()
    expect(connectFn).toHaveBeenCalledTimes(1)
    expect(disconnectFn).toHaveBeenCalledTimes(1)
  })
})
