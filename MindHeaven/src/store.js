import { ref, watchEffect } from 'vue'

/* -------------------- 小工具 -------------------- */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

/* -------------------- 基础状态 -------------------- */
const currentPage  = ref('home')      // 'home' | 'forum' | 'mood-tracker' | 'resources'
const isLoggedIn   = ref(false)
const currentUser  = ref(null)        // { uid, displayName, email }
const alerts       = ref([])          // [{id, message, type}]

/* -------------------- 业务数据 -------------------- */
// Mood 记录：默认空
const moodEntries  = ref(load('moodEntries', []))

// Forum 帖子（与 ForumView 字段对齐）
const forumPosts   = ref(load('forumPosts', [
  {
    id: 'p_1724300000001',
    authorId: 'seed_u1',
    author: 'Alex',
    title: 'How do you cope with exam stress?',
    category: 'share',
    tags: ['exam', 'stress', 'tips'],
    content: 'Sharing my routine: short walks + breathing + 25-min focus blocks.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    status: 'open'
  },
  {
    id: 'p_1724300000002',
    authorId: 'seed_u2',
    author: 'Bianca',
    title: 'Any advice for sudden anxiety before presentations?',
    category: 'help',
    tags: ['anxiety', 'presentation', 'cbt'],
    content: 'Looking for quick grounding techniques that work in 1–2 minutes.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    status: 'open'
  },
  {
    id: 'p_1724300000003',
    authorId: 'seed_u3',
    author: 'Chen',
    title: 'CBT worksheet that actually helped me',
    category: 'learn',
    tags: ['cbt', 'worksheet', 'resource'],
    content: 'I found a simple thought record that makes reframing easier. Happy to share how I fill it.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    status: 'open'
  },
  {
    id: 'p_1724300000004',
    authorId: 'seed_u4',
    author: 'Dina',
    title: 'Does journaling improve your mood over time?',
    category: 'share',
    tags: ['journaling', 'habits'],
    content: 'Two weeks in, I can see patterns. Curious if others felt similar progress.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    status: 'open'
  },
  {
    id: 'p_1724300000005',
    authorId: 'seed_u5',
    author: 'Ethan',
    title: 'Breathing apps vs. simple timer?',
    category: 'help',
    tags: ['breathing', 'apps', 'timer'],
    content: 'Do you prefer guided apps or just a timer with box breathing?',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
    status: 'flagged'
  },
  {
    id: 'p_1724300000006',
    authorId: 'seed_u6',
    author: 'Farah',
    title: 'My self-care checklist after long days',
    category: 'share',
    tags: ['selfcare', 'routine', 'sleep'],
    content: 'Hydration, 10-min stretch, light dinner, and a short gratitude note.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    status: 'open'
  },
  {
    id: 'p_1724300000007',
    authorId: 'seed_u2',
    author: 'Bianca',
    title: 'Learning resource: grounding 5-4-3-2-1',
    category: 'learn',
    tags: ['grounding', 'panic', 'howto'],
    content: 'This method helps me redirect attention during spikes. Here’s how I apply it.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    status: 'open'
  },
  {
    id: 'p_1724300000008',
    authorId: 'seed_u3',
    author: 'Chen',
    title: 'Closed: duplicate post test',
    category: 'learn',
    tags: ['moderation'],
    content: 'Demo post to show admin “close” action.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    status: 'closed'
  }
]))

// Resources 初始（先给 6 条，后面自动补种到 30 条）
const resources    = ref(load('resources', [
  { id: 3001, title: 'Coping with Exam Stress',        description: 'Practical strategies to manage stress during exam periods.',                             type: 'article', date: '2025-07-10', rating: 4.5, ratingCount: 4, views: 12 },
  { id: 3002, title: 'Guided Meditation for Anxiety',  description: 'A 10-minute guided meditation video to help reduce anxiety.',                          type: 'video',   date: '2025-07-12', rating: 4.8, ratingCount: 6, views: 20 },
  { id: 3003, title: '24/7 Support Hotline',           description: 'Contact our support hotline for immediate help.',                                      type: 'contact', date: '2025-07-01', rating: 5.0, ratingCount: 2, views:  8 },
  { id: 3004, title: 'Mindful Breathing Exercises',    description: 'Step-by-step guide to practice mindful breathing in 5 minutes.',                       type: 'article', date: '2025-07-16', rating: 4.7, ratingCount: 5, views: 14 },
  { id: 3005, title: 'Study Break Stretch Routine',    description: 'Short video: 6 simple stretches to release neck and shoulder tension during study.',   type: 'video',   date: '2025-07-18', rating: 4.6, ratingCount: 3, views: 11 },
  { id: 3006, title: 'Campus Counseling Contact',      description: 'Book an appointment with campus counseling (Mon–Fri 9:00–17:00).',                     type: 'contact', date: '2025-07-20', rating: 4.9, ratingCount: 7, views: 22 }
]))

