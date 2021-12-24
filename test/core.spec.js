/* eslint-env jest */
import { registerContext, observeContext, updateContext } from '../core'

function defineContextProp(el, name) {
  el.__wcContext = {}
  Object.defineProperty(el, name, {
    get() {
      return this.__wcContext
    },
  })
}

describe('context', () => {
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

  describe('when registered in a node', () => {
    beforeEach(() => {
      registerContext(grandfatherEl, 'key', { key: 'value' })
    })

    test('should be acessible in all children nodes', () => {
      defineContextProp(parentEl, 'context')
      observeContext(parentEl, 'key')
      defineContextProp(childEl, 'context')
      observeContext(childEl, 'key')
      expect(parentEl.context.key).toBe('value')
      expect(childEl.context.key).toBe('value')
    })

    test('should not be acessible in parent nodes', () => {
      defineContextProp(rootEl, 'context')
      observeContext(rootEl, 'key')
      expect(rootEl.context.key).toBeUndefined()
    })

    test('should not be acessible in sibling nodes', () => {
      defineContextProp(grandfather2El, 'context')
      observeContext(grandfather2El, 'key')
      defineContextProp(child3El, 'context')
      observeContext(child3El, 'key')
      expect(grandfather2El.context.key).toBeUndefined()
      expect(child3El.context.key).toBeUndefined()
    })

    test('should return same value when called repeatedly', () => {
      defineContextProp(childEl, 'context')
      observeContext(childEl, 'key')
      expect(childEl.context.key).toBe('value')
      expect(childEl.context.key).toBe('value')
      expect(childEl.context.key).toBe('value')
    })

    test('should allow to configure how context value is set', () => {
      function setElProperty(el, value, arg) {
        el[arg] = value
      }

      observeContext(childEl, 'key', setElProperty, 'otherProp')
      expect(childEl.otherProp).toBe('value')
    })

    describe('and registered to a child node', () => {
      beforeEach(() => {
        registerContext(parentEl, 'key', { key: 'value2' })
      })

      test('should override parent context', () => {
        defineContextProp(childEl, 'context')
        observeContext(childEl, 'key')
        expect(childEl.context.key).toBe('value2')
      })
    })

    describe('and registered to a child node with different key', () => {
      beforeEach(() => {
        registerContext(parentEl, 'key2', { key2: 'value2' })
      })

      test('should not override parent context', () => {
        defineContextProp(childEl, 'context')
        observeContext(childEl, 'key')
        expect(childEl.context.key).toBe('value')
      })
    })

    describe('and registered to a sibling node', () => {
      beforeEach(() => {
        registerContext(grandfather2El, 'key', { key: 'value2' })
      })

      test('should keep independent values', () => {
        defineContextProp(childEl, 'context')
        observeContext(childEl, 'key')
        defineContextProp(child3El, 'context')
        observeContext(child3El, 'key')
        expect(childEl.context.key).toBe('value')
        expect(child3El.context.key).toBe('value2')
      })
    })

    describe('and observed by a child node', () => {
      let callback
      beforeEach(() => {
        callback = jest.fn()
        childEl.contextChangedCallback = callback
        defineContextProp(childEl, 'context')
        observeContext(childEl, 'key')
      })

      test('should call contextChangedCallback in the observer', () => {
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('key', undefined, 'value')
      })

      test('should call contextChangedCallback when context is updated', () => {
        callback.mockClear()
        updateContext(grandfatherEl, 'key', 'value2')
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('key', 'value', 'value2')
      })

      test('should not call contextChangedCallback when context is updated with same value', () => {
        callback.mockClear()
        updateContext(grandfatherEl, 'key', 'value')
        expect(callback).not.toHaveBeenCalled()
      })
    })
  })

  describe('when registered to a node after a child try to observe', () => {
    let callback
    beforeEach(() => {
      callback = jest.fn()
      parentEl.contextChangedCallback = callback

      defineContextProp(parentEl, 'context')
      observeContext(parentEl, 'key')
      registerContext(grandfatherEl, 'key', { key: 'value' })
    })

    test('should call contextChangedCallback in the observer', () => {
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('key', undefined, 'value')
    })

    test('should update the observer context', () => {
      expect(parentEl.context.key).toBe('value')
    })
  })
})
