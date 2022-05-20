<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { api as apiServices } from '~/common/composables'

const search = ref('')
const selectedPost = ref(null)
const visiblePostFormModal = ref(false)
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-posts',
    breadcrumbName: 'Articles',
  },
]
const dataPosts = ref<any>(null)
const columns = ref([
  {
    title: 'Titre',
    dataIndex: 'title',
    key: 'title',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Auteur',
    dataIndex: 'author',
    key: 'author',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Création',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Date modification',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Publication',
    dataIndex: 'validated',
    key: 'validated',
    sorter: true,
    filters: [
      { text: 'publié', value: 'true' },
      { text: 'non publié', value: 'false' },
    ],
    align: 'center',
  },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 200,
    align: 'center',
  },
])
const getPosts = async() => {
  const { data, error } = await apiServices('/posts/').json()
  data && !error.value && (dataPosts.value = data.value)
}
onMounted(() => {
  getPosts()
})
const updateOrCreatePost = async(dataPost) => {
  if (dataPost._id) {
    const postId = dataPost._id
    delete dataPost._id
    const formData = new FormData()
    formData.append('title', dataPost.title)
    formData.append('content', dataPost.content)
    formData.append('resume', dataPost.resume)
    formData.append('url_fb', dataPost.url_fb)
    formData.append('url_instagram', dataPost.url_instagram)
    formData.append('url_linkedin', dataPost.url_linkedin)
    formData.append('url_twitter', dataPost.url_twitter)
    formData.append('image', dataPost.image[0].originFileObj)
    const { data: updatePost, error } = await apiServices(`/posts/${postId}`).patch(formData).formData().json()
    updatePost.value && !error.value && (message.success(updatePost.value.message))
  }
  else {
    const formData = new FormData()
    formData.append('title', dataPost.title)
    formData.append('content', dataPost.content)
    formData.append('resume', dataPost.resume)
    formData.append('url_fb', dataPost.url_fb)
    formData.append('url_instagram', dataPost.url_instagram)
    formData.append('url_linkedin', dataPost.url_linkedin)
    formData.append('url_twitter', dataPost.url_twitter)
    formData.append('image', dataPost.image[0].originFileObj)

    const { data: createPost, error } = await apiServices('/posts/').post(formData).formData().json()
    createPost.value && !error.value && (message.success(createPost.value.message))
    if (error.value)
      message.error(error.value)
  }
  getPosts()
  visiblePostFormModal.value = false
}
const deletePost = async(postId) => {
  const { data: deletePost, error } = await apiServices(`/posts/${postId}`).delete().json()
  deletePost.value && !error.value && (message.success(deletePost.value?.message))
  getPosts()
}
const publishOrUnpublishPost = async(postId, validated) => {
  if (validated) {
    const { data: publishPost, error } = await apiServices(`/posts/unvalidate/${postId}`).patch().json()
    publishPost.value && !error.value && (message.success(publishPost.value?.message))
    getPosts()
  }
  else {
    const { data: publishPost, error } = await apiServices(`/posts/validate/${postId}`).patch().json()
    publishPost.value && !error.value && (message.success(publishPost.value?.message))
    getPosts()
  }
}

</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Articles" :breadcrumb="{ routes }" sub-title="Liste des articles"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
      <template #extra>
        <a-input-search
          v-model:value="search" allow-clear placeholder="rechercher :" :loading="!dataPosts"
          :disabled="!search.length && dataPosts && dataPosts.length === 0" enter-button class="!w-55"
        >
          <template v-if="false" #suffix>
            <a-tooltip title="scroll to device">
              <a-button type="link" size="small">
                <template #icon>
                  <span class="i-carbon-auto-scroll anticon block text-sm text-opacity-10" />
                </template>
              </a-button>
            </a-tooltip>
          </template>
        </a-input-search>
        <!--
        <a-button key="2">
          Operation
        </a-button>
        -->
        <a-button key="1" type="primary" @click="() => { selectedPost = null, visiblePostFormModal = true }">
          Ajouter un article
        </a-button>
        <!--
        <a-dropdown key="more">
          <a-button class="!border-none !px-1" type="link">
            <span class="i-carbon-overflow-menu-horizontal inline-block anticon text-lg !align-top" />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
                  1st menu item
                </a>
              </a-menu-item>
              <a-menu-item>
                <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
                  2nd menu item
                </a>
              </a-menu-item>
              <a-menu-item>
                <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
                  3rd menu item
                </a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        -->
      </template>
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataPosts" size="small" :data-source="dataPosts || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
          <template v-if="column.dataIndex === 'validated'">
            <a-tag :color="text === true ? 'green' : 'red'">
              {{ text === true ? 'publié' : 'non publié' }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'createdAt'">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template v-if="column.dataIndex === 'updatedAt'">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template v-if="column.key === 'operation'">
            <a-button
              size="small" class="mr-1 inline-block" type="link"
              @click="() => {selectedPost = record, visiblePostFormModal = true }"
            >
              <span class="i-carbon-edit inline-block" />
            </a-button>
            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="publishOrUnpublishPost(record._id,record.validated)">
              <a-button v-if="text.validated == true" size="small" class="mr-1 inline-block" type="link" warn>
                <span class="i-carbon-misuse-outline inline-block" />
              </a-button>
              <a-button v-else size="small" class="mr-1 inline-block" type="link" warn>
                <span class="i-carbon-checkmark-outline inline-block" />
              </a-button>
            </a-popconfirm>
            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="deletePost(record._id)">
              <a-button size="small" class="mr-1 inline-block" type="link" danger>
                <span key="delete" class="i-carbon-delete inline-block" />
              </a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <post-form-modal
    v-model:visible="visiblePostFormModal"
    :post="selectedPost" @after-close="() => selectedPost = null"
    @update-or-create-post="updateOrCreatePost"
  />
</template>
<style lang="less">
.pagination-container {
  height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &__list {
    height: 370px;
    overflow: auto;

    &-suffix {
      margin-right: 20px;
    }
  }
}
</style>
<route lang="yaml">
meta:
  layout: admin
  siderMenu:
    name: dashboard.posts.index
    index: 1
    parentName: dashboard.posts.parent
    link: dashboard-posts
    classes: test for classes
    icon: i-carbon:blog
    childOf: null
</route>
