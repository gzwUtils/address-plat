export const dashboardOverview = {
  metrics: [
    { value: '4', label: '内容域' },
    { value: '6', label: 'AI 模块建议' },
    { value: '24h', label: '门户可视状态' }
  ],
  todayFocus: [
    '统一项目与知识检索入口',
    '支持 AI Agent / Skill / MCP 资产目录',
    '在门户视觉中加入科技感与生活感的平衡'
  ],
  signalCards: [
    { kicker: 'Projects', title: '服务入口聚合', desc: '保留原项目地址聚合能力，并提升浏览体验。', path: '/explore' },
    { kicker: 'Knowledge', title: '笔记文章标签化', desc: '扩展技术文章、复盘、经验卡片与日常记录。', path: '/explore/article/1' },
    { kicker: 'AI Hub', title: 'AI 资产中心', desc: '为智能体、Skill、MCP、OpenClaw 建立统一展示区。', path: '/explore/ai/1' },
    { kicker: 'Life', title: '团队生活流', desc: '公告、灵感和轻内容增强门户的人味。', path: '/explore/life/1' }
  ],
  contentScopes: [
    { icon: '01', title: '项目导航', desc: '保留按分类访问系统、平台、工具的现有主链路。', path: '/explore' },
    { icon: '02', title: '笔记文章', desc: '技术分享、故障记录、项目复盘、最佳实践统一管理。', path: '/explore/article/1' },
    { icon: '03', title: 'AI 资产', desc: 'Agent、Prompt、Skill、MCP 连接器、工作流模板。', path: '/explore/ai/1' },
    { icon: '04', title: '生活空间', desc: '公告、团队日历、城市天气、灵感短句、活动记录。', path: '/explore/life/1' }
  ],
  aiCapabilities: [
    {
      type: 'Agent',
      title: '智能助手目录',
      desc: '收录运维助手、研发 Copilot、文档助手、发布助手，并展示可用能力与入口。',
      tags: ['角色编排', '入口卡片', '权限分层'],
      path: '/explore/ai/1'
    },
    {
      type: 'Skill',
      title: 'Skill 能力市场',
      desc: '把常用技能包做成标签化资源，支持适用场景、版本、维护人展示。',
      tags: ['可检索', '版本提示', '团队共享'],
      path: '/explore/ai/2'
    },
    {
      type: 'MCP',
      title: 'MCP 服务面板',
      desc: '展示已接入的工具服务、连接状态、可访问资源和推荐调用方式。',
      tags: ['服务状态', '资源说明', '接入指引'],
      path: '/explore/ai/3'
    },
    {
      type: 'Workflow',
      title: 'OpenClaw 编排建议',
      desc: '为代码审查、日报生成、故障排查等流程预置工作流模板。',
      tags: ['模板中心', '可复制流程', '协作复用'],
      path: '/explore/ai/4'
    },
    {
      type: 'Search',
      title: '智能检索与问答',
      desc: '在门户里按项目、文章、标签、AI 资产做统一检索，并预留问答入口。',
      tags: ['统一搜索', '知识问答', '相关推荐'],
      path: '/explore'
    },
    {
      type: 'Insight',
      title: '使用趋势洞察',
      desc: '统计热门项目、热门文章、常用智能体和资源调用热度。',
      tags: ['热度排行', '活跃趋势', '内容优化'],
      path: '/ops-workbench'
    }
  ],
  aiScenes: [
    { name: '故障应急', desc: '通过 Agent + MCP 快速读取监控、日志和知识库建议。', path: '/explore/ai/3' },
    { name: '新人 onboarding', desc: '入口导航、岗位知识、常用 Skill、流程模板集中推荐。', path: '/explore' },
    { name: '需求评审', desc: '调用 AI 助手辅助整理上下文、接口影响面和测试要点。', path: '/explore/ai/2' },
    { name: '周报复盘', desc: '将项目动态、文章沉淀、团队事件汇总为门户周报。', path: '/explore/ai/4' }
  ],
  warmPills: ['今日纪念日', '城市天气', '午餐推荐', '值班提醒', '团队短文', '活动照片']
}

