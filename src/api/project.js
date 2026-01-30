// src/api/project.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://101.42.236.45:8089/api',
  timeout: 10000
})

// 获取分类
export const getCategories = () =>
  api.get('/projects/categories').then(res => res.data)

// 获取项目列表
export const getProjects = (category) =>
  api.get('/projects', { params: { category } }).then(res => res.data)

// ✅ 统一使用 POST，由后端根据 project.id 判断新增/更新
export const saveProject = (project) =>
  api.post('/projects', project) // 不再判断 id，全部 POST

// 删除项目
export const deleteProject = (id) =>
  api.delete(`/projects/ $ {id}`)
