<template>
  <section class="wrap">
    <div class="section-header">
  <h1 class="page-title">Community Forum</h1>
  <p class="page-desc">Be kind and respectful. If you see content that needs moderator attention, use “Report”.</p>

  <div class="head__actions" style="margin-top:10px; display:flex; gap:8px; justify-content:center;">
    <Button icon="pi pi-plus" label="New Post" @click="openComposer" />
    <Button
      icon="pi pi-flag"
      label="Report Selected"
      severity="secondary"
      :disabled="!selectedRows.length"
      @click="reportSelected"
    />
  </div>
</div>

    <Card class="card-panel">
      <template #title>Community Posts</template>

      <template #content>
        <div class="filters">
          <div class="fcol">
            <label class="lbl">Global search</label>
            <InputText v-model="globalFilter" placeholder="Search title / category / tags…" class="wfull" />
          </div>
          <div class="fcol w220">
            <label class="lbl">Category</label>
            <Dropdown
              v-model="categoryFilter"
              :options="categoryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All"
              class="wfull"
            />
          </div>
        </div>

        <DataTable
          :value="tableRows"
          v-model:selection="selectedRows"
          selectionMode="multiple"
          dataKey="id"
          paginator
          :rows="10"
          sortMode="multiple"
          :filters="filters"
          filterDisplay="row"
          :globalFilterFields="['title','category','tagsStr','author']"
          responsiveLayout="scroll"
          class="datatable"
          v-if="tableRows.length"
        >
          <Column selectionMode="multiple" headerStyle="width:3rem" :exportable="false" />
          <Column field="title" header="Title" sortable filter filterPlaceholder="Search title" style="min-width:14rem" />
          <Column field="category" header="Category" sortable filter style="min-width:10rem" />
          <Column field="tagsStr" header="Tags" :showFilterMenu="false" filter filterPlaceholder="tag…" style="min-width:10rem" />
          <Column field="author" header="Author" sortable style="min-width:10rem" />
          <Column field="createdAt" header="Created" sortable style="min-width:10rem">
            <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
          </Column>
          <Column field="status" header="Status" sortable style="min-width:8rem">
            <template #body="{ data }"><Tag :value="data.status" :severity="statusColor(data.status)" /></template>
          </Column>
          <Column header="Actions" :exportable="false" style="min-width:12rem">
            <template #body="{ data }">
              <div class="row-actions">
                <!-- user -->
                <Button icon="pi pi-pencil" rounded text @click="editPost(data)" aria-label="Edit" />
                <Button icon="pi pi-flag" rounded text severity="warn" @click="reportPost(data)" aria-label="Report" />

                <!-- admin -->
                <Button
                  v-if="isAdmin"
                  icon="pi pi-times"
                  rounded text
                  severity="secondary"
                  @click="closePost(data)"
                  aria-label="Close"
                />
                <Button
                  v-if="isAdmin"
                  icon="pi pi-trash"
                  rounded text
                  severity="danger"
                  @click="deletePost(data)"
                  aria-label="Delete"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <div v-else class="empty">
          <div class="empty__title">No posts yet</div>
          <div class="empty__sub">Share your first post with the community.</div>
          <Button icon="pi pi-plus" label="Create a post" @click="openComposer" />
        </div>
      </template>
    </Card>

    <Dialog v-model:visible="composerVisible" header="Create a post" modal :style="{ width: '32rem' }">
      <div class="dlg-grid">
        <div>
          <label class="lbl">Title</label>
          <InputText v-model="form.title" placeholder="Share your tips or ask for advice…" class="wfull" />
        </div>
        <div>
          <label class="lbl">Category</label>
          <Dropdown
            v-model="form.category"
            :options="categoryOptions.slice(1)"
            optionLabel="label"
            optionValue="value"
            placeholder="Select category"
            class="wfull"
          />
        </div>
        <div class="grid-span2">
          <label class="lbl">Tags (comma separated)</label>
          <InputText v-model="form.tags" placeholder="e.g. cbt, anxiety, breathing" class="wfull" />
        </div>
        <div class="grid-span2">
          <label class="lbl">Content</label>
          <Textarea v-model="form.content" rows="5" class="wfull" autoResize />
        </div>
        <div class="dlg-actions">
          <Button label="Cancel" severity="secondary" @click="composerVisible = false" />
          <Button label="Post" icon="pi pi-check" @click="submitPost" />
        </div>
      </div>
    </Dialog>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { store } from '@/store'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import { runValidators, required, minLen, maxLen } from '@/utils/validators'
import { sanitizeText } from '@/utils/sanitize'

const toast = useToast()
const isAdmin = computed(() => store.can('post:moderate'))

/* filter */
const globalFilter = ref('')
const categoryFilter = ref(null)
const categoryOptions = [
  { label: 'All', value: null },
  { label: 'Share & Encouragement', value: 'share' },
  { label: 'Help & Advice', value: 'help' },
  { label: 'Learning Resources', value: 'learn' }
]
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  title: { value: null, matchMode: 'contains' },
  category: { value: null, matchMode: 'contains' },
  tagsStr: { value: null, matchMode: 'contains' }
})
watch(globalFilter, v => { filters.value.global.value = v || null })
watch(categoryFilter, v => { filters.value.category.value = v || null })

