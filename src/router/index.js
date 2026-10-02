import { createRouter, createWebHistory } from 'vue-router'
import { adminMe } from '@/api/community'

const LayoutView = () => import('../views/LayoutView.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const ProjectsView = () => import('../views/ProjectsView.vue')
const ProjectGalleryView = () => import('../views/ProjectGalleryView.vue')
const ReadingView = () => import('../views/ReadingView.vue')
const AiAssetsView = () => import('../views/AiAssetsView.vue')
const ContentStudioView = () => import('../views/ContentStudioView.vue')
const ProjectStudioView = () => import('../views/ProjectStudioView.vue')
const OpsWorkbenchView = () => import('../views/OpsWorkbenchView.vue')
const ResourceDetailView = () => import('../views/ResourceDetailView.vue')
const ProjectDetailView = () => import('../views/ProjectDetailView.vue')
const GrowthCapsuleView = () => import('../views/GrowthCapsuleView.vue')
const CommunityHomeView = () => import('../views/CommunityHomeView.vue')
const CommunityBoardView = () => import('../views/CommunityBoardView.vue')
const CommunityTopicView = () => import('../views/CommunityTopicView.vue')
const MyDiscussionsView = () => import('../views/MyDiscussionsView.vue')
const AdminSignInView = () => import('../views/AdminSignInView.vue')
const CommunityReportsView = () => import('../views/CommunityReportsView.vue')

const routes = [
  {
    path: '/',
    component: LayoutView,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView
      },
      {
        path: 'explore',
        name: 'explore',
        component: ProjectsView
      },
      {
        path: 'projects',
        name: 'projects',
        component: ProjectGalleryView
      },
      {
        path: 'reading',
        name: 'reading',
        component: ReadingView
      },
      {
        path: 'explore/:kind/:id',
        name: 'resource-detail',
        component: ResourceDetailView
      },
      {
        path: 'project/:id',
        name: 'project-detail',
        component: ProjectDetailView
      },
      {
        path: 'ai-workspace',
        name: 'ai-workspace',
        meta: { admin: true },
        component: AiAssetsView
      },
      {
        path: 'content-studio',
        name: 'content-studio',
        meta: { admin: true },
        component: ContentStudioView
      },
      {
        path: 'project-studio',
        name: 'project-studio',
        component: ProjectStudioView
      },
      {
        path: 'ops-workbench',
        name: 'ops-workbench',
        meta: { admin: true },
        component: OpsWorkbenchView
      },
      {
        path: 'growth-capsule',
        name: 'growth-capsule',
        component: GrowthCapsuleView
      },
      {
        path: 'community',
        name: 'community',
        component: CommunityHomeView
      },
      {
        path: 'community/boards/:code',
        name: 'community-board',
        component: CommunityBoardView
      },
      {
        path: 'community/topics/:id',
        name: 'community-topic',
        component: CommunityTopicView
      },
      {
        path: 'community/mine',
        name: 'my-discussions',
        component: MyDiscussionsView
      },
      {
        path: 'admin/sign-in',
        name: 'admin-sign-in',
        component: AdminSignInView
      },
      {
        path: 'admin/community/reports',
        name: 'admin-community-reports',
        meta: { admin: true },
        component: CommunityReportsView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 95, behavior: 'smooth' }
    return { left: 0, top: 0 }
  }
})

router.beforeEach(async (to) => {
  if (to.path === '/explore' && ['project', 'article'].includes(to.query.type)) {
    const destination = to.query.type === 'project' ? '/projects' : '/reading'
    const query = { ...to.query }
    delete query.type
    if (destination === '/reading') delete query.category
    return { path: destination, query, replace: true }
  }
  if (!to.meta.admin) return true
  try {
    await adminMe()
    return true
  } catch {
    return { path: '/admin/sign-in', query: { next: to.fullPath } }
  }
})

export default router
