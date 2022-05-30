<script setup lang="ts">
// import service from '~/common/services/http'
import { message } from 'ant-design-vue'
import { token } from '~/common/stores'
import { api as apiServices } from '~/common/composables'

const router = useRouter()
const { t } = useI18n()

const loginLoading = ref(false)
onMounted(() => {
  if (token.value?.length)
    router.push({ name: 'dashboard' })
})
interface FormState {
  username: string
  password: string
}
const formState = reactive<FormState>({
  username: '',
  password: '',
})
const onFinish = async(values: any) => {
  loginLoading.value = true
  const { data } = await apiServices('/auth/login').post(values).json()

  if (data.value) {
    token.value = data.value.token
    router.push({ name: 'dashboard' })
  }

  loginLoading.value = false
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}
const disabled = computed(() => {
  return !(formState.username && formState.password)
})
</script>

<template>
  <div class="flex items-center min-h-screen p-6 bg-green-200 dark:bg-green-900">
    <div class="flex-1 relative h-full max-w-3xl mx-auto overflow-hidden bg-white dark:bg-dark-700 rounded-md shadow-md shadow-gray-50/4">
      <div class="flex flex-col overflow-y-auto md:flex-row">
        <div class="h-32 md:h-auto md:w-2/5">
          <img aria-hidden="true" class="object-cover w-full h-full dark:hidden" src="https://images.unsplash.com/photo-1609473295863-2d9299af71d4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2787&q=80" alt="Office">
          <img aria-hidden="true" class="hidden object-cover w-full h-full dark:block" src="https://images.unsplash.com/photo-1609473295863-2d9299af71d4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2787&q=80" alt="Office">
        </div>
        <div class="flex items-center justify-center p-6 sm:p-12 md:w-3/5">
          <div class="w-full">
            <div class="absolute top-2 right-2">
              <DarkSwitch />
            </div>
            <img aria-hidden="true" src="./Green_positive.png" alt="Office">

            <h1 class="mb-4 text-3xl font-semibold text-green-900 !dark:text-green-100">
              Login
            </h1>
            <div>
              <a-form
                layout="vertical"
                :model="formState"
                name="normal_login"
                class="login-form"
                @finish="onFinish"
                @finish-failed="onFinishFailed"
              >
                <a-form-item
                  label="Identifiant"
                  name="username"
                  :rules="[{ required: true, message: 'Veuillez saisir votre identifiant !' }]"
                >
                  <a-input v-model:value="formState.username" size="large">
                    <template #prefix>
                      <span class="i-ph-user-duotone site-form-item-icon" />
                    </template>
                  </a-input>
                </a-form-item>

                <a-form-item
                  label="Mot de passe"
                  name="password"
                  :rules="[{ required: true, message: 'Veuillez saisir votre mot de passe !' }]"
                >
                  <a-input-password v-model:value="formState.password" size="large">
                    <template #prefix>
                      <span class="i-ph-lock-duotone site-form-item-icon" />
                    </template>
                  </a-input-password>
                </a-form-item>
                <!--
                <div class="login-form-wrap">
                  <a-form-item name="remember" no-style>
                    <a-checkbox>
                      <span class="text-dark-700 dark:text-light-200">
                        Remember me
                      </span>
                    </a-checkbox>
                  </a-form-item>
                  <a class="login-form-forgot" href="">M</a>
                </div>
-->
                <a-form-item class="!my-2">
                  <a-button :loading="loginLoading" size="large" block :disabled="disabled" type="primary" html-type="submit" class="">
                    Connexion
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: none
</route>
