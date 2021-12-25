/* eslint-env jest */
import { registerContext, observeContext, updateContext } from '../core'

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

      observeContext(childEl, 'key', setElProperty, 'otherProp')
      expect(childEl.otherProp).toBe('value')
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
  })

  describe('when registered to a node after a child try to observe', () => {
    let callback
    beforeEach(() => {
      callback = jest.fn()
      parentEl.contextChangedCallback = callback

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
  })
})
