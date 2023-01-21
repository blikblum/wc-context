import { jest } from '@jest/globals'
import { registerContext, updateContext } from 'wc-context/core.js'
import { ContextConsumer } from 'wc-context/controllers.js'
import { LitElement } from 'lit'

const ComponentWithConsumer = class extends LitElement {}

customElements.define('lit-controller-consumer', ComponentWithConsumer)

describe('ContextConsumer', () => {
  let grandfatherEl
  let parentEl

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <div id="grandfather">
          <div id="parent">
            
          </div>
          <div id="parent2">
            <div id="child2"></div>
          </div>
        </div>       
      </div>
    `
    grandfatherEl = document.getElementById('grandfather')
    parentEl = document.getElementById('parent')
  })

  it('should consume parent context when connected', () => {
    registerContext(grandfatherEl, 'key', 'value')
    const component = new ComponentWithConsumer()
    const ctxConsumer = new ContextConsumer(component, 'key')
    parentEl.appendChild(component)
    expect(ctxConsumer.value).toBe('value')
  })

  it('should update its value when context changes', () => {
    registerContext(grandfatherEl, 'key', 'value')
    const component = new ComponentWithConsumer()
    const ctxConsumer = new ContextConsumer(component, 'key')
    parentEl.appendChild(component)
    updateContext(grandfatherEl, 'key', 'value2')
    expect(ctxConsumer.value).toBe('value2')
  })

  it('should call callback param when context changes', async () => {
    registerContext(grandfatherEl, 'key', 'value')
    const component = new ComponentWithConsumer()
    const callback = jest.fn()
    new ContextConsumer(component, 'key', callback)
    parentEl.appendChild(component)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('value')
    callback.mockClear()
    await component.updateComplete
    updateContext(grandfatherEl, 'key', 'value2')
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('value2')
  })

  it('should call host requestUpdate when context changes and callback is ommited', async () => {
    registerContext(grandfatherEl, 'key', 'value')
    const component = new ComponentWithConsumer()
    new ContextConsumer(component, 'key')
    parentEl.appendChild(component)
    await component.updateComplete
    const updateFn = jest.spyOn(component, 'requestUpdate')
    updateContext(grandfatherEl, 'key', 'value2')
    expect(updateFn).toHaveBeenCalledTimes(1)
  })
})
