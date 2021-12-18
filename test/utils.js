const uniqueMap = new Map()

export function uniqueName(name) {
  let index = uniqueMap.get(name) || 0
  index++
  uniqueMap.set(name, index)
  return name + index
}