/* ---------- 论坛旧数据迁移（把 content/date 映射到新结构） ---------- */
;(function migrateForumPostsIfNeeded() {
  try {
    const list = forumPosts.value || []
    let changed = false

    const norm = list.map((p, idx) => {
      if (p.title && p.createdAt) return p   // 已是新结构
      changed = true

      const title = p.title || (p.content ? String(p.content).slice(0, 60) : 'Post')
      const createdAt = p.createdAt
        ? Number(p.createdAt)
        : (p.date ? Date.parse(p.date) : Date.now() - (idx + 1) * 1000)

      return {
        id: String(p.id ?? ('p_' + createdAt + '_' + idx)),
        authorId: p.userId ? String(p.userId) : (p.authorId || 'seed_legacy'),
        author: p.author || 'User',
        title,
        category: (p.category && ['share','help','learn'].includes(p.category)) ? p.category
                 : (p.category === 'students' ? 'share'
                 : (p.category === 'anxiety'  ? 'help'  : 'learn')),
        tags: Array.isArray(p.tags) ? p.tags : [],
        content: p.content || '',
        createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
        status: p.status || 'open'
      }
    })

    if (changed) forumPosts.value = norm
  } catch (e) { console.warn('forumPosts migration skipped:', e) }
})()

/* ---------- 资源自动补种到 30 条 ---------- */
;(function ensureSeedResources() {
  try {
    const desired = [
      // 3001~3006 已在上面 fallback；这里从 3007 开始到 3030
      { id: 3007, title: 'Progressive Muscle Relaxation', description: 'Guide to relax muscle groups to reduce tension.', type: 'article', date: '2025-07-21', rating: 4.4, ratingCount: 4, views: 10 },
      { id: 3008, title: 'Sleep Hygiene Checklist', description: 'Simple nightly checklist to improve sleep quality.', type: 'article', date: '2025-07-22', rating: 4.6, ratingCount: 3, views: 12 },
      { id: 3009, title: 'Body Scan Meditation (10 min)', description: 'Video guide to scan & relax the body from head to toe.', type: 'video', date: '2025-07-22', rating: 4.8, ratingCount: 6, views: 18 },
      { id: 3010, title: 'Grounding Techniques 5-4-3-2-1', description: 'Article: Use your senses to anchor in the present moment.', type: 'article', date: '2025-07-23', rating: 4.7, ratingCount: 7, views: 19 },
      { id: 3011, title: 'Breathing: Box Method (4-4-4-4)', description: 'Video walkthrough for box breathing to calm nerves.', type: 'video', date: '2025-07-23', rating: 4.6, ratingCount: 5, views: 16 },
      { id: 3012, title: 'Study Planner Template', description: 'Printable weekly planner to balance study & rest.', type: 'article', date: '2025-07-24', rating: 4.3, ratingCount: 4, views: 13 },
      { id: 3013, title: 'Crisis Lines by Region', description: 'Important contact numbers for immediate help in your region.', type: 'contact', date: '2025-07-24', rating: 5.0, ratingCount: 3, views: 9 },
      { id: 3014, title: 'Mindfulness for Beginners', description: 'Article: start a 5-minute daily mindfulness routine.', type: 'article', date: '2025-07-25', rating: 4.5, ratingCount: 8, views: 21 },
      { id: 3015, title: 'Yoga Flow: Relax Your Back', description: 'Short follow-along video to release lower back tension.', type: 'video', date: '2025-07-25', rating: 4.7, ratingCount: 6, views: 17 },
      { id: 3016, title: 'Campus Wellbeing Email', description: 'Contact wellbeing office for workshops and counseling.', type: 'contact', date: '2025-07-26', rating: 4.9, ratingCount: 4, views: 10 },
      { id: 3017, title: 'Anxiety Triggers Worksheet', description: 'Identify common triggers and plan your coping responses.', type: 'article', date: '2025-07-26', rating: 4.4, ratingCount: 5, views: 12 },
      { id: 3018, title: 'Box Breathing Timer (Video)', description: 'Visual timer for practicing 4-4-4-4 breathing.', type: 'video', date: '2025-07-27', rating: 4.6, ratingCount: 5, views: 14 },
      { id: 3019, title: 'Emergency Services (Local)', description: 'Phone numbers and addresses for local emergency units.', type: 'contact', date: '2025-07-27', rating: 5.0, ratingCount: 2, views: 7 },
      { id: 3020, title: 'Self-Compassion 101', description: 'Article: Be kinder to yourself during setbacks.', type: 'article', date: '2025-07-28', rating: 4.5, ratingCount: 6, views: 15 },
      { id: 3021, title: '5-Minute Stretch for Desk Workers', description: 'Video: counteract long sitting with simple moves.', type: 'video', date: '2025-07-28', rating: 4.7, ratingCount: 7, views: 18 },
      { id: 3022, title: 'After-Hours Support Contact', description: 'Contact when services are closed; response next business day.', type: 'contact', date: '2025-07-29', rating: 4.8, ratingCount: 3, views: 8 },
      { id: 3023, title: 'Digital Detox Starter', description: 'Tips to reduce doomscrolling and improve focus.', type: 'article', date: '2025-07-30', rating: 4.2, ratingCount: 5, views: 11 },
      { id: 3024, title: 'Breath & Posture for Calm', description: 'Video: align posture and deepen breaths to calm quickly.', type: 'video', date: '2025-07-30', rating: 4.6, ratingCount: 4, views: 13 },
      { id: 3025, title: 'Student Services Contact', description: 'Ask about disability support, extensions, special consider.', type: 'contact', date: '2025-07-31', rating: 4.9, ratingCount: 5, views: 12 },
      { id: 3026, title: 'Journaling Prompts (7-day)', description: 'Seven prompts to reflect on mood and energy.', type: 'article', date: '2025-08-01', rating: 4.4, ratingCount: 6, views: 12 },
      { id: 3027, title: 'Calming Music Playlist', description: 'Video: curated playlist with gentle ambient tracks.', type: 'video', date: '2025-08-01', rating: 4.7, ratingCount: 8, views: 23 },
      { id: 3028, title: 'Community Support Email', description: 'Reach out to peer support group facilitators.', type: 'contact', date: '2025-08-02', rating: 4.8, ratingCount: 4, views: 9 },
      { id: 3029, title: 'Focus Reset: Pomodoro Guide', description: 'Article: how to use Pomodoro without burnout.', type: 'article', date: '2025-08-03', rating: 4.3, ratingCount: 5, views: 10 },
      { id: 3030, title: 'Guided Mindfulness Walk', description: 'Video: mindful walking to ground your senses outdoors.', type: 'video', date: '2025-08-03', rating: 4.7, ratingCount: 7, views: 19 }
    ]

    const existing = resources.value || []
    const have = new Set(existing.map(x => x.id))
    const extra = desired.filter(x => !have.has(x.id))
    if (extra.length) {
      resources.value = [...existing, ...extra]
    }
    // 若仍不足 30（例如本地只保留了很少条），再把 3001~3006 也纳入去重合集
    if (resources.value.length < 30) {
      const allDesired = [
        ...desired,
        { id: 3001, title: 'Coping with Exam Stress',        description: 'Practical strategies to manage stress during exam periods.',                             type: 'article', date: '2025-07-10', rating: 4.5, ratingCount: 4, views: 12 },
        { id: 3002, title: 'Guided Meditation for Anxiety',  description: 'A 10-minute guided meditation video to help reduce anxiety.',                          type: 'video',   date: '2025-07-12', rating: 4.8, ratingCount: 6, views: 20 },
        { id: 3003, title: '24/7 Support Hotline',           description: 'Contact our support hotline for immediate help.',                                      type: 'contact', date: '2025-07-01', rating: 5.0, ratingCount: 2, views:  8 },
        { id: 3004, title: 'Mindful Breathing Exercises',    description: 'Step-by-step guide to practice mindful breathing in 5 minutes.',                       type: 'article', date: '2025-07-16', rating: 4.7, ratingCount: 5, views: 14 },
        { id: 3005, title: 'Study Break Stretch Routine',    description: 'Short video: 6 simple stretches to release neck and shoulder tension during study.',   type: 'video',   date: '2025-07-18', rating: 4.6, ratingCount: 3, views: 11 },
        { id: 3006, title: 'Campus Counseling Contact',      description: 'Book an appointment with campus counseling (Mon–Fri 9:00–17:00).',                     type: 'contact', date: '2025-07-20', rating: 4.9, ratingCount: 7, views: 22 }
      ]
      const have2 = new Set(resources.value.map(x => x.id))
      const extra2 = allDesired.filter(x => !have2.has(x.id))
      if (extra2.length) resources.value = [...resources.value, ...extra2]
    }
  } catch {}
})()

