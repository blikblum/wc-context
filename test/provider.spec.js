import { observeContext } from '../core.js'
import { ContextProvider } from '../provider.js'

describe('ContextProvider', () => {
  let rootEl
  let grandfatherEl
  let grandfather2El
  let parentEl
  let childEl
  let child3El

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
        <div id="grandfather2">
          <div id="parent3">
            <div id="child3"></div>
          </div>
        </div>
      </div>
    `
    rootEl = document.getElementById('root')
    grandfatherEl = document.getElementById('grandfather')
    grandfather2El = document.getElementById('grandfather2')
    parentEl = document.getElementById('parent')
    childEl = document.getElementById('child')
    child3El = document.getElementById('child3')
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

  it('should call finalize once when dispose is called after', () => {
    const finalize = jest.fn()
    class CustomProvider extends ContextProvider {
      finalize() {
        finalize()
      }
    }
    const provider = new CustomProvider(grandfatherEl, 'key', 'value')
    provider.dispose()
    expect(finalize).toHaveBeenCalledTimes(0)
    observeContext(parentEl, 'key')
    expect(finalize).toHaveBeenCalledTimes(0)
    provider.dispose()
    expect(finalize).toHaveBeenCalledTimes(1)
    provider.dispose()
    expect(finalize).toHaveBeenCalledTimes(1)
  })
})
