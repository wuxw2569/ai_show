const works = [
  { id: 'endless-portals', title: '无尽之门', line: '如果一场梦，没有最后一个房间。', mood: '梦境', author: '未见实验室', visual: 'visual-portals', status: '概念演示' },
  { id: 'choir-of-stars', title: '群星合唱团', line: '那些微弱的光，正在练习同一种语言。', mood: '壮观', author: '未见实验室', visual: 'visual-choir', status: '概念演示' },
  { id: 'last-moth', title: '最后一只蛾', line: '它扑向一颗已经熄灭的太阳。', mood: '诡异', author: '未见实验室', visual: 'visual-moth', status: '概念演示' },
  { id: 'silent-ocean', title: '静音海', line: '一片没有声音，却记得所有暴雨的海。', mood: '治愈', author: '未见实验室', visual: 'visual-ocean', status: '概念演示' },
  { id: 'impossible-bloom', title: '不存在的花期', line: '春天犯了一个漂亮的错误。', mood: '梦境', author: '未见实验室', visual: 'visual-bloom', status: '概念演示' },
  { id: 'night-train', title: '驶出夜晚', line: '列车经过之后，黄昏被留在了原地。', mood: '壮观', author: '未见实验室', visual: 'visual-train', status: '概念演示' },
  { id: 'green-monolith', title: '绿光纪念碑', line: '它在等一个从未出生的文明。', mood: '诡异', author: '未见实验室', visual: 'visual-monolith', status: '概念演示' },
  { id: 'after-rain', title: '雨后的宇宙花园', line: '每一滴水，都长出了自己的星座。', mood: '治愈', author: '未见实验室', visual: 'visual-garden', status: '概念演示' }
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
  document.querySelector('#dialogStatus').textContent = work.status
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
