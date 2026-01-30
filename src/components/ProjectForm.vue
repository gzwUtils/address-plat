<!-- src/components/ProjectForm.vue -->
<template>
  <el-dialog
    :title="project.id ? '编辑项目' : '新增项目'"
    v-model="visible"
    width="500px"
    @closed=" $emit('update:modelValue', false)"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="平台名称" prop="projectName">
        <el-input v-model="formData.projectName" placeholder="例如：订单中心" />
      </el-form-item>

      <el-form-item label="名称简写" prop="shortName">
        <el-input v-model="formData.shortName" placeholder="例如：Order" maxlength="20" />
      </el-form-item>

      <el-form-item label="访问地址" prop="platformUrl">
        <el-input v-model="formData.platformUrl" placeholder="https://example.com" />
      </el-form-item>

      <el-form-item label="背景图URL" prop="backgroundImage">
        <el-input
          v-model="formData.backgroundImage"
          placeholder="可选，图片直链"
          clearable
        />
        <div class="tip-text">输入新名称可创建新分类</div>
      </el-form-item>

      <el-form-item label="项目类别" prop="category">
        <el-select
          v-model="formData.category"
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入新分类"
          style="width: 100%"
        >
          <el-option
            v-for="cat in existingCategories"
            :key="cat"
            :label="cat"
            :value="cat"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="归属类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio label="项目">项目</el-radio>
          <el-radio label="研发">研发</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="可选"
          :rows="2"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { saveProject } from '@/api/project'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  project: {
    type: Object,
    default: () => ({})
  },
  existingCategories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = ref(false)
const submitting = ref(false)
const formData = ref({})

const rules = {
  projectName: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
  shortName: [{ required: true, message: '请输入名称简写', trigger: 'blur' }],
  platformUrl: [
    { required: true, message: '请输入访问地址', trigger: 'blur' },
    { type: 'url', message: '请输入合法 URL', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择或输入分类', trigger: 'change' }]
}

const formRef = ref()

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      // 初始化表单数据
      formData.value = {
        id: props.project.id || undefined,
        projectName: props.project.projectName || '',
        shortName: props.project.shortName || '',
        platformUrl: props.project.platformUrl || '',
        backgroundImage: props.project.backgroundImage || '',
        category: props.project.category || '默认',
        type: props.project.type || '项目',
        description: props.project.description || ''
      }
    }
  }
)

const submitForm = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    await saveProject(formData.value)
    ElMessage.success('保存成功')
    emit('saved')
    visible.value = false
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.tip-text {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
