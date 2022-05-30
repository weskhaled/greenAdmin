<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { defineComponent, reactive, ref, toRefs } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
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
const state = reactive({
  searchText: '',
  searchedColumn: '',
})

const searchInput = ref()
const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm()
  state.searchText = selectedKeys[0]
  state.searchedColumn = dataIndex
}

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true })
  state.searchText = ''
}
const columns: TableColumnsType = [
  {
    title: 'Titre',
    dataIndex: 'title',
    key: 'title',
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.title.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus()
        }, 100)
      }
    },
    align: 'center',
  },
  {
    title: 'Auteur',
    dataIndex: 'author',
    key: 'author',
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.author.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus()
        }, 100)
      }
    },
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
    align: 'center',
    filters: [
      { text: 'publié', value: true },
      { text: 'non publié', value: false },
    ],
    onFilter: (value, record) =>
      record.validated === value,
  },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 200,
    align: 'center',
  },
]
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
        <a-button key="1" type="primary" @click="() => { selectedPost = null, visiblePostFormModal = true }">
          Ajouter un article
        </a-button>
      </template>
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataPosts" size="small" :data-source="dataPosts || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
          <span v-if="searchText && searchedColumn === column.dataIndex">
            <template
              v-for="(fragment, i) in text
                .toString()
                .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
            >
              <mark
                v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                :key="i"
                class="highlight"
              >
                {{ fragment }}
              </mark>
              <template v-else>{{ fragment }}</template>
            </template>
          </span>
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
        <template
          #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        >
          <div style="padding: 8px">
            <a-input
              ref="searchInput"
              :placeholder="`Search ${column.dataIndex}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
              type="primary"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon>
                <SearchOutlined />
              </template>
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
              Initialiser
            </a-button>
          </div>
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
