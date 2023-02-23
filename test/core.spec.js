/* eslint-env jest */
import { jest } from '@jest/globals'
import {
  ContextRequestEvent,
  registerContext,
  observeContext,
  unobserveContext,
  updateContext,
  createContext,
  onContextObserve,
  onContextUnobserve,
} from 'wc-context'

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
      registerContext(grandfatherEl, 'key', 'value')
    })

    test('should be acessible in all children nodes', () => {
      observeContext(parentEl, 'key')
      observeContext(childEl, 'key')
      expect(parentEl.key).toBe('value')
      expect(childEl.key).toBe('value')
    })

    test('should not be acessible in parent nodes', () => {
      observeContext(rootEl, 'key')
      expect(rootEl.key).toBeUndefined()
    })

    test('should not be acessible in sibling nodes', () => {
      observeContext(grandfather2El, 'key')
      observeContext(child3El, 'key')
      expect(grandfather2El.key).toBeUndefined()
      expect(child3El.key).toBeUndefined()
    })

    test('should return same value when called repeatedly', () => {
      observeContext(childEl, 'key')
      expect(childEl.key).toBe('value')
      expect(childEl.key).toBe('value')
      expect(childEl.key).toBe('value')
    })

    test('should allow to configure how context value is set', () => {
      function setElProperty(el, value, arg) {
        el[arg] = value
      }

      observeContext(childEl, 'key', 'otherProp', setElProperty)
      expect(childEl.otherProp).toBe('value')
    })

    test('should throw when trying to update a not registered context', () => {
      expect(() => {
        updateContext(grandfatherEl, 'key2')
      }).toThrow('updateContext: "key2" is not registered')
      expect(() => {
        const ctx = createContext('hello')
        updateContext(grandfatherEl, ctx)
      }).toThrow('updateContext: "hello" is not registered')
    })

    test('should trigger "context-request" event when observing context', () => {
      const listener = jest.fn((event) => {
        expect(event.subscribe).toBe(true)
        if (event.context === 'manualKey') {
          event.callback('manualValue')
        }
      })
      grandfatherEl.addEventListener('context-request', listener, {
        once: true,
      })

      observeContext(parentEl, 'manualKey')
      expect(listener).toHaveBeenCalledTimes(1)
      expect(parentEl.manualKey).toBe('manualValue')
    })

    test('should handle "context-request" event with falsy subscribe', () => {
      const callback = jest.fn((value) => {
        expect(value).toBe('value')
      })
      const event = new ContextRequestEvent('key', callback)
      parentEl.dispatchEvent(event)
      expect(callback).toHaveBeenCalledTimes(1)
      updateContext(grandfatherEl, 'key', 'newValue')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    test('should handle "context-request" event with truthy subscribe', () => {
      const callback = jest
        .fn()
        .mockImplementationOnce((value) => {
          expect(value).toBe('value')
        })
        .mockImplementation((value, unsubscribe) => {
          expect(value).toBe('newValue')
          unsubscribe()
        })
      const event = new ContextRequestEvent('key', callback, true)
      parentEl.dispatchEvent(event)
      expect(callback).toHaveBeenCalledTimes(1)
      updateContext(grandfatherEl, 'key', 'newValue')
      expect(callback).toHaveBeenCalledTimes(2)
      updateContext(grandfatherEl, 'key', 'yetAnotherValue')
      expect(callback).toHaveBeenCalledTimes(2)
    })

    describe('and registered to a child node', () => {
      beforeEach(() => {
        registerContext(parentEl, 'key', 'value2')
      })

      test('should override parent context', () => {
        observeContext(childEl, 'key')
        expect(childEl.key).toBe('value2')
      })
    })

    describe('and registered to a child node with different key', () => {
      beforeEach(() => {
        registerContext(parentEl, 'key2', 'value2')
      })

      test('should not override parent context', () => {
        observeContext(childEl, 'key')
        expect(childEl.key).toBe('value')
      })
    })

    describe('and registered to a sibling node', () => {
      beforeEach(() => {
        registerContext(grandfather2El, 'key', 'value2')
      })

      test('should keep independent values', () => {
        observeContext(childEl, 'key')
        observeContext(child3El, 'key')
        expect(childEl.key).toBe('value')
        expect(child3El.key).toBe('value2')
      })
    })

    describe('and context is updated', () => {
      beforeEach(() => {
        observeContext(parentEl, 'key')
        updateContext(grandfatherEl, 'key', 'value2')
      })
      it('should update the observer context value', () => {
        expect(parentEl.key).toBe('value2')
      })
    })

    describe('and context is updated after unobserved', () => {
      beforeEach(() => {
        observeContext(parentEl, 'key')
        unobserveContext(parentEl, 'key')
        parentEl.key = 'none'
        updateContext(grandfatherEl, 'key', 'value2')
      })
      it('should not update the observer context value', () => {
        expect(parentEl.key).toBe('none')
      })
    })

    describe('and observed by a child node after context is updated', () => {
      beforeEach(() => {
        updateContext(grandfatherEl, 'key', 'value2')
        observeContext(parentEl, 'key')
      })
      it('should provide updated value', () => {
        expect(parentEl.key).toBe('value2')
      })
    })

    describe('and observed by a child node', () => {
      let callback
      beforeEach(() => {
        callback = jest.fn()
        childEl.contextChangedCallback = callback
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

    describe('and a observe listener is registered with onContextObserve', () => {
      let callback
      beforeEach(() => {
        callback = jest.fn()

        onContextObserve(grandfatherEl, 'key', callback)
      })

      test('should call listener callback when a context is observed', () => {
        observeContext(childEl, 'key')
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith({ count: 1 })
      })

      test('should not call listener callback when a context is unobserved', () => {
        observeContext(childEl, 'key')
        callback.mockClear()
        unobserveContext(childEl, 'key')
        expect(callback).toHaveBeenCalledTimes(0)
      })
    })

    describe('and a unobserve listener is registered with onContextUnobserve', () => {
      let callback
      beforeEach(() => {
        callback = jest.fn()

        onContextUnobserve(grandfatherEl, 'key', callback)
      })

      test('should not call listener callback when a context is observed', () => {
        observeContext(childEl, 'key')
        expect(callback).toHaveBeenCalledTimes(0)
      })

      test('should call listener callback when a context is unobserved', () => {
        observeContext(childEl, 'key')
        callback.mockClear()
        unobserveContext(childEl, 'key')
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith({ count: 0 })
      })
    })
  })

  describe('when registered in a node with a custom getter', () => {
    let getter
    beforeEach(() => {
      getter = jest.fn()
      registerContext(grandfatherEl, 'key', 'value', getter)
    })

    test('should call the getter with payload when observed by a child', () => {
      expect(getter).toHaveBeenCalledTimes(0)
      observeContext(parentEl, 'key')
      expect(getter).toHaveBeenCalledTimes(1)
      expect(getter).toHaveBeenCalledWith(grandfatherEl, 'value')
    })

    test('should call the getter with payload when context is updated', () => {
      expect(getter).toHaveBeenCalledTimes(0)
      observeContext(parentEl, 'key')
      expect(getter).toHaveBeenCalledTimes(1)
      updateContext(grandfatherEl, 'key', 'value2')
      expect(getter).toHaveBeenCalledTimes(2)
      expect(getter).toHaveBeenCalledWith(grandfatherEl, 'value')
    })

    test('should update the consumer with the value returned by getter', () => {
      getter.mockReturnValue(1)
      observeContext(parentEl, 'key')
      expect(parentEl.key).toBe(1)
    })
  })

  describe('when registered in a node with identifier returned by createContext', () => {
    let ctx
    beforeEach(() => {
      ctx = createContext('myContext')
      registerContext(grandfatherEl, ctx, 'value')
    })

    test('should be acessible in all children nodes', () => {
      observeContext(parentEl, ctx, 'key')
      observeContext(childEl, ctx, 'key')
      expect(parentEl.key).toBe('value')
      expect(childEl.key).toBe('value')
    })

    test('should not be acessible in parent nodes', () => {
      observeContext(rootEl, ctx, 'key')

      expect(rootEl.key).toBeUndefined()
    })

    test('should not be acessible in sibling nodes', () => {
      observeContext(grandfather2El, ctx, 'key')

      observeContext(child3El, ctx, 'key')
      expect(grandfather2El.key).toBeUndefined()
      expect(child3El.key).toBeUndefined()
    })

    describe('and registered to a child node with different identifier', () => {
      let ctx2
      beforeEach(() => {
        ctx2 = createContext('myContext')
        registerContext(parentEl, ctx2, 'value2')
      })

      test('should not override parent context', () => {
        observeContext(childEl, ctx, 'key')
        expect(childEl.key).toBe('value')
      })
    })
  })

  describe('when registered to a node after a child try to observe', () => {
    let callback
    beforeEach(() => {
      callback = jest.fn()
      parentEl.contextChangedCallback = callback

      observeContext(child3El, 'key')
      observeContext(parentEl, 'key')
      registerContext(grandfatherEl, 'key', 'value')
    })

    test('should call contextChangedCallback in the observer', () => {
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('key', undefined, 'value')
    })

    test('should update the observer context', () => {
      expect(parentEl.key).toBe('value')
    })

    test('should not update the observer context of not children', () => {
      expect(child3El.key).toBeUndefined
    })

    describe('and context is updated after unobserved', () => {
      beforeEach(() => {
        unobserveContext(parentEl, 'key')
        parentEl.key = 'none'
        updateContext(grandfatherEl, 'key', 'value2')
      })
      it('should not update the observer context value', () => {
        expect(parentEl.key).toBe('none')
      })
    })
  })
})
