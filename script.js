const listEl = document.getElementById('list')
const newTaskInput = document.getElementById('newTask')
const addBtn = document.getElementById('addBtn')
const clearBtn = document.getElementById('clearCompleted')
const filters = Array.from(document.querySelectorAll('.filter'))
const countEl = document.getElementById('count')
const STORAGE_KEY = 'ultra_tasks_v1'
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
let activeFilter = 'all'

function save(){localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function render(){
  listEl.innerHTML = ''
  const visible = tasks.filter(t => activeFilter === 'all' ? true : activeFilter === 'active' ? !t.completed : t.completed)
  visible.forEach(task => {
    const li = document.createElement('li')
    li.className = 'task'
    li.dataset.id = task.id
    const check = document.createElement('button')
    check.className = 'check' + (task.completed ? ' completed' : '')
    check.setAttribute('aria-label','Toggle complete')
    check.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>'
    const content = document.createElement('div')
    content.className = 'content'
    const title = document.createElement('div')
    title.className = 'title' + (task.completed ? ' completed' : '')
    title.textContent = task.text
    const meta = document.createElement('div')
    meta.className = 'meta-line'
    meta.textContent = new Date(task.created).toLocaleString()
    const controls = document.createElement('div')
    controls.className = 'controls-inline'
    const editBtn = document.createElement('button')
    editBtn.className = 'icon-btn'
    editBtn.setAttribute('aria-label','Edit task')
    editBtn.textContent = 'Edit'
    const delBtn = document.createElement('button')
    delBtn.className = 'icon-btn'
    delBtn.setAttribute('aria-label','Delete task')
    delBtn.textContent = 'Delete'
    controls.append(editBtn, delBtn)
    content.append(title, meta)
    li.append(check, content, controls)
    listEl.appendChild(li)
    requestAnimationFrame(() => li.classList.add('adding'))
    check.addEventListener('click', () => {
      task.completed = !task.completed
      save()
      render()
    })
    delBtn.addEventListener('click', () => {
      li.classList.add('removing')
      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== task.id)
        save()
        render()
      }, 300)
    })
    editBtn.addEventListener('click', () => startEdit(li, task))
    li.addEventListener('dblclick', () => startEdit(li, task))
  })
  const left = tasks.filter(t => !t.completed).length
  countEl.textContent = `${left} item${left !== 1 ? 's' : ''} left`
}

function startEdit(li, task){
  const content = li.querySelector('.content')
  const titleEl = li.querySelector('.title')
  const input = document.createElement('input')
  input.className = 'edit-input'
  input.value = task.text
  content.innerHTML = ''
  content.appendChild(input)
  input.focus()
  input.select()
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finishEdit(input, task)
    if (e.key === 'Escape') cancelEdit(task, content)
  })
  input.addEventListener('blur', () => finishEdit(input, task))
}

function finishEdit(input, task){
  const v = input.value.trim()
  if (!v){
    tasks = tasks.filter(t => t.id !== task.id)
  } else {
    task.text = v
  }
  save()
  render()
}

function cancelEdit(task, content){
  content.innerHTML = ''
  const title = document.createElement('div')
  title.className = 'title' + (task.completed ? ' completed' : '')
  title.textContent = task.text
  content.appendChild(title)
}

addBtn.addEventListener('click', () => {
  const v = newTaskInput.value.trim()
  if (!v) return
  tasks.unshift({id: uid(), text: v, completed: false, created: Date.now()})
  newTaskInput.value = ''
  save()
  render()
  newTaskInput.focus()
})

newTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click()
})

clearBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed)
  save()
  render()
})

filters.forEach(f => f.addEventListener('click', () => {
  filters.forEach(b => b.classList.remove('active'))
  f.classList.add('active')
  activeFilter = f.dataset.filter
  render()
}))

render()