export const portalResources = {
  articles: [
    {
      id: 1,
      kind: 'article',
      title: '订单中心迁移复盘',
      excerpt: '记录从单体迁移到分层服务后的流量切换、灰度策略与故障回收方式。',
      category: '项目复盘',
      author: '高致维',
      date: '2026-03-22',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      tags: ['订单', '迁移', '灰度']
    },
    {
      id: 2,
      kind: 'article',
      title: 'Spring Boot 接口幂等设计笔记',
      excerpt: '梳理令牌、去重表和消息补偿三种常见幂等实现方式及适用边界。',
      category: '最佳实践',
      author: '架构组',
      date: '2026-03-18',
      coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
      tags: ['Java', 'Spring Boot', '幂等']
    },
    {
      id: 3,
      kind: 'article',
      title: '一次数据库热点行争用排查',
      excerpt: '从监控、慢 SQL、线程栈和业务重试策略四个维度拆解问题。',
      category: '故障记录',
      author: 'SRE 团队',
      date: '2026-03-11',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      tags: ['MySQL', '排障', '性能']
    }
  ],
  aiAssets: [
    {
      id: 1,
      kind: 'ai',
      type: 'Agent',
      name: '研发发布助手',
      owner: 'DevOps Team',
      status: 'online',
      version: 'v2.3.1',
      updatedAt: '2026-03-26',
      entryUrl: 'https://ai.example.com/release-assistant',
      desc: '用于生成发布检查单、回滚建议和变更摘要。',
      tags: ['发布', '变更', '自动摘要'],
      capabilities: ['发布摘要', '回滚检查', '风险提示']
    },
    {
      id: 2,
      kind: 'ai',
      type: 'Skill',
      name: '接口设计 Skill 包',
      owner: 'Architecture Group',
      status: 'online',
      version: 'v1.8.0',
      updatedAt: '2026-03-21',
      entryUrl: 'https://ai.example.com/skills/api-design',
      desc: '面向 RESTful 接口评审与字段规范的团队标准技能集。',
      tags: ['API', '评审', '标准化'],
      capabilities: ['字段评审', '接口规范', '错误码建议']
    },
    {
      id: 3,
      kind: 'ai',
      type: 'MCP',
      name: '日志检索连接器',
      owner: 'SRE Team',
      status: 'trial',
      version: 'v0.9.4',
      updatedAt: '2026-03-18',
      entryUrl: 'https://ai.example.com/mcp/logs',
      desc: '聚合日志、监控与知识库资源，为故障分析 Agent 提供上下文。',
      tags: ['日志', '监控', '上下文'],
      capabilities: ['日志聚合', '监控读取', '知识库检索']
    },
    {
      id: 4,
      kind: 'ai',
      type: 'OpenClaw',
      name: '周报编排流',
      owner: 'PMO',
      status: 'draft',
      version: 'v0.6.2',
      updatedAt: '2026-03-15',
      entryUrl: 'https://ai.example.com/workflows/weekly-report',
      desc: '自动拉取项目动态、合并知识沉淀和公告，生成周报初稿。',
      tags: ['编排', '周报', '自动化'],
      capabilities: ['信息汇总', '周报生成', '流程编排']
    }
  ],
  lifeFeeds: [
    {
      id: 1,
      kind: 'life',
      type: '公告',
      title: '本周五 18:30 团队夜跑',
      desc: '下班后从园区北门集合，欢迎研发、产品、测试一起参加。',
      meta: '生活社群'
    },
    {
      id: 2,
      kind: 'life',
      type: '提醒',
      title: '清明节前发布窗口收紧',
      desc: '核心系统发布需提前一天完成风险评估与值班确认。',
      meta: '运维规范'
    },
    {
      id: 3,
      kind: 'life',
      type: '灵感',
      title: '把门户做成团队数字杂志',
      desc: '除了效率，门户也应该记录团队故事、实践和真实的日常节奏。',
      meta: '设计建议'
    }
  ]
}
