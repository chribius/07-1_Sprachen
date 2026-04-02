(()=>{
  'use strict'

  const appEl = document.getElementById('app')
  const quizMetaEl = document.getElementById('quiz-meta')
  const overlayEl = document.getElementById('modal-overlay')
  const modalConfirm = document.getElementById('modal-confirm')
  const modalCancel = document.getElementById('modal-cancel')

  function stripComments(source) {
    return source.replace(/\/\*[\s\S]*?\*\//g, '')
  }

  function checkCssSyntax(source) {
    const css = stripComments(source)
    let depth = 0
    for (let i = 0; i < css.length; i++) {
      if (css[i] === '{') depth++
      if (css[i] === '}') depth--
      if (depth < 0) return 'Es gibt eine schliessende } ohne passende oeffnende {'
    }
    if (depth !== 0) return 'Mindestens eine CSS-Klammer { } ist nicht korrekt geschlossen.'

    const blocks = css.match(/[^{}]+\{[^{}]*\}/g) || []
    if (!blocks.length) return 'Schreibe mindestens eine CSS-Regel.'
    for (const block of blocks) {
      const body = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}')).trim()
      if (!body) return 'Eine CSS-Regel ist leer.'
      const declarations = body.split(';').map(part => part.trim()).filter(Boolean)
      for (const declaration of declarations) {
        if (!declaration.includes(':')) return `In der Deklaration "${declaration}" fehlt ein Doppelpunkt.`
      }
    }
    return null
  }

  function hasSelector(source, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`${escaped}\\s*\\{`, 'i').test(source)
  }

  function hasProperty(source, property) {
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`${escaped}\\s*:`, 'i').test(source)
  }

  function hasPropertyInSelector(source, selector, property) {
    const selectorEscaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = source.match(new RegExp(`${selectorEscaped}\\s*\\{([\\s\\S]*?)\\}`, 'i'))
    if (!match) return false
    return new RegExp(`${property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`, 'i').test(match[1])
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  const PREVIEW_BASE = `body{margin:0;padding:1.2rem;background:#0f172a;color:#e2e8f0;font-family:Inter,Arial,sans-serif;line-height:1.6}.preview-shell{max-width:860px;margin:0 auto;background:linear-gradient(180deg,#13223d,#0a1321);border:1px solid rgba(125,170,220,.35);border-radius:18px;padding:1.2rem;box-shadow:0 20px 40px rgba(0,0,0,.25)}section{background:rgba(255,255,255,.03);border-radius:14px;padding:1rem 1.1rem}section h1{margin-top:0;color:#f8fafc}section p{margin:.55rem 0}#hinweis,#warnung,#karte,#info{padding:.6rem .8rem;border-radius:10px}`

  function makePreview(task, css) {
    return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${PREVIEW_BASE}${css}</style></head><body><div class="preview-shell">${task.html || ''}</div></body></html>`
  }

  const TASKS = [
    {
      id: 'q1', type: 'mc', ab: 1,
      competency: 'Was ist CSS?',
      timeLimit: 60,
      question: 'Wofuer wird <strong>CSS</strong> verwendet?',
      options: [
        'Fuer das Design und die Darstellung einer Webseite',
        'Fuer das Speichern von Bildern auf dem Server',
        'Fuer die Installation des Browsers',
        'Fuer das Schreiben von Passwoertern',
      ],
      correct: 0,
    },
    {
      id: 'q2', type: 'sort', ab: 1,
      competency: 'CSS-Regel aufbauen',
      timeLimit: 60,
      question: 'Bringe die Teile einer einfachen CSS-Regel in die richtige Reihenfolge.',
      items: ['<code>color: gold;</code>', '<code>}</code>', '<code>h1</code>', '<code>{</code>'],
      correctOrder: [2, 3, 0, 1],
    },
    {
      id: 'q3', type: 'editor', ab: 2,
      competency: 'Selektoren',
      timeLimit: 120,
      question: 'Gestalte zwei IDs unterschiedlich. Der Hinweis und das Ziel sollen klar unterscheidbar sein.',
      html: '<section><h1>Signalfeuer</h1><p id="hinweis">Hinweis: Die Spur fuehrt durch die Mangroven.</p><p id="ziel">Ziel: Hinter dem Leuchtturm liegt die Truhe.</p></section>',
      starter: '#hinweis {\n  background: rgba(255, 209, 102, 0.2);\n}\n\n#ziel {\n  border-left: 4px solid #60a5fa;\n}',
      validate(source) {
        const syntaxError = checkCssSyntax(source)
        if (syntaxError) return { ok: false, msg: syntaxError }
        if (!hasSelector(source, '#hinweis')) return { ok: false, msg: 'Die ID #hinweis fehlt.' }
        if (!hasSelector(source, '#ziel')) return { ok: false, msg: 'Die ID #ziel fehlt.' }
        if (!hasPropertyInSelector(source, '#hinweis', 'background') && !hasPropertyInSelector(source, '#hinweis', 'color')) return { ok: false, msg: '#hinweis braucht eine sichtbare Gestaltung.' }
        if (!hasPropertyInSelector(source, '#ziel', 'border') && !hasPropertyInSelector(source, '#ziel', 'color')) return { ok: false, msg: '#ziel braucht eine eigene Gestaltung.' }
        return { ok: true }
      },
    },
    {
      id: 'q4', type: 'editor', ab: 2,
      competency: 'Typografie',
      timeLimit: 120,
      question: 'Gib der Schatznotiz eine eigene Schriftfamilie, eine passende Schriftgroesse und einen Schrifteffekt.',
      html: '<section class="story-preview"><h1>Kapitaensnotiz</h1><p>Der Wind dreht nach Westen, und die Wellen werden hoeher.</p><p>Die Randnotiz auf der Karte muss trotzdem gut lesbar bleiben.</p></section>',
      starter: 'body {\n  font-family: Georgia, serif;\n}\n\nh1 {\n  font-size: 2rem;\n  font-weight: 700;\n}',
      validate(source) {
        const syntaxError = checkCssSyntax(source)
        if (syntaxError) return { ok: false, msg: syntaxError }
        if (!hasProperty(source, 'font-family')) return { ok: false, msg: 'font-family fehlt.' }
        if (!hasProperty(source, 'font-size')) return { ok: false, msg: 'font-size fehlt.' }
        if (!hasProperty(source, 'font-weight') && !hasProperty(source, 'font-style') && !hasProperty(source, 'text-transform') && !hasProperty(source, 'text-decoration')) return { ok: false, msg: 'Ein Schrifteffekt fehlt.' }
        return { ok: true }
      },
    },
    {
      id: 'q5', type: 'mc', ab: 2,
      competency: 'Inhalt und Design trennen',
      timeLimit: 60,
      question: 'Warum ist die Trennung von Inhalt und Design sinnvoll?',
      options: [
        'Weil man denselben Inhalt leichter in verschiedenen Designs anzeigen kann',
        'Weil HTML dann keine Tags mehr braucht',
        'Weil der Browser sonst keine Bilder anzeigen darf',
        'Weil CSS nur auf Smartphones funktioniert',
      ],
      correct: 0,
    },
    {
      id: 'q6', type: 'mc', ab: 1,
      competency: 'Responsive Webdesign',
      timeLimit: 60,
      question: 'Welche Kombination passt direkt zu <strong>responsive Webdesign</strong>?',
      options: [
        '@media und max-width',
        'href und src',
        'ul und li',
        'alt und title',
      ],
      correct: 0,
    },
    {
      id: 'q7', type: 'editor', ab: 3,
      competency: 'Responsive Layout',
      timeLimit: 140,
      question: 'Passe die Schatzkarte fuer kleinere Bildschirme an. Nutze @media und max-width.',
      html: '<section id="karte"><h1>Faltkarte</h1><p>Auf dem grossen Bildschirm ist die Karte breit und luftig.</p><p>Auf kleinen Bildschirmen soll sie enger und besser lesbar werden.</p></section>',
      starter: '#karte {\n  max-width: 760px;\n  padding: 2rem;\n}\n\n@media (max-width: 700px) {\n  #karte {\n    padding: 1rem;\n  }\n}',
      validate(source) {
        const syntaxError = checkCssSyntax(source)
        if (syntaxError) return { ok: false, msg: syntaxError }
        if (!/@media/i.test(source)) return { ok: false, msg: '@media fehlt.' }
        if (!/max-width\s*:/i.test(source) && !/@media\s*\([^)]*max-width/i.test(source)) return { ok: false, msg: 'max-width fehlt.' }
        if (!hasSelector(source, '#karte')) return { ok: false, msg: 'Die Regel fuer #karte fehlt.' }
        return { ok: true }
      },
    },
    {
      id: 'qpro', type: 'editor', ab: 3, isPro: true,
      competency: 'Alle Kompetenzen',
      timeLimit: 240,
      question: `Erstelle ein <strong>vollstaendiges CSS-Design</strong> fuer die Schatzkarte.<br><br>
        Das Design soll enthalten:
        <ul class="req-list">
          <li>mindestens einen Typselektor</li>
          <li>mindestens eine ID</li>
          <li>eine lesbare Typografie</li>
          <li>eine sichtbare farbliche Gestaltung</li>
          <li>eine responsive Anpassung mit @media und max-width</li>
        </ul>`,
      html: '<section id="karte"><h1>Die letzte Schatzkarte</h1><p id="info">Info: Hinter dem grossen Felsen beginnt der geheime Aufstieg.</p><p id="warnung">Warnung: Bei Flut verschwindet der sichere Pfad.</p><p>Nur das CSS soll nun aus diesem Inhalt ein gutes Design machen.</p></section>',
      starter: 'body {\n\n}\n\nh1 {\n\n}\n\n#info {\n\n}\n\n#warnung {\n\n}\n\n@media (max-width: 700px) {\n\n}',
      validate(source) {
        const syntaxError = checkCssSyntax(source)
        if (syntaxError) return { ok: false, msg: syntaxError }
        if (!hasSelector(source, 'h1') && !hasSelector(source, 'body') && !hasSelector(source, 'p')) return { ok: false, msg: 'Nutze mindestens einen Typselektor wie body, h1 oder p.' }
        if (!hasSelector(source, '#info') && !hasSelector(source, '#warnung') && !hasSelector(source, '#karte')) return { ok: false, msg: 'Nutze mindestens eine ID wie #info, #warnung oder #karte.' }
        if (!hasProperty(source, 'font-family') && !hasProperty(source, 'font-size')) return { ok: false, msg: 'Die Typografie braucht mindestens font-family oder font-size.' }
        if (!hasProperty(source, 'color') && !hasProperty(source, 'background') && !hasProperty(source, 'background-color')) return { ok: false, msg: 'Es fehlt eine sichtbare farbliche Gestaltung.' }
        if (!/@media/i.test(source)) return { ok: false, msg: 'Die responsive @media-Regel fehlt.' }
        if (!/max-width\s*:/i.test(source) && !/@media\s*\([^)]*max-width/i.test(source)) return { ok: false, msg: 'Nutze max-width fuer die responsive Anpassung.' }
        return { ok: true }
      },
    },
  ]

  function freshState() {
    return { phase: 'start', currentIdx: 0, answers: {}, proUnlocked: false, taskStates: {}, pendingProIdx: null }
  }
  let state = freshState()
  let saveCurrentTask = () => {}
  let timerInterval = null
  let timerRemaining = 0

  function stopTimer() { clearInterval(timerInterval) }

  function startTimer(total, onTick, onExpire) {
    stopTimer()
    timerRemaining = total
    onTick(timerRemaining, total)
    timerInterval = setInterval(() => {
      timerRemaining--
      onTick(timerRemaining, total)
      if (timerRemaining === 0) onExpire()
    }, 1000)
  }

  function tickBar(pane, remaining, total) {
    const fill = pane.querySelector('.timer-bar-fill')
    const count = pane.querySelector('.timer-count')
    if (!fill || !count) return
    const isNegative = remaining < 0
    const absRemaining = Math.abs(remaining)
    fill.style.width = (absRemaining / total) * 100 + '%'
    fill.className = 'timer-bar-fill' +
      (remaining <= 20 && remaining > 0 ? ' low' : '') +
      (remaining <= 5 && remaining > 0 ? ' very-low' : '') +
      (isNegative ? ' timer-overtime' : '')
    const m = Math.floor(absRemaining / 60)
    const s = String(absRemaining % 60).padStart(2, '0')
    count.textContent = isNegative ? `-${m}:${s}` : `${m}:${s}`
  }

  function timerExpiredBanner(pane) {
    if (pane.querySelector('.timer-expired')) return
    const b = document.createElement('div')
    b.className = 'timer-expired'
    b.textContent = '⏰ Zeit abgelaufen – du kannst aber weiterarbeiten!'
    pane.querySelector('.timer-wrap')?.after(b)
  }

  function timerHTML(total) {
    const m = Math.floor(total / 60)
    const s = String(total % 60).padStart(2, '0')
    return `<div class="timer-wrap"><div class="timer-bar"><div class="timer-bar-fill" style="width:100%"></div></div><span class="timer-count">${m}:${s}</span></div>`
  }

  function shuffle(arr) {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  function advanceOrResults() {
    saveCurrentTask()
    const nextIdx = state.currentIdx + 1
    if (nextIdx >= TASKS.length) { showResults(); return }
    const next = TASKS[nextIdx]
    if (next.isPro && !state.proUnlocked) {
      state.pendingProIdx = nextIdx
      showProWarning(nextIdx)
      return
    }
    state.currentIdx = nextIdx
    showTask()
  }

  function updateMeta() {
    if (state.phase !== 'quiz') { quizMetaEl.innerHTML = ''; return }
    const task = TASKS[state.currentIdx]
    const answered = Object.keys(state.answers).length
    quizMetaEl.innerHTML = `<div class="meta-pills"><span class="pill ab-pill">AB${task.ab}</span><span class="pill">${task.isPro ? '⭐ Profi-Aufgabe' : `${state.currentIdx + 1}&thinsp;/&thinsp;${TASKS.length}`}</span><span class="pill">${answered} geloest</span></div>`
  }

  function paneBase(task) {
    const pane = document.createElement('section')
    pane.className = 'pane' + (task.isPro ? ' pane-pro' : '')
    pane.innerHTML = `<div class="task-header"><span class="comp-label">${task.competency}</span><span class="ab-badge">AB${task.ab}</span></div>${timerHTML(task.timeLimit)}<div class="question">${task.question}</div>`
    appEl.innerHTML = ''
    appEl.appendChild(pane)
    return pane
  }

  function showStart() {
    stopTimer()
    state.phase = 'start'
    updateMeta()
    const individual = TASKS.filter(t => !t.isPro).length
    appEl.innerHTML = `<section class="pane quiz-start"><h2>Willkommen zum CSS-Quiz!</h2><p>Du kennst jetzt die Grundideen von CSS. Im Quiz zeigst du, wie sicher du mit Selektoren, Typografie und Responsive Design umgehen kannst.</p><div class="info-grid"><div class="info-card"><span class="info-num">${individual}</span><span class="info-label">Einzelaufgaben</span></div><div class="info-card"><span class="info-num">1</span><span class="info-label">Profi-Aufgabe</span></div><div class="info-card"><span class="info-num">3</span><span class="info-label">Aufgabentypen</span></div></div><p class="muted-note">Auch hier laeuft die Zeit nach 0 weiter. Du darfst also immer fertigarbeiten.</p><button id="btn-start" class="btn-large">Quiz starten ›</button></section>`
    document.getElementById('btn-start').addEventListener('click', () => {
      state.phase = 'quiz'
      state.currentIdx = 0
      showTask()
    })
  }

  function showTask() {
    updateMeta()
    stopTimer()
    const task = TASKS[state.currentIdx]
    if (task.type === 'mc') renderMC(task)
    else if (task.type === 'sort') renderSort(task)
    else renderEditor(task)
  }

  function renderMC(task) {
    const pane = paneBase(task)
    const saved = state.taskStates[task.id]
    const grid = document.createElement('div')
    grid.className = 'mc-grid'
    const shuffledIndices = saved?.mcShuffledIndices ?? shuffle([...Array(task.options.length).keys()])
    const shuffledOptions = shuffledIndices.map(i => ({ opt: task.options[i], origIdx: i }))
    let selected = saved?.mcSelected ?? null
    let phase = saved?.phase ?? 'check'
    shuffledOptions.forEach(({ opt, origIdx }) => {
      const card = document.createElement('button')
      card.className = 'mc-card'
      card.dataset.correctIdx = origIdx
      card.innerHTML = opt
      if (phase === 'advance') {
        if (origIdx === task.correct) card.classList.add('mc-correct')
        else if (origIdx === selected && origIdx !== task.correct) card.classList.add('mc-wrong')
        if (origIdx === selected) card.classList.add('mc-selected')
      } else if (origIdx === selected) {
        card.classList.add('mc-selected')
      }
      card.addEventListener('click', () => {
        if (phase !== 'check') return
        grid.querySelectorAll('.mc-card').forEach(c => c.classList.remove('mc-selected'))
        card.classList.add('mc-selected')
        selected = origIdx
      })
      grid.appendChild(card)
    })
    pane.appendChild(grid)
    const navDiv = document.createElement('div')
    navDiv.className = 'nav-btns'
    const fb = document.createElement('div')
    fb.className = 'feedback-inline'
    if (saved?.feedbackHtml) fb.innerHTML = saved.feedbackHtml
    const btn = document.createElement('button')
    btn.textContent = saved?.btnText ?? 'Antwort pruefen'
    navDiv.appendChild(btn)
    pane.appendChild(navDiv)
    pane.appendChild(fb)
    if (phase === 'advance') {
      timerRemaining = saved?.timerSaved ?? 0
      tickBar(pane, timerRemaining, task.timeLimit)
      if (saved?.expired) timerExpiredBanner(pane)
    } else {
      startTimer(saved?.timerSaved ?? task.timeLimit, (rem, tot) => tickBar(pane, rem, tot), () => timerExpiredBanner(pane))
    }
    saveCurrentTask = () => {
      state.taskStates[task.id] = { mcShuffledIndices: shuffledIndices, mcSelected: selected, phase, timerSaved: timerRemaining, feedbackHtml: fb.innerHTML, btnText: btn.textContent, expired: !!pane.querySelector('.timer-expired') }
    }
    btn.addEventListener('click', () => {
      if (phase === 'check') {
        if (selected === null) { fb.innerHTML = '<span class="status error">⚠️ Bitte waehle eine Antwort.</span>'; return }
        const correct = selected === task.correct
        state.answers[task.id] = { correct, inTime: timerRemaining > 0 }
        stopTimer()
        grid.querySelectorAll('.mc-card').forEach(c => {
          const origIdx = parseInt(c.dataset.correctIdx, 10)
          if (origIdx === task.correct) c.classList.add('mc-correct')
          else if (origIdx === selected && !correct) c.classList.add('mc-wrong')
        })
        fb.innerHTML = correct ? '<span class="status success">✅ Richtig!</span>' : '<span class="status error">❌ Leider nicht – die richtige Antwort ist gruen markiert.</span>'
        phase = 'advance'
        btn.textContent = state.currentIdx === TASKS.length - 1 ? 'Auswertung anzeigen' : 'Weiter ›'
      } else {
        advanceOrResults()
      }
    })
  }

  function renderSort(task) {
    const pane = paneBase(task)
    const saved = state.taskStates[task.id]
    const container = document.createElement('div')
    container.className = 'sort-cards'
    let order = saved?.sortOrder ? [...saved.sortOrder] : task.items.map((_, i) => i)
    let phase = saved?.phase ?? 'check'
    const frozen = phase === 'advance'
    function renderItems() {
      container.innerHTML = ''
      order.forEach((itemIdx, pos) => {
        const card = document.createElement('div')
        card.className = 'sort-card'
        card.draggable = !frozen
        card.dataset.pos = pos
        card.innerHTML = `<span class="drag-handle">☰</span><span class="sort-label">${task.items[itemIdx]}</span>`
        if (frozen) {
          card.classList.add(order[pos] === task.correctOrder[pos] ? 'sort-correct' : 'sort-wrong')
        } else {
          card.addEventListener('dragstart', e => {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', String(pos))
            card.classList.add('dragging')
          })
          card.addEventListener('dragend', () => card.classList.remove('dragging'))
          card.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; card.classList.add('drag-over') })
          card.addEventListener('dragleave', () => card.classList.remove('drag-over'))
          card.addEventListener('drop', e => {
            e.preventDefault()
            card.classList.remove('drag-over')
            const from = parseInt(e.dataTransfer.getData('text/plain'), 10)
            if (from === pos) return
            const [moved] = order.splice(from, 1)
            order.splice(pos, 0, moved)
            renderItems()
          })
        }
        container.appendChild(card)
      })
    }
    renderItems()
    pane.appendChild(container)
    const navDiv = document.createElement('div')
    navDiv.className = 'nav-btns'
    const btn = document.createElement('button')
    btn.textContent = saved?.btnText ?? 'Reihenfolge pruefen'
    const fb = document.createElement('div')
    fb.className = 'feedback-inline'
    if (saved?.feedbackHtml) fb.innerHTML = saved.feedbackHtml
    navDiv.appendChild(btn)
    pane.appendChild(navDiv)
    pane.appendChild(fb)
    if (phase === 'advance') {
      timerRemaining = saved?.timerSaved ?? 0
      tickBar(pane, timerRemaining, task.timeLimit)
      if (saved?.expired) timerExpiredBanner(pane)
    } else {
      startTimer(saved?.timerSaved ?? task.timeLimit, (rem, tot) => tickBar(pane, rem, tot), () => timerExpiredBanner(pane))
    }
    saveCurrentTask = () => {
      state.taskStates[task.id] = { sortOrder: [...order], phase, timerSaved: timerRemaining, feedbackHtml: fb.innerHTML, btnText: btn.textContent, expired: !!pane.querySelector('.timer-expired') }
    }
    btn.addEventListener('click', () => {
      if (phase === 'check') {
        const correct = JSON.stringify(order) === JSON.stringify(task.correctOrder)
        state.answers[task.id] = { correct, inTime: timerRemaining > 0 }
        stopTimer()
        container.querySelectorAll('.sort-card').forEach((card, pos) => {
          card.classList.add(order[pos] === task.correctOrder[pos] ? 'sort-correct' : 'sort-wrong')
        })
        fb.innerHTML = correct ? '<span class="status success">✅ Perfekte Reihenfolge!</span>' : '<span class="status error">❌ Noch nicht ganz – Abweichungen sind rot markiert.</span>'
        phase = 'advance'
        btn.textContent = state.currentIdx === TASKS.length - 1 ? 'Auswertung anzeigen' : 'Weiter ›'
      } else {
        advanceOrResults()
      }
    })
  }

  function renderEditor(task) {
    const pane = paneBase(task)
    const saved = state.taskStates[task.id]
    const cols = document.createElement('div')
    cols.className = 'cols'
    const left = document.createElement('div')
    left.className = 'box'
    const right = document.createElement('div')
    right.className = 'box'

    left.innerHTML = '<h3>HTML-Quelle</h3>'
    const htmlCode = document.createElement('pre')
    htmlCode.className = 'code-view'
    htmlCode.innerHTML = escapeHtml(task.html || '')
    left.appendChild(htmlCode)

    const cssTitle = document.createElement('h3')
    cssTitle.textContent = 'CSS-Code'
    left.appendChild(cssTitle)

    const ta = document.createElement('textarea')
    ta.value = saved?.editorValue ?? (task.starter || '')
    ta.spellcheck = false
    ta.autocomplete = 'off'
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = ta.selectionStart
        const end = ta.selectionEnd
        ta.value = ta.value.slice(0, start) + '\t' + ta.value.slice(end)
        ta.selectionStart = ta.selectionEnd = start + 1
      }
    })
    left.appendChild(ta)
    const btnRow = document.createElement('div')
    btnRow.className = 'btn-row'
    const checkBtn = document.createElement('button')
    checkBtn.textContent = 'Code pruefen'
    const nextBtn = document.createElement('button')
    nextBtn.textContent = state.currentIdx === TASKS.length - 1 ? 'Auswertung anzeigen' : 'Weiter ›'
    const fb = document.createElement('div')
    fb.className = 'feedback-inline'
    let phase = saved?.phase ?? 'check'
    if (phase === 'advance') {
      nextBtn.className = ''
      checkBtn.disabled = true
    } else {
      nextBtn.className = 'secondary'
    }
    if (saved?.feedbackHtml) fb.innerHTML = saved.feedbackHtml
    btnRow.appendChild(checkBtn)
    btnRow.appendChild(nextBtn)
    left.appendChild(btnRow)
    left.appendChild(fb)
    right.innerHTML = '<h3>Live-Vorschau</h3>'
    const iframe = document.createElement('iframe')
    iframe.id = 'preview'
    iframe.sandbox = 'allow-same-origin'
    right.appendChild(iframe)
    cols.appendChild(left)
    cols.appendChild(right)
    pane.appendChild(cols)
    function updatePreview() { iframe.srcdoc = makePreview(task, ta.value) }
    let debounce
    ta.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(updatePreview, 250) })
    updatePreview()
    if (phase === 'advance') {
      timerRemaining = saved?.timerSaved ?? 0
      tickBar(pane, timerRemaining, task.timeLimit)
      if (saved?.expired) timerExpiredBanner(pane)
    } else {
      startTimer(saved?.timerSaved ?? task.timeLimit, (rem, tot) => tickBar(pane, rem, tot), () => timerExpiredBanner(pane))
    }
    saveCurrentTask = () => {
      state.taskStates[task.id] = { editorValue: ta.value, phase, timerSaved: timerRemaining, feedbackHtml: fb.innerHTML, expired: !!pane.querySelector('.timer-expired') }
    }
    checkBtn.addEventListener('click', () => {
      const result = task.validate(ta.value)
      if (result.ok) {
        fb.innerHTML = '<span class="status success">✅ Richtig!</span>'
        state.answers[task.id] = { correct: true, inTime: timerRemaining > 0 }
        stopTimer()
        phase = 'advance'
        nextBtn.className = ''
        checkBtn.disabled = true
      } else {
        fb.innerHTML = `<span class="status error">❌ ${result.msg}</span>`
        if (!state.answers[task.id]) state.answers[task.id] = { correct: false, inTime: false }
      }
    })
    nextBtn.addEventListener('click', () => {
      if (!state.answers[task.id]) state.answers[task.id] = { correct: false, skipped: true }
      advanceOrResults()
    })
  }

  function showResults() {
    stopTimer()
    state.phase = 'results'
    updateMeta()
    const total = TASKS.length
    const correct = Object.values(state.answers).filter(a => a.correct).length
    const sorted = [...TASKS].sort((a, b) => (state.answers[b.id]?.correct ? 1 : 0) - (state.answers[a.id]?.correct ? 1 : 0))
    const rows = sorted.map(task => {
      const ans = state.answers[task.id]
      const ok = ans?.correct
      const inTime = ans?.inTime
      const timeText = (!ans || ans.skipped) ? 'nicht bearbeitet' : (inTime ? '⏱ innerhalb der Zeit' : 'nach Ablauf der Zeit')
      return `<div class="result-row ${ok ? 'r-ok' : 'r-fail'}"><span class="r-icon">${ok ? '✅' : '❌'}</span><div class="r-info"><strong>${task.competency}${task.isPro ? ' ⭐' : ''}</strong><span class="r-meta">AB${task.ab} &nbsp;·&nbsp; ${timeText}</span></div><span class="ab-badge">AB${task.ab}</span></div>`
    }).join('')
    appEl.innerHTML = `<section class="pane results-pane"><h2>🎉 Quiz abgeschlossen!</h2><div class="score-banner"><span class="score-num">${correct}</span><span class="score-sep">/</span><span class="score-total">${total}</span><span class="score-label">Aufgaben richtig geloest</span></div><h3>Ergebnisse im Detail</h3><div class="result-list">${rows}</div><button id="btn-restart" style="margin-top:1.5rem">Quiz neu starten</button></section>`
    document.getElementById('btn-restart').addEventListener('click', () => {
      state = freshState()
      showStart()
    })
  }

  function showProWarning(nextIdx) {
    stopTimer()
    overlayEl.classList.remove('hidden')
    modalConfirm.onclick = () => {
      overlayEl.classList.add('hidden')
      state.proUnlocked = true
      state.currentIdx = nextIdx
      state.pendingProIdx = null
      showTask()
    }
    modalCancel.onclick = () => {
      overlayEl.classList.add('hidden')
      state.pendingProIdx = null
      showTask()
    }
  }

  showStart()
})()