const tableRows = computed(() => {
  return (store.forumPosts.value || []).map(p => ({
    ...p,
    tagsStr: (p.tags || []).join(', ')
  }))
})

function statusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'open': return 'success'
    case 'flagged': return 'warn'
    case 'closed': return 'danger'
    default: return 'info'
  }
}
function formatDate(ts) {
  try { return new Date(ts).toLocaleString() } catch { return '-' }
}

const selectedRows = ref([])

const composerVisible = ref(false)
const form = reactive({ title: '', category: null, tags: '', content: '' })

function openComposer() {
  if (!store.isLoggedIn.value || !store.can('post:create')) {
    toast.add({
      severity: 'info',
      summary: 'Sign in required',
      detail: 'Guest mode is read-only.',
      life: 2200
    })
    return
  }
  composerVisible.value = true
}

function submitPost() {
  const errTitle = runValidators(form.title, [required, minLen(5), maxLen(120)])
  const errCategory = runValidators(form.category, [required])
  const errContent = runValidators(form.content, [required, minLen(10)])
  if (errTitle !== true)   return toast.add({ severity: 'warn', summary: 'Title',    detail: errTitle,   life: 2200 })
  if (errCategory !== true) return toast.add({ severity: 'warn', summary: 'Category', detail: errCategory, life: 2200 })
  if (errContent !== true) return toast.add({ severity: 'warn', summary: 'Content',  detail: errContent, life: 2200 })

  const cleanTitle = sanitizeText(form.title)
  const cleanContent = sanitizeText(form.content)
  const cleanTags = (form.tags || '').split(',').map(t => sanitizeText(t)).filter(Boolean)

  const now = Date.now()
  const newPost = {
    id: 'p_' + now,
    authorId: store.currentUser.value?.uid,
    author: store.currentUser.value?.displayName || 'User',
    title: cleanTitle,
    category: form.category,
    tags: cleanTags,
    content: cleanContent,
    createdAt: now,
    status: 'open'
  }
  store.forumPosts.value = [newPost, ...(store.forumPosts.value || [])]
  toast.add({ severity: 'success', summary: 'Posted', life: 1600 })
  composerVisible.value = false
  Object.assign(form, { title: '', category: null, tags: '', content: '' })
}

function editPost() {
  toast.add({ severity: 'info', summary: 'Edit coming soon', life: 1500 })
}
async function reportPost(row) {
  await fetch('/api/flag-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: row.id, reason: 'user-report' })
  }).catch(() => {})
  row.status = 'flagged'
  toast.add({ severity: 'warn', summary: 'Reported', detail: 'Thanks for helping keep the community safe.', life: 1800 })
}
async function reportSelected() {
  for (const r of selectedRows.value) await reportPost(r)
  selectedRows.value = []
}
function closePost(row) {
  if (!isAdmin.value) return
  row.status = 'closed'
  toast.add({ severity: 'info', summary: 'Closed', detail: 'Post closed by admin.', life: 1800 })
}
function deletePost(row) {
  if (!isAdmin.value) return
  store.forumPosts.value = (store.forumPosts.value || []).filter(p => p.id !== row.id)
  toast.add({ severity: 'success', summary: 'Deleted', detail: 'Post deleted permanently.', life: 1800 })
}
</script>

<style scoped>
.wrap{ max-width: 1100px; margin: 0 auto; padding: 24px 16px 40px; }
.head{ display:flex; align-items:center; justify-content:space-between; gap: 12px; }
.head h1{ margin:0; color:#135; font-size: 24px; }
.head__actions{ display:flex; gap:8px; }
.muted{ color:#667; margin: 6px 0 14px; }

.card-panel{ box-shadow:0 6px 20px rgba(0,0,0,.06); border-radius:14px; }

.filters{ display:grid; grid-template-columns: 1fr 220px; gap:12px; margin-bottom:10px; }
.lbl{ display:block; font-size:13px; color:#345; margin-bottom:4px; }
.wfull{ width:100%; }
.w220{ width: 220px; }

.datatable{ font-size: 14px; }
.row-actions{ display:flex; gap:6px; }

.empty{ text-align:center; padding: 22px 10px; color:#456; }
.empty__title{ font-weight:600; margin-bottom:4px; }
.empty__sub{ font-size: 14px; opacity:.85; margin-bottom: 10px; }

.dlg-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.grid-span2{ grid-column: span 2; }
.dlg-actions{ grid-column: span 2; display:flex; justify-content:flex-end; gap:8px; }

@media (max-width:700px){
  .filters{ grid-template-columns:1fr; } .w220{ width:auto; }
  .dlg-grid{ grid-template-columns:1fr; }
  .grid-span2, .dlg-actions{ grid-column: 1; }
}
</style>
