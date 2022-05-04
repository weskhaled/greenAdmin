<script setup lang="ts">
const router = useRouter()
onMounted(() => {
  router.push('/auth')
})
</script>
<style>
</style>
<route lang="yaml">
meta:
  layout: none
</route>
