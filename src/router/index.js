import { createRouter, createWebHistory } from 'vue-router'

const LayoutView = () => import('../views/LayoutView.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const ProjectsView = () => import('../views/ProjectsView.vue')
const AiAssetsView = () => import('../views/AiAssetsView.vue')
const ContentStudioView = () => import('../views/ContentStudioView.vue')
const ProjectStudioView = () => import('../views/ProjectStudioView.vue')
const OpsWorkbenchView = () => import('../views/OpsWorkbenchView.vue')
const ResourceDetailView = () => import('../views/ResourceDetailView.vue')
const ProjectDetailView = () => import('../views/ProjectDetailView.vue')
const GrowthCapsuleView = () => import('../views/GrowthCapsuleView.vue')

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
        component: AiAssetsView
      },
      {
        path: 'content-studio',
        name: 'content-studio',
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
        component: OpsWorkbenchView
      },
      {
        path: 'growth-capsule',
        name: 'growth-capsule',
        component: GrowthCapsuleView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
