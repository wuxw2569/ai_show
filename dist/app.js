const works = [
  { id: 'east-scroll', title: '画中人', line: '月夜，她从悬挂的画卷里探身而出。', mood: '东方', author: 'Larus Canus', image: './images/east-scroll.jpg', source: 'https://x.com/MrLarus/status/2058056539923968099' },
  { id: 'potala-blueprint', title: '布达拉宫·营造蓝图', line: '一座宫，连同它的每一根梁，从图纸上醒来。', mood: '壮观', author: 'Larus Canus', image: './images/potala-blueprint.jpg', source: 'https://x.com/MrLarus/status/2054493076618404090' },
  { id: 'zhugeliang-statue', title: '卧龙·生平立像', line: '一个人的一生，被压进一座可以阅读的碑。', mood: '壮观', author: 'Larus Canus', image: './images/zhugeliang-statue.jpg', source: 'https://x.com/MrLarus/status/2053121448500179018' },
  { id: 'felt-riverside', title: '毛毡上河图', line: '汴京被捏进了羊毛里，连市声都是软的。', mood: '壮观', author: '九尾狐-FoxFairy', image: './images/felt-riverside.jpg', source: 'https://x.com/Stellakjbk/status/2057805291824230543' },
  { id: 'china-map', title: '锦绣山河', line: '一省一景，把中国摊开成一张手绘的桌布。', mood: '壮观', author: 'Ryo', image: './images/china-map.jpg', source: 'https://x.com/siantgirl/status/2055163703763554665' },
  { id: 'huadian-makeup', title: '花钿点额', line: '花钿点在额上，朝代落在脸上。', mood: '东方', author: '李岳', image: './images/huadian-makeup.jpg', source: 'https://x.com/liyue_ai/status/2073027044451975627' },
  { id: 'mangzhong', title: '芒种·张家界', line: '云雾峰林之间，稻田刚刚醒来。', mood: '东方', author: '小小东', image: './images/mangzhong.jpg', source: 'https://x.com/xiaoxiaodong/status/2057847431552004243' },
  { id: 'lotus-leaf', title: '接天莲叶无穷碧', line: '八百年前的诗，长出了排版的骨骼。', mood: '设计', author: '小小东', image: './images/lotus-leaf.jpg', source: 'https://x.com/xiaoxiaodong/status/2058018197698416862' },
  { id: 'yarra-duo', title: '雅拉河·对照', line: '同一条河，黄昏与水彩各执一词。', mood: '治愈', author: 'Kimberly', image: './images/yarra-duo.jpg', source: 'https://x.com/king1818888/status/2094443914866597977' },
  { id: 'skeu-icons', title: '陶瓷与皮革', line: '图标不再是像素，是可以拿在手里的小物件。', mood: '治愈', author: '十里（玉伯荐）', image: './images/skeu-icons.jpg', source: 'https://x.com/lifesinger/status/2088226049071124487' }
]

const STORAGE_KEY = 'weijian-saved-v1'
const grid = document.querySelector('#artGrid')
const dialog = document.querySelector('#artDialog')
const submitDialog = document.querySelector('#submitDialog')
const savedCount = document.querySelector('#savedCount')
const toast = document.querySelector('#toast')
let activeWork = null
let saved = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

function visualMarkup(work, extra = '') {
  if (work.image) {
    return `<div class="visual ${extra}"><img class="visual-image" src="${work.image}" alt="作品《${work.title}》" loading="lazy" decoding="async" /></div>`
  }
  const portalBits = work.visual === 'visual-portals'
    ? '<span class="portal portal-a"></span><span class="portal portal-b"></span><span class="portal portal-c"></span><span class="wanderer"></span>'
    : ''
  return `<div class="visual ${work.visual} ${extra}" aria-hidden="true">${portalBits}</div>`
}

function renderWorks(filter = 'all') {
  grid.innerHTML = works.map((work, index) => `
    <article class="art-card ${saved.has(work.id) ? 'is-saved' : ''}" data-id="${work.id}" data-mood="${work.mood}" ${filter !== 'all' && filter !== work.mood ? 'hidden' : ''} tabindex="0" role="button" aria-label="打开作品：${work.title}">
      ${visualMarkup(work, 'art-thumb')}
      <div class="card-meta">
        <span class="card-number">${String(index + 1).padStart(2, '0')}</span>
        <div><h3 class="card-title">${work.title}</h3><p class="card-line">${work.line}</p></div>
        <span class="save-dot" aria-label="${saved.has(work.id) ? '已收藏' : '未收藏'}">${saved.has(work.id) ? '●' : '+'}</span>
      </div>
    </article>
  `).join('')
}

