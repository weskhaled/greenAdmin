<script setup lang="ts">
import dayjs from 'dayjs'
import { Form } from 'ant-design-vue'

interface Props {
  user?: Ref<any>
  jobs?: Ref<any[]>
}

const props = withDefaults(defineProps<Props>(), {
  user: () => ref(null),
  jobs: () => ref([]),
})
const emit = defineEmits(['updateOrCreateUser'])

const { t } = useI18n()
const useForm = Form.useForm

const modelRef = reactive({
  username: '',
  password: undefined,
  repeatPassword: undefined,
  email: '',
})
const rulesRef = reactive({
  username: [
    {
      required: true,
      message: 'Please input name',
    },
  ],
  password: [
    {
      required: !!props.user,
      message: 'Please Select A password',
    },
  ],
  repeatPassword: [
    {
      required: !!props.user,
      message: 'Please Select A password',
    },
  ],
  email: [
    {
      required: !!props.user,
      message: 'Please Select type e-mail',
    },
  ],
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)
const onSubmit = () => {
  validate()
    .then(() => {
      emit('updateOrCreateUser', { ...toRaw(modelRef), _id: props.user?._id || undefined, email: props.user ? undefined : modelRef.email })
    })
    .catch((err) => {
      console.log('error', err)
    })
}
const resetForm = () => {
  if (props.user) {
    const { username, email } = props.user
    modelRef.username = username
    modelRef.email = email
    modelRef.password = undefined
    modelRef.repeatPassword = undefined
  }
  else {
    modelRef.password = undefined
    modelRef.repeatPassword = undefined
    resetFields()
  }
}
watch(() => props.user, () => {
  resetForm()
})
// defineExpose({ map, api, mapOptions, centerMapView })
</script>

<template>
  <a-modal width="55%" destroy-on-close @after-close="resetFields()">
    <template #title>
      <span>
        {{ user ? `Update ${user.username}` : 'add' }}
      </span>
    </template>
    <a-form layout="vertical">
      <div class="grid-cols-2 grid gap-4">
        <a-form-item label="Username" v-bind="validateInfos.username">
          <a-input v-model:value="modelRef.username" />
        </a-form-item>

        <a-form-item label="Password" v-bind="validateInfos.password">
          <a-input v-model:value="modelRef.password" />
        </a-form-item>
      </div>
      <div>
        <a-form-item v-if="!user" label="E-mail" v-bind="validateInfos.email">
          <a-input v-model:value="modelRef.email" />
        </a-form-item>
        <a-form-item v-else label="Repeat Password" v-bind="validateInfos.repeatPassword">
          <a-input v-model:value="modelRef.repeatPassword" />
        </a-form-item>
      </div>
    </a-form>
    <template #footer>
      <a-form-item class="m-0">
        <a-button type="primary" danger @click="resetForm">
          Reset
        </a-button>
        <a-button type="primary" @click.prevent="onSubmit">
          {{ user ? 'Update' : 'Create' }}
        </a-button>
      </a-form-item>
    </template>
  </a-modal>
</template>
<style lang="less">
</style>
