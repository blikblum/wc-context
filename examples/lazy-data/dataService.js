// from https://codingwithspike.wordpress.com/2018/03/10/making-settimeout-an-async-await-function/
async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

let nextIsError = false

export function queueError() {
  nextIsError = true
}

// simulate an realtime API
export function observeData(subscriber) {
  console.log('starting to observe data')
  const intervalId = setInterval(async () => {
    subscriber({ data: {}, error: null, loading: true })
    await wait(600)
    if (nextIsError) {
      nextIsError = false
      subscriber({ data: {}, error: 'An arbitray error', loading: false })
      return
    }
    try {
      const response = await fetch('https://catfact.ninja/fact')
      const data = await response.json()
      subscriber({ data, error: null, loading: false })
    } catch (error) {
      subscriber({ data: {}, error, loading: false })
    }
  }, 10000)

  subscriber(undefined)

  return function () {
    console.log('ending observe data')
    clearInterval(intervalId)
  }
}
