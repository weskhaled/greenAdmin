<script setup lang="ts">
import { Form } from 'ant-design-vue'
import { createApp } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import App from './PostFormModal.vue'

const globalOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ align: [] }],
      [{ font: [] }],
      ['clean'],
      ['link'],
    ],
  },
  debug: 'info',
  placeholder: 'saisir le contenu',
  readOnly: false,
  theme: 'snow',
}
const app = createApp(App)
app.component('QuillEditor', QuillEditor)
QuillEditor.props.globalOptions.default = () => globalOptions

interface Props {
  post?: Ref<any>
}

const props = withDefaults(defineProps<Props>(), {
  post: () => ref(null),
})
const emit = defineEmits(['updateOrCreatePost'])

const { t } = useI18n()
const useForm = Form.useForm
const profileAvatar = ref('')

const modelRef = reactive<Record<string, any>>({
  _id: undefined,
  title: '',
  content: '',
  url_fb: '',
  url_instagram: '',
  url_twitter: '',
  url_linkedin: '',
  resume: '',
  image: null,
  validated: false,
})
const myQuillEditor = ref(null)
const rulesRef = reactive({
  title: [
    {
      required: true,
      message: 'Saisir le titre',
    },
  ],
  content: [
    {
      required: true,
      message: 'Saisir le contenu',
    },
  ],
  resume: [
    {
      required: true,
      message: 'Saisir le resumé',
    },
  ],
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)
const onSubmit = () => {
  validate()
    .then(() => {
      modelRef.content = myQuillEditor.value.getHTML()
      emit('updateOrCreatePost', { ...toRaw(modelRef), _id: props.post?._id || undefined })
    })
    .catch((err) => {
      console.log('error', err)
    })
}
const resetForm = () => {
  try {
    if (props.post) {
      const { title, resume, image, url_fb, url_instagram, url_linkedin, url_twitter, _id } = props.post
      modelRef._id = _id
      modelRef.title = title
      modelRef.resume = resume
      modelRef.url_fb = url_fb
      modelRef.url_instagram = url_instagram
      modelRef.url_linkedin = url_linkedin
      modelRef.url_fb = url_fb
      modelRef.url_twitter = url_twitter
      profileAvatar.value = image
    }
    else {
      modelRef.title = ''
      modelRef.content = ''
      modelRef.resume = ''
      modelRef.url_fb = ''
      modelRef.url_instagram = ''
      modelRef.url_linkedin = ''
      modelRef.url_fb = ''
      modelRef.url_twitter = ''
      profileAvatar.value = ''
      resetFields()
    }
  }
  catch (err) {
    console.log('err ', err)
  }
}
const beforeUploadProfileAvatar = async(file: any) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng)
    message.error('You can only upload JPG file!')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M)
    message.error('Image must smaller than 2MB!')
  if (isJpgOrPng && isLt2M) {
    modelRef.image = [file]
    const base64 = await useBase64(file).execute()
    profileAvatar.value = base64
  }
  return false
}
const onEditorReady = async(quill) => {
  if (props.post)
    quill.container.querySelector('.ql-blank').innerHTML = props.post.content
}

watch(() => props.post, () => {
  resetForm()
})

</script>

<template>
  <a-modal width="55%" destroy-on-close @after-close="resetFields()">
    <template #title>
      <span>
        {{ post ? `Modifier ${post._id}` : 'Création' }}
      </span>
    </template>
    <a-form layout="vertical">
      <div>
        <a-form-item label="Titre" name="title" v-bind="validateInfos.title">
          <a-input v-model:value="modelRef.title" />
        </a-form-item>
        <a-form-item label="Résumé" name="resume" v-bind="validateInfos.resume">
          <a-input v-model:value="modelRef.resume" />
        </a-form-item>
        <a-form-item label="Contenu" name="content">
          <QuillEditor ref="myQuillEditor" v-model:content="modelRef.content" theme="snow" @ready="onEditorReady($event)" />
        </a-form-item>
        <a-form-item label="Avatar">
          <a-form-item name="avatar" no-style>
            <a-upload-dragger
              v-model:fileList="modelRef.image"
              :multiple="false"
              :before-upload="beforeUploadProfileAvatar"
              name="avatar"
            >
              <div v-if="profileAvatar.length">
                <img ref="image" class="w-30 mx-auto" :src="profileAvatar">
              </div>
              <div v-else class="py-3">
                <p class="ant-upload-drag-icon">
                  <span
                    class="i-ant-design-inbox-outlined inline-block text-3xl"
                  />
                </p>
                <p
                  class="ant-upload-text"
                >
                  Click or drag file to this area to upload
                </p>
                <p class="ant-upload-hint">
                  Support for a single or bulk upload.
                </p>
              </div>
            </a-upload-dragger>
          </a-form-item>
        </a-form-item>
        <a-form-item label="Lien Facebook" name="url_fb" v-bind="validateInfos.url_fb">
          <a-input v-model:value="modelRef.url_fb" />
        </a-form-item>
        <a-form-item label="Lien Instagram" name="url_instagram" v-bind="validateInfos.url_instagram">
          <a-input v-model:value="modelRef.url_instagram" />
        </a-form-item>
        <a-form-item label="Lien Twitter" name="url_twitter" v-bind="validateInfos.url_twitter">
          <a-input v-model:value="modelRef.url_twitter" />
        </a-form-item>
        <a-form-item label="Lien Linkedin" name="url_linkedin" v-bind="validateInfos.url_linkedin">
          <a-input v-model:value="modelRef.url_linkedin" />
        </a-form-item>
      </div>
    </a-form>

    <template #footer>
      <a-form-item class="m-0">
        <a-button type="primary" danger @click="resetForm">
          Réinitialiser
        </a-button>
        <a-button type="primary" @click.prevent="onSubmit">
          {{ post ? 'Modifier' : 'Créer' }}
        </a-button>
      </a-form-item>
    </template>
  </a-modal>
</template>
<style lang="less">
</style>
