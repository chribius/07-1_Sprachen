/* ── HTML-Quiz ──────────────────────────────────────────────── */
(()=>{
  'use strict'

  const appEl          = document.getElementById('app')
  const quizMetaEl     = document.getElementById('quiz-meta')
  const overlayEl      = document.getElementById('modal-overlay')
  const modalConfirm   = document.getElementById('modal-confirm')
  const modalCancel    = document.getElementById('modal-cancel')

  // ── Tag-balance checker (arbeitet auf Quelltext, nicht im DOM) ─
  function checkTagBalance(source) {
    const VOID = new Set([
      'area','base','br','col','embed','hr','img','input',
      'link','meta','param','source','track','wbr',
    ])
    // Erfasse alle öffnenden und schließenden Tags (DOCTYPE + Kommentare werden nicht gematcht)
    const re = /<(\/?)(\s*[a-z][a-z0-9]*)(?:\s[^>]*)?>/gi
    const stack = []
    let m
    while ((m = re.exec(source)) !== null) {
      const full    = m[0]
      const closing = m[1] === '/'
      const tag     = m[2].trim().toLowerCase()
      if (VOID.has(tag)) continue          // Void-Elemente brauchen kein End-Tag
      if (full.endsWith('/>')) continue    // Explizit selbstschließend: <br/>
      if (closing) {
        if (stack.length === 0)
          return `Schließendes <code>&lt;/${tag}&gt;</code> erscheint ohne öffnendes Tag.`
        if (stack[stack.length - 1] !== tag)
          return `<code>&lt;/${tag}&gt;</code> schließt falsches Tag – erwartet: <code>&lt;/${stack[stack.length - 1]}&gt;</code>.`
        stack.pop()
      } else {
        stack.push(tag)
      }
    }
    if (stack.length > 0)
      return `<code>&lt;${stack[stack.length - 1]}&gt;</code> wurde nicht geschlossen.`
    return null   // kein Fehler
  }

  // ── Task definitions ───────────────────────────────────────
  const TASKS = [
    // ── Q1 · MC · AB1 · Was ist HTML? ──────────────────────
    {
      id: 'q1', type: 'mc', ab: 1,
      competency: 'Was ist HTML?',
      timeLimit: 60,
      question: 'Was bedeutet die Abkürzung <strong>HTML</strong>?',
      options: [
        'HyperText Markup Language',
        'Hyper Transfer Markup Link',
        'Home Tool Markup Language',
        'HyperText Modern Layout',
      ],
      correct: 0,
    },

    // ── Q2 · Sort · AB1 · HTML-Dokumentstruktur ────────────
    {
      id: 'q2', type: 'sort', ab: 1,
      competency: 'HTML-Dokumentstruktur',
      timeLimit: 60,
      question: 'Bringe die Zeilen in die <strong>richtige Reihenfolge</strong> für ein gültiges HTML-Dokument. Ziehe die Elemente an ihre korrekte Position.',
      // Items presented in scrambled order (indices 0–4):
      //   0  → <head>…</head>   should be position 3
      //   1  → </html>          should be position 5
      //   2  → <!doctype html>  should be position 1
      //   3  → <body>…</body>   should be position 4
      //   4  → <html lang="de"> should be position 2
      items: [
        '<code>&lt;head&gt;&lt;title&gt;Meine Seite&lt;/title&gt;&lt;/head&gt;</code>',
        '<code>&lt;/html&gt;</code>',
        '<code>&lt;!doctype html&gt;</code>',
        '<code>&lt;body&gt;&lt;h1&gt;Hallo!&lt;/h1&gt;&lt;/body&gt;</code>',
        '<code>&lt;html lang="de"&gt;</code>',
      ],
      // correctOrder[i] = index of item that should be at position i
      correctOrder: [2, 4, 0, 3, 1],
    },

    // ── Q3 · Editor · AB2 · Überschriften & Absätze ────────
    {
      id: 'q3', type: 'editor', ab: 2,
      competency: 'Überschriften & Absätze',
      timeLimit: 120,
      question: 'Schreibe eine Webseite mit <strong>einer Überschrift</strong> (größte Stufe) und mindestens <strong>zwei Textblöcken</strong>.',
      starter: '',
      validate(doc, source) {
        const balErr = checkTagBalance(source)
        if (balErr) return { ok: false, msg: balErr }
        if (!doc.querySelector('h1'))
          return { ok: false, msg: 'Eine <code>&lt;h1&gt;</code>-Überschrift fehlt.' }
        if (doc.querySelectorAll('p').length < 2)
          return { ok: false, msg: 'Mindestens zwei <code>&lt;p&gt;</code>-Absätze fehlen.' }
        return { ok: true }
      },
    },

    // ── Q4 · Editor · AB2 · Listen ─────────────────────────
    {
      id: 'q4', type: 'editor', ab: 2,
      competency: 'Listen',
      timeLimit: 120,
      question: 'Erstelle zwei verschiedene <strong>Listentypen</strong>, jeweils mit mindestens 3 Einträgen: eine unsortierte und eine nummerierte Liste.',
      starter: '',
      validate(doc, source) {
        const balErr = checkTagBalance(source)
        if (balErr) return { ok: false, msg: balErr }
        if (!doc.querySelector('ul'))
          return { ok: false, msg: '<code>&lt;ul&gt;</code> fehlt.' }
        if (!doc.querySelector('ol'))
          return { ok: false, msg: '<code>&lt;ol&gt;</code> fehlt.' }
        if (doc.querySelectorAll('ul li').length < 3)
          return { ok: false, msg: '<code>&lt;ul&gt;</code> braucht mindestens 3 <code>&lt;li&gt;</code>-Einträge.' }
        if (doc.querySelectorAll('ol li').length < 3)
          return { ok: false, msg: '<code>&lt;ol&gt;</code> braucht mindestens 3 <code>&lt;li&gt;</code>-Einträge.' }
        return { ok: true }
      },
    },

    // ── Q5 · MC · AB2 · Links ──────────────────────────────
    {
      id: 'q5', type: 'mc', ab: 2,
      competency: 'Links',
      timeLimit: 60,
      question: 'Eine Schülerin möchte einen Link einfügen, der eine externe Seite <strong>in einem neuen Tab</strong> öffnet. Welches Beispiel ist <strong>korrekt</strong>?',
      options: [
        '<code>&lt;a href="https://www.schule.de" target="_blank"&gt;Zur Schule&lt;/a&gt;</code>',
        '<code>&lt;a src="https://www.schule.de" target="_blank"&gt;Zur Schule&lt;/a&gt;</code>',
        '<code>&lt;a href="www.schule.de" target="blank"&gt;Zur Schule&lt;/a&gt;</code>',
        '<code>&lt;link href="https://www.schule.de"&gt;Zur Schule&lt;/link&gt;</code>',
      ],
      correct: 0,
    },

    // ── Q6 · MC · AB1 · Bilder ─────────────────────────────
    {
      id: 'q6', type: 'mc', ab: 1,
      competency: 'Bilder',
      timeLimit: 60,
      question: 'Welche <strong>zwei Attribute</strong> sind für ein <code>&lt;img&gt;</code>-Tag zwingend erforderlich (korrekte Darstellung <em>und</em> Barrierefreiheit)?',
      options: [
        '<code>width</code> und <code>height</code>',
        '<code>src</code> und <code>alt</code>',
        '<code>href</code> und <code>title</code>',
        '<code>src</code> und <code>href</code>',
      ],
      correct: 1,
    },

    // ── Q7 · Editor · AB3 · Textformatierung ───────────────
    {
      id: 'q7', type: 'editor', ab: 3,
      competency: 'Textformatierung',
      timeLimit: 120,
      question: 'Schreibe einen Satz über dein Lieblingshobby. Nutze dabei <strong>Fettdruck, Betonung und kleine Schrift</strong> so, dass sie inhaltlich sinnvoll sind.',
      starter: '',
      validate(doc, source) {
        const balErr = checkTagBalance(source)
        if (balErr) return { ok: false, msg: balErr }
        if (!doc.querySelector('strong'))
          return { ok: false, msg: '<code>&lt;strong&gt;</code> fehlt.' }
        if (!doc.querySelector('em'))
          return { ok: false, msg: '<code>&lt;em&gt;</code> fehlt.' }
        if (!doc.querySelector('small'))
          return { ok: false, msg: '<code>&lt;small&gt;</code> fehlt.' }
        return { ok: true }
      },
    },

    // ── QPro · Editor · AB3 · Alle Kompetenzen ─────────────
    {
      id: 'qpro', type: 'editor', ab: 3, isPro: true,
      competency: 'Alle Kompetenzen',
      timeLimit: 240,
      question: `Erstelle eine <strong>vollständige HTML-Seite</strong> zum Thema „Meine Lieblingswebseite".<br>
        Die Seite muss enthalten:
        <ul class="req-list">
          <li>Korrekte Grundstruktur (<code>&lt;!DOCTYPE&gt;</code>, <code>&lt;html&gt;</code>, <code>&lt;head&gt;</code>, <code>&lt;body&gt;</code>)</li>
          <li>Eine <code>&lt;h1&gt;</code>-Überschrift</li>
          <li>Mindestens zwei <code>&lt;p&gt;</code>-Absätze</li>
          <li>Eine Liste (<code>&lt;ul&gt;</code> oder <code>&lt;ol&gt;</code>) mit mind. 3 Einträgen</li>
          <li>Einen Link mit <code>href</code></li>
          <li>Ein <code>&lt;img&gt;</code> mit <code>src</code> und <code>alt</code></li>
          <li>Mindestens <code>&lt;strong&gt;</code> oder <code>&lt;em&gt;</code></li>
        </ul>`,
      starter: '<!doctype html>\n<html lang="de">\n  <head>\n    <title></title>\n  </head>\n  <body>\n\n  </body>\n</html>',
      validate(doc, source) {
        const balErr = checkTagBalance(source)
        if (balErr) return { ok: false, msg: balErr }
        if (!/<!doctype/i.test(source))
          return { ok: false, msg: '<code>&lt;!DOCTYPE html&gt;</code> fehlt.' }
        if (!/<html[\s>]/i.test(source))
          return { ok: false, msg: '<code>&lt;html&gt;</code>-Element fehlt.' }
        if (!doc.querySelector('head > title'))
          return { ok: false, msg: '<code>&lt;title&gt;</code> im <code>&lt;head&gt;</code> fehlt.' }
        if (!doc.querySelector('h1'))
          return { ok: false, msg: '<code>&lt;h1&gt;</code>-Überschrift fehlt.' }
        if (doc.querySelectorAll('p').length < 2)
          return { ok: false, msg: 'Mindestens 2 <code>&lt;p&gt;</code>-Absätze fehlen.' }
        const ulLi = doc.querySelectorAll('ul li').length
        const olLi = doc.querySelectorAll('ol li').length
        if (Math.max(ulLi, olLi) < 3)
          return { ok: false, msg: 'Eine Liste mit mind. 3 Einträgen fehlt.' }
        if (!doc.querySelector('a[href]'))
          return { ok: false, msg: 'Ein <code>&lt;a href&gt;</code>-Link fehlt.' }
        const img = doc.querySelector('img')
        if (!img)
          return { ok: false, msg: '<code>&lt;img&gt;</code> fehlt.' }
        if (!img.getAttribute('alt'))
          return { ok: false, msg: 'Das <code>&lt;img&gt;</code> braucht ein <code>alt</code>-Attribut.' }
        if (!doc.querySelector('strong, em'))
          return { ok: false, msg: '<code>&lt;strong&gt;</code> oder <code>&lt;em&gt;</code> fehlt.' }
        return { ok: true }
      },
    },
  ]

  // ── State ──────────────────────────────────────────────────
  function freshState() {
    return { phase: 'start', currentIdx: 0, answers: {}, proUnlocked: false, taskStates: {} }
  }
  let state = freshState()

  // Wird von jedem Renderer gesetzt – speichert Zwischenstand der aktuellen Aufgabe
  let saveCurrentTask = () => {}

  // ── Timer ──────────────────────────────────────────────────
  let timerInterval  = null
  let timerRemaining = 0

  function stopTimer() { clearInterval(timerInterval) }

  function startTimer(total, onTick, onExpire) {
    stopTimer()
    timerRemaining = total
    onTick(timerRemaining, total)
    timerInterval = setInterval(() => {
      timerRemaining--
      onTick(timerRemaining, total)
      if (timerRemaining === 0) { onExpire() }
    }, 1000)
  }

  function tickBar(pane, remaining, total) {
    const fill  = pane.querySelector('.timer-bar-fill')
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
    const m = Math.floor(total / 60), s = String(total % 60).padStart(2, '0')
    return `<div class="timer-wrap">
      <div class="timer-bar"><div class="timer-bar-fill" style="width:100%"></div></div>
      <span class="timer-count">${m}:${s}</span>
    </div>`
  }

  // ── Helpers ────────────────────────────────────────────────
  const PREVIEW_CSS = `body{margin:1.2rem;background:#0f172a;color:#e2e8f0;font-family:'Segoe UI',Arial,sans-serif;line-height:1.7;font-size:1.1rem}h1,h2,h3,h4,h5,h6{color:#f1f5f9}a{color:#22d3ee}p{margin:.65rem 0}ul,ol{margin:.65rem 0}li{margin:.35rem 0}img{max-width:100%;height:auto;border-radius:6px}strong{color:#ffd700;font-weight:700}em{color:#ff9999;font-style:italic}small{font-size:.85em}code{background:rgba(100,200,255,0.2);padding:.1rem .3rem;border-radius:3px;color:#aef}`

  function makePreview(code) {
    const styleTag = `<style>${PREVIEW_CSS}</style>`
    if (/^\s*<!doctype|^\s*<html/i.test(code.trim())) {
      // Vollständiges HTML-Dokument: Style in <head> injizieren
      if (/<\/head>/i.test(code)) return code.replace(/<\/head>/i, `${styleTag}</head>`)
      if (/<head[^>]*>/i.test(code)) return code.replace(/(<head[^>]*>)/i, `$1${styleTag}`)
      return code
    }
    return `<!doctype html><html><head><meta charset="utf-8">${styleTag}</head><body>${code}</body></html>`
  }

  // ── Shuffle array ────────────────────────────────────────
  function shuffle(arr) {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  function advanceOrResults() {
    saveCurrentTask()                                  // Zustand vor dem Wechsel sichern
    if (state.currentIdx >= TASKS.length - 1) { showResults(); return }
    state.currentIdx++
    const next = TASKS[state.currentIdx]
    if (next.isPro && !state.proUnlocked) showProWarning()
    else showTask()
  }

  function updateMeta() {
    if (state.phase !== 'quiz') { quizMetaEl.innerHTML = ''; return }
    const task     = TASKS[state.currentIdx]
    const answered = Object.keys(state.answers).length
    quizMetaEl.innerHTML = `<div class="meta-pills">
      <span class="pill ab-pill">AB${task.ab}</span>
      <span class="pill">${task.isPro ? '⭐ Profi-Aufgabe' : `${state.currentIdx + 1}&thinsp;/&thinsp;${TASKS.length}`}</span>
      <span class="pill">${answered} gelöst</span>
    </div>`
  }

  // ── paneBase: shared scaffold ──────────────────────────────
  function paneBase(task) {
    const pane = document.createElement('section')
    pane.className = 'pane' + (task.isPro ? ' pane-pro' : '')
    pane.innerHTML = `
      <div class="task-header">
        <span class="comp-label">${task.competency}</span>
        <span class="ab-badge">AB${task.ab}</span>
      </div>
      ${timerHTML(task.timeLimit)}
      <div class="question">${task.question}</div>`
    appEl.innerHTML = ''
    appEl.appendChild(pane)
    return pane
  }

  // ── Screen: Start ──────────────────────────────────────────
  function showStart() {
    stopTimer()
    state.phase = 'start'
    updateMeta()
    const individual = TASKS.filter(t => !t.isPro).length
    appEl.innerHTML = `
      <section class="pane quiz-start">
        <h2>Willkommen zum HTML-Quiz!</h2>
        <p>Du hast die Grundlagen abgeschlossen – jetzt zeigst du, was du gelernt hast!</p>
        <div class="info-grid">
          <div class="info-card">
            <span class="info-num">${individual}</span>
            <span class="info-label">Einzelaufgaben</span>
          </div>
          <div class="info-card">
            <span class="info-num">1</span>
            <span class="info-label">Profi-Aufgabe</span>
          </div>
          <div class="info-card">
            <span class="info-num">3</span>
            <span class="info-label">Aufgabentypen</span>
          </div>
        </div>
        <p class="muted-note">Für jede Aufgabe gibt es ein Zeitlimit. Läuft die Zeit ab, siehst du einen Hinweis – du kannst aber weiterarbeiten.</p>
        <button id="btn-start" class="btn-large">Quiz starten ›</button>
      </section>`
    document.getElementById('btn-start').addEventListener('click', () => {
      state.phase      = 'quiz'
      state.currentIdx = 0
      showTask()
    })
  }

  // ── Screen: Task dispatcher ────────────────────────────────
  function showTask() {
    updateMeta()
    stopTimer()
    const task = TASKS[state.currentIdx]
    if      (task.type === 'mc')     renderMC(task)
    else if (task.type === 'sort')   renderSort(task)
    else                             renderEditor(task)
  }

  // ── Renderer: Multiple Choice ──────────────────────────────
  function renderMC(task) {
    const pane  = paneBase(task)
    const saved = state.taskStates[task.id]
    const grid  = document.createElement('div')
    grid.className = 'mc-grid'

    // Shuffle – bei Rückkehr dieselbe Reihenfolge wiederherstellen
    const shuffledIndices = saved?.mcShuffledIndices ?? shuffle([...Array(task.options.length).keys()])
    const shuffledOptions = shuffledIndices.map(i => ({ opt: task.options[i], origIdx: i }))

    let selected = saved?.mcSelected ?? null
    let phase    = saved?.phase ?? 'check'

    shuffledOptions.forEach(({ opt, origIdx }) => {
      const card = document.createElement('button')
      card.className = 'mc-card'
      card.dataset.correctIdx = origIdx
      card.innerHTML = opt
      // Zustand wiederherstellen
      if (phase === 'advance') {
        if (origIdx === task.correct)                       card.classList.add('mc-correct')
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

    const navDiv = document.createElement('div'); navDiv.className = 'nav-btns'
    const fb     = document.createElement('div'); fb.className = 'feedback-inline'
    if (saved?.feedbackHtml) fb.innerHTML = saved.feedbackHtml
    const btn    = document.createElement('button')
    btn.textContent = saved?.btnText ?? 'Antwort prüfen'
    navDiv.appendChild(fb)
    navDiv.appendChild(btn)
    pane.appendChild(navDiv)

    if (phase === 'advance') {
      timerRemaining = saved?.timerSaved ?? 0
      tickBar(pane, timerRemaining, task.timeLimit)
      if (saved?.expired) timerExpiredBanner(pane)
    } else {
      startTimer(saved?.timerSaved ?? task.timeLimit,
        (rem, tot) => tickBar(pane, rem, tot),
        ()         => timerExpiredBanner(pane)
      )
    }

    saveCurrentTask = () => {
      state.taskStates[task.id] = {
        mcShuffledIndices: shuffledIndices,
        mcSelected: selected, phase,
        timerSaved: timerRemaining,
        feedbackHtml: fb.innerHTML,
        btnText: btn.textContent,
        expired: !!pane.querySelector('.timer-expired'),
      }
    }

    btn.addEventListener('click', () => {
      if (phase === 'check') {
        if (selected === null) {
          fb.innerHTML = '<span class="status error">⚠️ Bitte wähle eine Antwort.</span>'
          return
        }
        const correct = selected === task.correct
        state.answers[task.id] = { correct, inTime: timerRemaining > 0 }
        stopTimer()
        grid.querySelectorAll('.mc-card').forEach((c) => {
          const origIdx = parseInt(c.dataset.correctIdx)
          if (origIdx === task.correct) c.classList.add('mc-correct')
          else if (origIdx === selected && !correct) c.classList.add('mc-wrong')
        })
        fb.innerHTML = correct
          ? '<span class="status success">✅ Richtig!</span>'
          : '<span class="status error">❌ Leider nicht – die richtige Antwort ist grün markiert.</span>'
        phase           = 'advance'
        btn.textContent = state.currentIdx === TASKS.length - 1 ? 'Auswertung anzeigen' : 'Weiter ›'
      } else {
        advanceOrResults()
      }
    })
  }

  // ── Renderer: Sort ─────────────────────────────────────────
  function renderSort(task) {
    const pane   = paneBase(task)
    const saved  = state.taskStates[task.id]
    const container = document.createElement('div')
    container.className = 'sort-cards'

    let order = saved?.sortOrder ? [...saved.sortOrder] : task.items.map((_, i) => i)
    let phase = saved?.phase ?? 'check'
    const frozen = phase === 'advance'

    function renderItems() {
      container.innerHTML = ''
      order.forEach((itemIdx, pos) => {
        const card = document.createElement('div')
        card.className  = 'sort-card'
        card.draggable  = !frozen
        card.dataset.pos = pos
        card.innerHTML  = `<span class="drag-handle">☰</span><span class="sort-label">${task.items[itemIdx]}</span>`
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
            const from = parseInt(e.dataTransfer.getData('text/plain'))
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

    const navDiv = document.createElement('div'); navDiv.className = 'nav-btns'
    const fb     = document.createElement('div'); fb.className = 'feedback-inline'
    if (saved?.feedbackHtml) fb.innerHTML = saved.feedbackHtml
    const btn    = document.createElement('button')
    btn.textContent = saved?.btnText ?? 'Reihenfolge prüfen'
    navDiv.appendChild(fb)
    navDiv.appendChild(btn)
    pane.appendChild(navDiv)

    if (phase === 'advance') {
      timerRemaining = saved?.timerSaved ?? 0
      tickBar(pane, timerRemaining, task.timeLimit)
      if (saved?.expired) timerExpiredBanner(pane)
    } else {
      startTimer(saved?.timerSaved ?? task.timeLimit,
        (rem, tot) => tickBar(pane, rem, tot),
        ()         => timerExpiredBanner(pane)
      )
    }

    saveCurrentTask = () => {
      state.taskStates[task.id] = {
        sortOrder: [...order], phase,
        timerSaved: timerRemaining,
        feedbackHtml: fb.innerHTML,
        btnText: btn.textContent,
        expired: !!pane.querySelector('.timer-expired'),
      }
    }

    btn.addEventListener('click', () => {
      if (phase === 'check') {
        const correct = JSON.stringify(order) === JSON.stringify(task.correctOrder)
        state.answers[task.id] = { correct, inTime: timerRemaining > 0 }
        stopTimer()
        container.querySelectorAll('.sort-card').forEach((card, pos) => {
          card.classList.add(order[pos] === task.correctOrder[pos] ? 'sort-correct' : 'sort-wrong')
        })
        fb.innerHTML = correct
          ? '<span class="status success">✅ Perfekte Reihenfolge!</span>'
          : '<span class="status error">❌ Noch nicht ganz – Abweichungen sind rot markiert.</span>'
        phase           = 'advance'
        btn.textContent = state.currentIdx === TASKS.length - 1 ? 'Auswertung anzeigen' : 'Weiter ›'
      } else {
        advanceOrResults()
      }
    })
  }

  // ── Renderer: Editor ───────────────────────────────────────
  function renderEditor(task) {
    const pane  = paneBase(task)
    const saved = state.taskStates[task.id]
    const cols  = document.createElement('div'); cols.className = 'cols'
    const left  = document.createElement('div'); left.className = 'box'
    const right = document.createElement('div'); right.className = 'box'

    const ta = document.createElement('textarea')
    ta.value       = saved?.editorValue ?? (task.starter || '')
    ta.spellcheck  = false
    ta.autocomplete = 'off'

    // Tab support + auto-indent
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = ta.selectionStart
        const end   = ta.selectionEnd
        ta.value = ta.value.slice(0, start) + '\t' + ta.value.slice(end)
        ta.selectionStart = ta.selectionEnd = start + 1
      } else if (e.key === 'Enter') {
        const lines = ta.value.slice(0, ta.selectionStart).split('\n')
        const currentLine = lines[lines.length - 1]
        const indent = currentLine.match(/^(\s*)/)[1]
        setTimeout(() => {
          if (ta.selectionStart === ta.selectionEnd) {
            const s = ta.selectionStart
            if (ta.value[s - 1] === '\n' && ta.value[s] !== '\t' && ta.value[s] !== ' ') {
              ta.value = ta.value.slice(0, s) + indent + ta.value.slice(s)
              ta.selectionStart = ta.selectionEnd = s + indent.length
            }
          }
        }, 10)
      }
    })
    left.appendChild(ta)

    const btnRow   = document.createElement('div'); btnRow.className = 'btn-row'
    const checkBtn = document.createElement('button'); checkBtn.textContent = 'Code prüfen'
    const nextBtn  = document.createElement('button')
    nextBtn.textContent = state.currentIdx === TASKS.length - 1 ? 'Auswertung anzeigen' : 'Weiter ›'
    const fb = document.createElement('div'); fb.className = 'feedback-inline'

    // Zustand wiederherstellen
    let phase = saved?.phase ?? 'check'
    if (phase === 'advance') {
      nextBtn.className = ''         // primary
      checkBtn.disabled = true
    } else {
      nextBtn.className = 'secondary'
    }
    if (saved?.feedbackHtml) fb.innerHTML = saved.feedbackHtml

    btnRow.appendChild(checkBtn)
    btnRow.appendChild(nextBtn)
    btnRow.appendChild(fb)
    left.appendChild(btnRow)

    right.innerHTML = '<h3>Live-Vorschau</h3>'
    const iframe = document.createElement('iframe')
    iframe.id      = 'preview'
    iframe.sandbox = 'allow-same-origin'
    right.appendChild(iframe)

    cols.appendChild(left)
    cols.appendChild(right)
    pane.appendChild(cols)

    function updatePreview() { iframe.srcdoc = makePreview(ta.value) }
    let debounce
    ta.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(updatePreview, 250) })
    updatePreview()

    if (phase === 'advance') {
      timerRemaining = saved?.timerSaved ?? 0
      tickBar(pane, timerRemaining, task.timeLimit)
      if (saved?.expired) timerExpiredBanner(pane)
    } else {
      startTimer(saved?.timerSaved ?? task.timeLimit,
        (rem, tot) => tickBar(pane, rem, tot),
        ()         => timerExpiredBanner(pane)
      )
    }

    saveCurrentTask = () => {
      state.taskStates[task.id] = {
        editorValue: ta.value, phase,
        timerSaved: timerRemaining,
        feedbackHtml: fb.innerHTML,
        expired: !!pane.querySelector('.timer-expired'),
      }
    }

    checkBtn.addEventListener('click', () => {
      const parser = new DOMParser()
      const doc    = parser.parseFromString(ta.value, 'text/html')
      const result = task.validate(doc, ta.value)
      if (result.ok) {
        fb.innerHTML = '<span class="status success">✅ Richtig!</span>'
        state.answers[task.id] = { correct: true, inTime: timerRemaining > 0 }
        stopTimer()                    // Timer stoppen sobald Aufgabe gelöst
        phase             = 'advance'
        nextBtn.className = ''         // primary
        checkBtn.disabled = true
      } else {
        fb.innerHTML = `<span class="status error">❌ ${result.msg}</span>`
        if (!state.answers[task.id])
          state.answers[task.id] = { correct: false, inTime: false }
      }
    })

    nextBtn.addEventListener('click', () => {
      if (!state.answers[task.id])
        state.answers[task.id] = { correct: false, inTime: false }
      advanceOrResults()
    })
  }

  // ── Screen: Results ────────────────────────────────────────
  function showResults() {
    stopTimer()
    state.phase = 'results'
    updateMeta()

    const total   = TASKS.length
    const correct = Object.values(state.answers).filter(a => a.correct).length

    // Show correct answers first, then incorrect
    const sorted = [...TASKS].sort((a, b) => {
      const aOk = state.answers[a.id]?.correct ? 1 : 0
      const bOk = state.answers[b.id]?.correct ? 1 : 0
      return bOk - aOk
    })

    const rows = sorted.map(task => {
      const ans    = state.answers[task.id]
      const ok     = ans?.correct
      const inTime = ans?.inTime
      return `<div class="result-row ${ok ? 'r-ok' : 'r-fail'}">
        <span class="r-icon">${ok ? '✅' : '❌'}</span>
        <div class="r-info">
          <strong>${task.competency}${task.isPro ? ' ⭐' : ''}</strong>
          <span class="r-meta">AB${task.ab} &nbsp;·&nbsp; ${inTime ? '⏱ innerhalb der Zeit' : 'nach Ablauf der Zeit'}</span>
        </div>
        <span class="ab-badge">AB${task.ab}</span>
      </div>`
    }).join('')

    appEl.innerHTML = `
      <section class="pane results-pane">
        <h2>🎉 Quiz abgeschlossen!</h2>
        <div class="score-banner">
          <span class="score-num">${correct}</span>
          <span class="score-sep">/</span>
          <span class="score-total">${total}</span>
          <span class="score-label">Aufgaben richtig gelöst</span>
        </div>
        <h3>Ergebnisse im Detail</h3>
        <div class="result-list">${rows}</div>
        <button id="btn-restart" style="margin-top:1.5rem">Quiz neu starten</button>
      </section>`

    document.getElementById('btn-restart').addEventListener('click', () => {
      state = freshState()
      showStart()
    })
  }

  // ── Modal: Pro-task warning ────────────────────────────────
  function showProWarning() {    stopTimer()                                        // Timer pausieren während Modal sichtbar    overlayEl.classList.remove('hidden')
    modalConfirm.onclick = () => {
      overlayEl.classList.add('hidden')
      state.proUnlocked = true
      showTask()
    }
    modalCancel.onclick = () => {
      overlayEl.classList.add('hidden')
      state.currentIdx-- // go back to last regular task
      showTask()
    }
  }

  // ── Init ───────────────────────────────────────────────────
  showStart()
})()
