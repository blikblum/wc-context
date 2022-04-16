/* eslint-env jest */
import { registerContext, updateContext } from '../core'

import '../context-consumer.js'

describe('context-consumer', () => {
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
          <context-consumer id="parent" key="key">
            <context-consumer id="child" key="key"></context-consumer>
          </context-consumer>
          <div id="parent2">
            <div id="child2"></div>
          </div>
        </div>
        <context-consumer id="grandfather2">
          <div id="parent3">
            <div id="child3"></div>
          </div>
        </context-consumer>
      </div>
    `
    rootEl = document.getElementById('root')
    grandfatherEl = document.getElementById('grandfather')
    grandfather2El = document.getElementById('grandfather2')
    parentEl = document.getElementById('parent')
    childEl = document.getElementById('child')
    child3El = document.getElementById('child3')
  })

  describe('when is a child of a context provider', () => {
    beforeEach(() => {
      registerContext(grandfatherEl, 'key', 'value')
    })

    test('should be acessible in all children nodes', () => {
      expect(parentEl.value).toBe('value')
      expect(childEl.value).toBe('value')
    })

    test('should not be acessible in sibling nodes', () => {
      expect(grandfather2El.value).toBeUndefined()
    })

    test('should update its value when context value is updated', () => {
      updateContext(grandfatherEl, 'key', 'value2')
      expect(parentEl.value).toBe('value2')
      expect(childEl.value).toBe('value2')
    })

    test('should trigger context-update event when context value is updated', () => {
      const spy = jest.fn()
      function callback(e) {
        spy(e.context, e.value, e.target.id)
      }
      grandfatherEl.addEventListener('context-update', callback)
      updateContext(grandfatherEl, 'key', 'value2')
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenCalledWith('key', 'value2', 'parent')
      expect(spy).toHaveBeenCalledWith('key', 'value2', 'child')
    })
  })
})
