import * as Types from './types.ts'

export function dataCheck(arr: Types.checkDataArr[]): boolean {
  let i = 0

  while (i < arr.length) {
    if (typeof arr[i][0] !== arr[i][1]) {
      return false
    }
    i++
  }

  return true
}