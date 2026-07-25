/**
 * Get index item of array. Supports negative index, where -1 is last element in array.
 *
 * 获取数组中的索引项。支持负索引，其中 -1 是数组的最后一个元素。
 *
 * @param arr - Array to get item from / 要获取项的数组
 * @param index - Index of item / 项的索引
 * @returns Array item / 数组项
 */
export const getArrayItem = <Item>(arr: Item[], index: number): Item =>
  index >= 0 ? arr[index] : arr[arr.length + index];
