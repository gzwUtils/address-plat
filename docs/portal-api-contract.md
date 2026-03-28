# 门户统一内容接口契约

适用范围：
- 项目门户首页总览
- 资源广场统一检索
- AI 资产中心
- 标签统计与推荐

目标：
- 在现有 Java 架构上扩展，不推翻现有项目接口
- 为 Spring Boot 提供一组稳定、可演进的 RESTful 接口
- 前端允许在接口未就绪时使用本地兜底数据

## 统一响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

分页列表建议：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "records": [],
    "total": 0,
    "page": 1,
    "size": 10
  }
}
```

## 1. 门户总览

`GET /api/portal/overview`

返回：
- `metrics`: 首页指标卡
- `todayFocus`: 今日焦点
- `signalCards`: 内容能力卡片
- `contentScopes`: 门户内容域
- `aiCapabilities`: AI 能力建议
- `aiScenes`: 场景推荐
- `warmPills`: 生活化标签

## 2. 统一内容资源

`GET /api/content/resources`

查询参数：
- `keyword`: 关键词
- `type`: `article | ai | life`
- `tag`: 标签
- `page`: 页码
- `size`: 页大小

单条资源结构建议：

```json
{
  "id": 1,
  "kind": "article",
  "title": "订单中心迁移复盘",
  "excerpt": "记录从单体迁移到分层服务后的流量切换",
  "category": "项目复盘",
  "date": "2026-03-22",
  "tags": ["订单", "迁移", "灰度"]
}
```

AI 资产示例：

```json
{
  "id": 11,
  "kind": "ai",
  "type": "Agent",
  "name": "研发发布助手",
  "owner": "DevOps Team",
  "desc": "用于生成发布检查单、回滚建议和变更摘要",
  "tags": ["发布", "变更", "自动摘要"]
}
```

## 3. 标签统计

`GET /api/content/tags`

返回示例：

```json
[
  { "name": "项目复盘", "count": 3 },
  { "name": "Agent", "count": 4 },
  { "name": "公告", "count": 2 }
]
```

## 4. AI 资产列表

`GET /api/ai-assets`

查询参数：
- `type`: `Agent | Skill | MCP | OpenClaw`
- `owner`: 维护团队
- `status`: 状态，例如 `online | offline | draft`

建议补充字段：
- `status`
- `version`
- `updatedAt`
- `entryUrl`
- `capabilities`

## Java 端落地建议

- Controller 层按资源划分：
  - `PortalController`
  - `ContentResourceController`
  - `AiAssetController`
- DTO 与现有项目接口分离，避免影响原 `/projects` 能力
- 统一使用分页响应包装大列表接口
- 标签统计可从文章表、AI 资产表和生活内容表聚合生成
- 如果短期没有独立表，可以先从配置表或 JSON 配置落地