/* -------------------- 角色与权限（C.2） -------------------- */
const currentRole = ref('guest')                 // 'guest' | 'user' | 'admin'
const roleMap     = ref(load('roleMap', {}))     // { [uid]: 'user'|'admin' }

function setRole(uid, role) {
  if (!uid) return
  roleMap.value[uid] = role
  save('roleMap', roleMap.value)
  if (currentUser.value?.uid === uid) currentRole.value = role
}

function resolveRoleFor(user) {
  if (!user?.uid) return 'guest'
  const saved = roleMap.value[user.uid]
  if (saved) return saved
  const isSchool = (user.email || '').toLowerCase().endsWith('@monash.edu')
  const role = isSchool ? 'admin' : 'user'
  setRole(user.uid, role)
  return role
}

function hasRole(role) {
  const order = { guest:0, user:1, admin:2 }
  return order[currentRole.value] >= order[role]
}
function can(action) {
  const policy = {
    'post:create': 'user',
    'post:flag': 'user',
    'post:moderate': 'admin',
  }
  return hasRole(policy[action] || 'user')
}

/* -------------------- 全局提示 -------------------- */
function showAlert(message, type = 'info') {
  const item = { id: Date.now() + Math.random(), message, type }
  alerts.value.push(item)
  setTimeout(() => removeAlert(item.id), 3500)
}
function removeAlert(id) {
  const i = alerts.value.findIndex(a => a.id === id)
  if (i > -1) alerts.value.splice(i, 1)
}

