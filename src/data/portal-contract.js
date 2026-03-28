export const contentKinds = {
  article: 'article',
  ai: 'ai',
  life: 'life'
}

export const portalResourceSchema = {
  id: 'number',
  kind: 'article | ai | life',
  title: 'string?',
  name: 'string?',
  excerpt: 'string?',
  desc: 'string?',
  category: 'string?',
  type: 'string?',
  owner: 'string?',
  meta: 'string?',
  date: 'YYYY-MM-DD?',
  tags: 'string[]?'
}

export const portalQuerySchema = {
  keyword: 'string?',
  type: 'article | ai | life ?',
  tag: 'string?',
  page: 'number?',
  size: 'number?'
}

export const springBootContractSuggestion = {
  responseEnvelope: {
    code: 0,
    message: 'success',
    data: {}
  },
  pageableEnvelope: {
    records: [],
    total: 0,
    page: 1,
    size: 10
  }
}
