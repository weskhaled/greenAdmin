import { createFetch } from '@vueuse/core'
import { message } from 'ant-design-vue'
import { token } from '~/common/stores'
import showCodeMessage from '~/common/services/code'

const BASE_PREFIX = `${import.meta.env.VITE_API_BASEURL}`

const useMyFetch = createFetch({
  baseUrl: BASE_PREFIX,
  options: {
    beforeFetch({ options }) {
      token.value && token.value.length
        ? options.headers.token = `${token.value}`
        : delete options.headers.token

      return { options }
    },
    async onFetchError(ctx) {
      if (ctx.response?.status === 401 && ctx.data.user === false) {
        message.error(ctx.data.message || 'Auth error, 401')
        token.value = null
      }
      ctx.error = new Error(showCodeMessage(`${ctx.response?.status}`))

      return ctx
    },

    immediate: true,
  },
})

export const api = useMyFetch