/* -------------------- 导航（白名单） -------------------- */
const allowedPages = new Set(['home', 'forum', 'mood-tracker', 'resources'])
function navigate(page) {
  currentPage.value = allowedPages.has(page) ? page : 'home'
}

/* -------------------- 登出（UI 收尾） -------------------- */
function logout() {
  isLoggedIn.value = false
  currentUser.value = null
  currentRole.value = 'guest'
  currentPage.value = 'home'
  showAlert('You have been logged out.', 'info')
}

/* -------------------- 持久化 -------------------- */
watchEffect(() => { save('moodEntries', moodEntries.value) })
watchEffect(() => { save('forumPosts', forumPosts.value)   })
watchEffect(() => { save('resources', resources.value)     })
// watchEffect(() => { save('roleMap', roleMap.value) }) // setRole 时已保存

/* -------------------- 导出 -------------------- */
export const store = {
  // state
  currentPage,
  isLoggedIn,
  currentUser,
  alerts,
  moodEntries,
  forumPosts,
  resources,

  // roles
  currentRole,
  roleMap,
  setRole,
  resolveRoleFor,
  hasRole,
  can,

  // methods
  showAlert,
  removeAlert,
  navigate,
  logout
}
if (typeof window !== 'undefined') {
  window.store = store
};
(function ensureSeedPosts() {
  try {
    const desired = [
      {
        id: 'p_seed1',
        authorId: 'seed_u1',
        author: 'Alex',
        title: 'How do you cope with exam stress?',
        category: 'share',
        tags: ['exam', 'stress', 'tips'],
        content: 'Sharing my routine: short walks + breathing + 25-min focus blocks.',
        createdAt: Date.now() - 86400000 * 2,
        status: 'open'
      },
      {
        id: 'p_seed2',
        authorId: 'seed_u2',
        author: 'Bianca',
        title: 'Any advice for sudden anxiety before presentations?',
        category: 'help',
        tags: ['anxiety', 'presentation', 'cbt'],
        content: 'Looking for quick grounding techniques that work in 1–2 minutes.',
        createdAt: Date.now() - 86400000 * 3,
        status: 'open'
      },
      // ...其余 6 条，和之前 seed 相同
    ]
    const existing = forumPosts.value || []
    if (existing.length < 5) {
      const have = new Set(existing.map(x => x.id))
      const extra = desired.filter(p => !have.has(p.id))
      if (extra.length) forumPosts.value = [...existing, ...extra]
    }
  } catch {}
})()
