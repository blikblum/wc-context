import { ContextProvider } from '../../provider.js'
import { observeData } from './dataService.js'

export class DataProvider extends ContextProvider {
  initialize() {
    this.unsubscribe = observeData((value) => {
      this.value = value
    })
  }

  finalize() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = undefined
    }
  }
}
