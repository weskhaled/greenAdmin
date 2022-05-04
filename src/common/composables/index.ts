import { useUrlSearchParams } from '@vueuse/core'

export const urlSearchParams = useUrlSearchParams('history')
export * from './dark'
export * from './api'
export const flag = useStorage('my-flag', true)