function updateSaved() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]))
  savedCount.textContent = saved.size
  renderWorks(document.querySelector('.filter.is-active')?.dataset.filter || 'all')
  if (activeWork) {
    document.querySelector('#dialogSave').textContent = saved.has(activeWork.id) ? '已收藏 · 移除' : '收藏此作'
  }
}

function openWork(id) {
  const work = works.find(item => item.id === id)
  if (!work) return
  activeWork = work
  const index = works.indexOf(work) + 1
  document.querySelector('#dialogVisual').innerHTML = visualMarkup(work)
  document.querySelector('#dialogIndex').textContent = `${String(index).padStart(2, '0')} / ${String(works.length).padStart(2, '0')}`
  document.querySelector('#dialogMood').textContent = `${work.mood} · CURATED OBJECT`
  document.querySelector('#dialogTitle').textContent = work.title
  document.querySelector('#dialogLine').textContent = work.line
  document.querySelector('#dialogAuthor').textContent = work.author
  document.querySelector('#dialogSource').href = work.source || '#'
  document.querySelector('#dialogSave').textContent = saved.has(work.id) ? '已收藏 · 移除' : '收藏此作'
  dialog.showModal()
}

async function shareWork(work = activeWork || works[0]) {
  const shareData = { title: `${work.title}｜未见 AI作品展`, text: work.line, url: `${location.origin}${location.pathname}#${work.id}` }
  try {
    if (navigator.share) await navigator.share(shareData)
    else {
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      showToast('分享文案和链接已复制')
    }
  } catch (error) {
    if (error.name !== 'AbortError') showToast('暂时无法分享，请复制浏览器地址')
  }
}

function showToast(message) {
  toast.textContent = message
  toast.classList.add('show')
  clearTimeout(showToast.timer)
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200)
}

function closeOnBackdrop(event) {
  if (event.target === event.currentTarget) event.currentTarget.close()
}

renderWorks()
updateSaved()

document.addEventListener('click', event => {
  const card = event.target.closest('.art-card')
  const opener = event.target.closest('[data-open-art]')
  if (card) openWork(card.dataset.id)
  else if (opener) openWork(opener.dataset.openArt)
})

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return
  const item = event.target.closest('.art-card, [data-open-art]')
  if (!item) return
  event.preventDefault()
  openWork(item.dataset.id || item.dataset.openArt)
})

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('is-active'))
  button.classList.add('is-active')
  renderWorks(button.dataset.filter)
}))

document.querySelector('#dialogClose').addEventListener('click', () => dialog.close())
document.querySelector('#dialogSave').addEventListener('click', () => {
  if (!activeWork) return
  saved.has(activeWork.id) ? saved.delete(activeWork.id) : saved.add(activeWork.id)
  updateSaved()
  showToast(saved.has(activeWork.id) ? '已收入你的私人馆藏' : '已从收藏中移除')
})
document.querySelector('#dialogShare').addEventListener('click', () => shareWork())
document.querySelector('#heroShare').addEventListener('click', () => shareWork(works[0]))
dialog.addEventListener('click', closeOnBackdrop)

function openSubmit() { submitDialog.showModal() }
document.querySelector('#submitButton').addEventListener('click', openSubmit)
document.querySelector('#closingSubmit').addEventListener('click', openSubmit)
document.querySelector('#submitClose').addEventListener('click', () => submitDialog.close())
submitDialog.addEventListener('click', closeOnBackdrop)

document.querySelector('#savedButton').addEventListener('click', () => {
  if (!saved.size) return showToast('你的私人馆藏还是空的')
  document.querySelector('#collection').scrollIntoView({ behavior: 'smooth' })
  document.querySelectorAll('.art-card').forEach(card => { card.hidden = !saved.has(card.dataset.id) })
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('is-active'))
  showToast(`正在看你的 ${saved.size} 件收藏`)
})

document.querySelector('#submitForm').addEventListener('submit', async event => {
  event.preventDefault()
  const data = new FormData(event.currentTarget)
  const text = `【未见投稿】\n作品：${data.get('title')}\n链接：${data.get('url')}\n推荐理由：${data.get('reason')}`
  try {
    await navigator.clipboard.writeText(text)
    document.querySelector('#submitNote').textContent = '投稿信息已复制。首版上线后，请将它发给站长完成投稿。'
    showToast('投稿信息已复制')
  } catch {
    document.querySelector('#submitNote').textContent = text
  }
})

const hashId = location.hash.slice(1)
if (works.some(work => work.id === hashId)) setTimeout(() => openWork(hashId), 250)
