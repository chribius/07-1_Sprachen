(()=>{
  const root = document.getElementById('app')
  const progressEl = document.getElementById('progress')

  const STORAGE_KEY = 'css-grundlagen-module-state'
  const COMPLETED_KEY = 'css-grundlagen-completed'

  function stripComments(source) {
    return source.replace(/\/\*[\s\S]*?\*\//g, '')
  }

  function checkCssSyntax(source) {
    const css = stripComments(source)
    let depth = 0
    for (let i = 0; i < css.length; i++) {
      if (css[i] === '{') depth++
      if (css[i] === '}') depth--
      if (depth < 0) return 'Es gibt eine schließende } ohne passende öffnende {'
    }
    if (depth !== 0) return 'Mindestens eine CSS-Klammer { } ist nicht korrekt geschlossen.'

    const blocks = css.match(/[^{}]+\{[^{}]*\}/g) || []
    if (blocks.length === 0) return 'Schreibe mindestens eine CSS-Regel mit Selektor, { }, Eigenschaft und Wert.'

    for (const block of blocks) {
      const body = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}')).trim()
      if (!body) return 'Eine CSS-Regel ist leer. In jede Regel gehoeren Eigenschaften und Werte.'
      const lines = body.split(';').map(line => line.trim()).filter(Boolean)
      for (const line of lines) {
        if (!line.includes(':')) return `In der Deklaration "${line}" fehlt ein Doppelpunkt.`
      }
    }
    return null
  }

  function hasSelector(source, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`${escaped}\\s*\\{`, 'i')
    return re.test(source)
  }

  function hasProperty(source, property) {
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`${escaped}\\s*:`, 'i').test(source)
  }

  function hasPropertyInSelector(source, selector, property) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`, 'i'))
    if (!match) return false
    return new RegExp(`${property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`, 'i').test(match[1])
  }

  function escapeHtml(text) {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  function loadCompletedStations() {
    try {
      const data = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]')
      return new Set(Array.isArray(data) ? data : [])
    } catch {
      return new Set()
    }
  }

  function saveCompletedStations() {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...completedStations]))
  }

  function loadEditorState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  }

  function saveEditorState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  const completedStations = loadCompletedStations()

  const modules = [
    {
      id: 'start',
      title: 'Willkommen in der Designmission',
      kind: 'info',
      text: `Auf der Schatzinsel steht diesmal nicht die Struktur im Mittelpunkt, sondern das <span class="important">Aussehen</span>. Mit CSS gibst du der Fundkarte Farben, Schriften, Abstände und ein Layout.`,
    },
    {
      id: 'mission',
      title: 'Die Mission der Schatzkarte',
      kind: 'info',
      text: `Die HTML-Seite aus dem letzten Abenteuer war die reine Struktur. Jetzt wird daraus eine lesbare, schöne und auf dem Handy brauchbare Schatzkarte.`,
    },
    {
      id: 'editor',
      title: 'So arbeitest du im CSS-Editor',
      kind: 'info',
      text: `Du schreibst links CSS. Rechts siehst du immer HTML-Quelle und Live-Vorschau. So wird klar: HTML liefert den Inhalt, CSS gestaltet ihn.`,
    },
    {
      id: 'hilfe',
      title: 'Hilfe',
      kind: 'info',
      text: `<ul>
        <li>Links schreibst du CSS-Regeln.</li>
        <li>Rechts stehen HTML-Code und Live-Vorschau.</li>
        <li>Mit "Code überprüfen" bekommst du fachliche Rückmeldung.</li>
      </ul>`,
    },
    {
      id: '1',
      title: '1. Was ist CSS?',
      kind: 'info',
      text: `<span class="important">CSS</span> steht für <span class="inline-code">Cascading Style Sheets</span>. Es bestimmt das Design einer Webseite: Farben, Schriftgrößen, Abstände, Rahmen und vieles mehr. HTML sagt: <em>Das ist eine Überschrift.</em> CSS sagt: <em>So soll diese Überschrift aussehen.</em><div class="tip-box">Merke: HTML = Inhalt und Struktur. CSS = Gestaltung und Darstellung.</div>`,
    },
    {
      id: '2',
      title: '2. Inhalt und Design trennen',
      kind: 'demo-separation',
      text: `Schlechte Trennung bedeutet: Style steckt direkt im HTML (inline) und der Inhalt muss für hell/dunkel doppelt gepflegt werden. Gute Trennung bedeutet: ein HTML-Inhalt, verschiedene CSS-Dateien.`,
      badHtml: `<section style="font-family: Arial, sans-serif; background: #fff7ed; color: #7c2d12; border: 2px solid #f97316; padding: 14px; border-radius: 10px;">
  <h1 style="margin-top: 0;">Schatznotiz (hell)</h1>
  <p>Heute habe ich am Morgen eine halb vergrabene Karte gefunden.</p>
  <p>Auf der Rückseite steht: "Folge den drei Felsen bis zur Bucht".</p>
</section>

<section style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; border: 2px solid #5fb4ff; padding: 14px; border-radius: 10px; margin-top: 10px;">
  <h1 style="margin-top: 0; color: #93c5fd;">Schatznotiz (dunkel)</h1>
  <p>Heute habe ich am Morgen eine halb vergrabene Karte gefunden.</p>
  <p>Auf der Rückseite steht: "Folge den drei Felsen bis zur Bucht".</p>
</section>`,
      badCss: `/* Fast leer: Das meiste Styling steckt direkt im HTML. */
/* Nachteil: Inhalt und Styling sind vermischt und du pflegst schnell doppelt. */`,
      goodHtml: `<section class="story-preview">
  <h1>Schatznotiz vom Südstrand</h1>
  <p>Heute habe ich am Morgen eine halb vergrabene Karte gefunden.</p>
  <p>Auf der Rückseite steht: "Folge den drei Felsen bis zur Bucht".</p>
</section>`,
      goodThemes: {
        sonne: `.story-preview {
  font-family: "Trebuchet MS", Arial, sans-serif;
  background: linear-gradient(180deg, #fff0c9, #ffe2a8);
  color: #07233d;
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
}

.story-preview h1 {
  color: #92400e;
  margin-top: 0;
}`,
        nacht: `.story-preview {
  font-family: "Segoe UI", Arial, sans-serif;
  background: linear-gradient(180deg, #13223f, #07111f);
  color: #e2e8f0;
  border: 2px solid #5fb4ff;
  border-radius: 12px;
  padding: 16px;
}

.story-preview h1 {
  color: #93c5fd;
  margin-top: 0;
}`,
      },
    },
    {
      id: '3',
      title: '3. CSS-Syntax und Semantik',
      kind: 'editor',
      task: `In CSS gibt es <strong>Regeln</strong>. Eine Regel besteht aus <span class="inline-code">Selektor { Eigenschaft: Wert; }</span>.<br><br><span class="important">Semantik von <span class="inline-code">color</span>:</span> Die Eigenschaft <span class="inline-code">color</span> färbt die <strong>Textfarbe</strong> eines Elements (nicht den Hintergrund).`,
      html: `<section><h1>Schatzsuche im Morgennebel</h1><p>Am frühen Morgen rollen dichte Nebelschwaden über den Strand.</p><p>Im nassen Sand entdecke ich die ersten Spuren zur geheimen Bucht.</p></section>`,
      starter: `h1 {
  color: #ffd166;
}

p {
  color: #dbeafe;
}`,
      validate(source) {
        const syntaxError = checkCssSyntax(source)
        if (syntaxError) return { ok: false, message: syntaxError }
        if (!hasSelector(source, 'h1')) return { ok: false, message: 'Es fehlt eine CSS-Regel für h1.' }
        if (!hasSelector(source, 'p')) return { ok: false, message: 'Es fehlt eine CSS-Regel für p.' }
        if (!hasPropertyInSelector(source, 'h1', 'color')) return { ok: false, message: 'Setze für h1 ausdrücklich die Eigenschaft color.' }
        return { ok: true, message: 'Syntax und Semantik sind korrekt.' }
      },
    },
    {
      id: '4',
      title: '4. Selektoren, Eigenschaften und Werte',
      kind: 'editor',
      task: `In dieser Station arbeitest du <strong>ohne Klassen und IDs</strong> nur mit Typselektoren wie <span class="inline-code">body</span>, <span class="inline-code">h1</span> und <span class="inline-code">p</span>.`,
      html: `<section><h1>Fund im Felsentor</h1><p>Die Karte zeigt einen Pfad aus drei Steinbögen.</p><p>Beim letzten Bogen beginnt ein schmaler Geheimgang.</p></section>`,
      starter: `h1 {
  color: #93c5fd;
}

p {
  color: #e2e8f0;
}`,
      validate(source) {
        const syntaxError = checkCssSyntax(source)
        if (syntaxError) return { ok: false, message: syntaxError }
        if (/(^|[\s,{])\.[a-zA-Z_-][\w-]*\s*\{/m.test(source)) return { ok: false, message: 'Nutze hier keine Klassen-Selektoren.' }
        if (!hasSelector(source, 'h1')) return { ok: false, message: 'Es fehlt eine Regel für h1.' }
        if (!hasSelector(source, 'p')) return { ok: false, message: 'Es fehlt eine Regel für p.' }
        if (!hasProperty(source, 'color') && !hasProperty(source, 'background-color')) return { ok: false, message: 'Nutze mindestens color oder background-color.' }
        return { ok: true, message: 'Selektor, Eigenschaft und Wert sind korrekt eingesetzt.' }
      },
    },
    {
      id: '5',
      title: '5. Wichtige Eigenschaften und Semantik',
      kind: 'editor',
      task: `Nutze und verstehe: <span class="inline-code">background-color</span>, <span class="inline-code">font-weight</span>, <span class="inline-code">font-size</span>, <span class="inline-code">font-family</span>.<br><br>Nutze außerdem mindestens einmal <span class="inline-code">rgba(...)</span>.<br><span class="important">Der vierte rgba-Wert ist die Transparenz (Alpha): 0 = unsichtbar, 1 = voll sichtbar.</span>`,
      html: `<section><h1>Das Tagebuch des Kapitäns</h1><p>Heute fand ich eine eingerissene Karte mit merkwürdigen Zeichen.</p><p>Am Rand stand in kleiner Schrift ein wichtiger Warnhinweis.</p></section>`,
      starter: `body {
  font-family: Georgia, serif;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
}

p {
  background-color: rgba(96, 165, 250, 0.18);
}`,
      validate(source) {
        const syntaxError = checkCssSyntax(source)
        if (syntaxError) return { ok: false, message: syntaxError }
        if (!hasProperty(source, 'background-color')) return { ok: false, message: 'background-color fehlt.' }
        if (!hasProperty(source, 'font-weight')) return { ok: false, message: 'font-weight fehlt.' }
        if (!hasProperty(source, 'font-size')) return { ok: false, message: 'font-size fehlt.' }
        if (!hasProperty(source, 'font-family')) return { ok: false, message: 'font-family fehlt.' }
        if (!/rgba\s*\(/i.test(source)) return { ok: false, message: 'Nutze mindestens einmal rgba(...).' }
        return { ok: true, message: 'Sehr gut: Eigenschaften und Transparenz sind korrekt eingesetzt.' }
      },
    },
    {
      id: '6',
      title: '6. Werte sinnvoll wählen',
      kind: 'editor',
      task: `Arbeite mit mindestens drei dieser Eigenschaften: <span class="inline-code">line-height</span>, <span class="inline-code">padding</span>, <span class="inline-code">border</span>, <span class="inline-code">border-radius</span>, <span class="inline-code">max-width</span>. Nutze dabei nur Typselektoren.`,
      html: `<section><h1>Schatzlager</h1><p>Die Karte ist nur nützlich, wenn Hinweise gut lesbar bleiben.</p><p>Mit passenden Werten wirken Text und Bereiche klar strukturiert.</p></section>`,
      starter: `section {
  line-height: 1.7;
  padding: 1rem;
  border: 1px solid rgba(147, 197, 253, 0.45);
}`,
      validate(source) {
        const syntaxError = checkCssSyntax(source)
        if (syntaxError) return { ok: false, message: syntaxError }
        if (/(^|[\s,{])\.[a-zA-Z_-][\w-]*\s*\{/m.test(source)) return { ok: false, message: 'Nutze hier keine Klassen-Selektoren.' }
        const checks = ['line-height', 'padding', 'border', 'border-radius', 'max-width']
        const count = checks.filter(prop => hasProperty(source, prop)).length
        if (count < 3) return { ok: false, message: 'Nutze mindestens drei der genannten Eigenschaften mit sinnvollen Werten.' }
        return { ok: true, message: 'Du verwendest Werte gezielt für bessere Lesbarkeit.' }
      },
    },
    {
      id: '7',
      title: '7. Responsive Webdesign',
      kind: 'editor',
      task: `Eine gute Schatzkarte muss auch auf kleinen Bildschirmen lesbar bleiben. Nutze <strong>@media</strong> und <strong>max-width</strong>. In der Vorschau kannst du die Breite über Buttons oder per Maus ändern.`,
      html: `<section><h1>Notfallkarte</h1><p>Diese Karte soll auf großen Geräten luftig aussehen.</p><p>Auf kleineren Bildschirmen müssen Schriftgröße, Abstände oder Breite angepasst werden.</p></section>`,
      starter: `section {
  max-width: 720px;
  padding: 2rem;
}

@media (max-width: 700px) {
  section {
    padding: 1rem;
  }
}`,
      validate(source) {
        const syntaxError = checkCssSyntax(source)
        if (syntaxError) return { ok: false, message: syntaxError }
        if (/(^|[\s,{])\.[a-zA-Z_-][\w-]*\s*\{/m.test(source)) return { ok: false, message: 'Nutze hier keine Klassen-Selektoren.' }
        if (!/@media/i.test(source)) return { ok: false, message: 'Es fehlt eine @media-Regel.' }
        if (!/max-width\s*:/i.test(source) && !/@media\s*\([^)]*max-width/i.test(source)) return { ok: false, message: 'Nutze max-width in einer Regel oder in der @media-Bedingung.' }
        if (!hasSelector(source, 'section')) return { ok: false, message: 'Es fehlt eine Regel für section.' }
        return { ok: true, message: 'Deine Schatzkarte reagiert jetzt auf kleinere Bildschirme.' }
      },
    },
    {
      id: 'abschluss',
      title: 'Abschluss & Nächste Mission',
      kind: 'info',
      text: `Du hast gelernt, wie CSS Inhalt gestaltet, wie gute Trennung von Inhalt und Design funktioniert und wie Webseiten auch auf kleinen Bildschirmen lesbar bleiben. Als Nächstes wartet der <strong>CSS-Quiz</strong>: <a href="../css-quiz/index.html">Direkt zum CSS-Quiz</a>.`,
    },
  ]

  function getModuleByHash() {
    const hash = location.hash.replace('#/', '') || 'start'
    if (hash.startsWith('modul/')) {
      const key = hash.split('/')[1]
      return modules.find(m => m.id === key) || modules[0]
    }
    return modules.find(m => m.id === hash) || modules[0]
  }

  function updateProgress() {
    const done = completedStations.size
    const total = modules.filter(m => m.kind === 'editor').length
    progressEl.textContent = `Fertig: ${done}/${total} Praxisstationen`
  }

  function setActiveNavLink() {
    const rawHash = location.hash || '#/start'
    const currentHash = rawHash.startsWith('#/modul/') ? '#/editor' : rawHash
    document.querySelectorAll('.topnav a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === currentHash)
    })
  }

  function setActiveSidebarLink() {
    const rawHash = location.hash || '#/start'
    document.querySelectorAll('.sidebar a').forEach(link => {
      const href = link.getAttribute('href')
      link.classList.toggle('active', href === rawHash)
      if (href.startsWith('#/modul/')) {
        const moduleId = href.replace('#/modul/', '')
        link.classList.toggle('completed', completedStations.has(moduleId))
      }
    })
  }

  function showStatus(place, status, text) {
    place.innerHTML = `<span class="status ${status ? 'success' : 'error'}">${status ? '✅' : '⚠️'} ${text}</span>`
  }

  function makePreviewDoc(mod, css) {
    const baseCss = `
      body { margin: 0; padding: 1.25rem; background: #0f172a; color: #e2e8f0; font-family: 'Inter', Arial, sans-serif; line-height: 1.6; }
      .preview-shell { max-width: 860px; margin: 0 auto; background: linear-gradient(180deg, #13223d, #0a1321); border: 1px solid rgba(125, 170, 220, 0.35); border-radius: 18px; padding: 1.2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.25); }
      section { background: rgba(255,255,255,0.03); border-radius: 14px; padding: 1rem 1.1rem; }
      section h1 { margin-top: 0; }
      section p { margin: 0.55rem 0; }
      .story-preview { background: rgba(255,255,255,0.03); border-radius: 14px; padding: 1rem 1.1rem; }
      .story-preview h1 { margin-top: 0; }
      .story-preview p { margin: 0.55rem 0; }
    `
    return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseCss}${css}</style></head><body><div class="preview-shell">${mod.html}</div></body></html>`
  }

  function makeStation2Preview(html, css) {
    const baseCss = `
      body { margin: 0; padding: 1rem; background: #0f172a; color: #e2e8f0; }
      .preview-shell { max-width: 840px; margin: 0 auto; }
    `
    return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseCss}${css}</style></head><body><div class="preview-shell">${html}</div></body></html>`
  }

  function renderInfoModule(mod, pane) {
    const p = document.createElement('div')
    p.innerHTML = `<p>${mod.text}</p>${mod.extra || ''}`
    pane.appendChild(p)
    root.appendChild(pane)
    updateProgress()
  }

  function renderSeparationDemo(mod, pane) {
    const intro = document.createElement('p')
    intro.innerHTML = mod.text
    pane.appendChild(intro)

    const cols = document.createElement('div')
    cols.className = 'cols'
    const left = document.createElement('div')
    left.className = 'box'
    const right = document.createElement('div')
    right.className = 'box'

    const editorState = loadEditorState()
    const storedMode = editorState['2-mode'] || 'bad'
    const storedTheme = editorState['2-theme'] || 'sonne'

    left.innerHTML = '<h3>HTML-Code</h3>'
    const htmlInput = document.createElement('textarea')
    htmlInput.className = 'code-input'
    htmlInput.style.minHeight = '220px'
    left.appendChild(htmlInput)

    const controls = document.createElement('div')
    controls.className = 'demo-controls'
    const modeLabel = document.createElement('label')
    modeLabel.textContent = 'Beispiel:'
    const modeSelect = document.createElement('select')
    modeSelect.innerHTML = '<option value="bad">Schlechte Trennung</option><option value="good">Gute Trennung</option>'
    const themeLabel = document.createElement('label')
    themeLabel.textContent = 'Style:'
    const themeSelect = document.createElement('select')
    themeSelect.innerHTML = '<option value="sonne">Sonnendesign</option><option value="nacht">Nachtdesign</option>'
    modeSelect.value = storedMode
    themeSelect.value = storedTheme
    controls.appendChild(modeLabel)
    controls.appendChild(modeSelect)
    controls.appendChild(themeLabel)
    controls.appendChild(themeSelect)
    left.appendChild(controls)

    const cssTitle = document.createElement('h3')
    cssTitle.textContent = 'CSS-Code'
    left.appendChild(cssTitle)
    const cssInput = document.createElement('textarea')
    cssInput.className = 'code-input'
    cssInput.style.minHeight = '220px'
    left.appendChild(cssInput)

    right.innerHTML = '<h3>Live-Vorschau</h3>'
    const preview = document.createElement('iframe')
    preview.id = 'preview'
    preview.sandbox = 'allow-same-origin'
    right.appendChild(preview)

    function stateKey(prefix) {
      return `2-${prefix}`
    }

    function getCurrentDefaults() {
      const isGood = modeSelect.value === 'good'
      const theme = themeSelect.value
      const defaults = {
        html: isGood ? mod.goodHtml : mod.badHtml,
        css: isGood ? mod.goodThemes[theme] : mod.badCss,
      }
      return { isGood, theme, defaults }
    }

    function loadEditorsFromState() {
      const { isGood, theme, defaults } = getCurrentDefaults()
      const htmlKey = isGood ? stateKey('good-html') : stateKey('bad-html')
      const cssKey = isGood ? stateKey(`good-css-${theme}`) : stateKey('bad-css')
      const latestState = loadEditorState()
      htmlInput.value = latestState[htmlKey] != null ? latestState[htmlKey] : defaults.html
      cssInput.value = latestState[cssKey] != null ? latestState[cssKey] : defaults.css
    }

    function saveEditorsToState() {
      const { isGood, theme } = getCurrentDefaults()
      const htmlKey = isGood ? stateKey('good-html') : stateKey('bad-html')
      const cssKey = isGood ? stateKey(`good-css-${theme}`) : stateKey('bad-css')
      const latestState = loadEditorState()
      latestState[htmlKey] = htmlInput.value
      latestState[cssKey] = cssInput.value
      latestState[stateKey('mode')] = modeSelect.value
      latestState[stateKey('theme')] = themeSelect.value
      saveEditorState(latestState)
    }

    function renderDemo() {
      const { isGood } = getCurrentDefaults()
      themeLabel.style.display = isGood ? 'inline-block' : 'none'
      themeSelect.style.display = isGood ? 'inline-block' : 'none'
      preview.srcdoc = makeStation2Preview(htmlInput.value, cssInput.value)
    }

    modeSelect.addEventListener('change', () => {
      loadEditorsFromState()
      saveEditorsToState()
      renderDemo()
    })

    themeSelect.addEventListener('change', () => {
      loadEditorsFromState()
      saveEditorsToState()
      renderDemo()
    })

    let demoTimer
    function handleEditorInput() {
      clearTimeout(demoTimer)
      demoTimer = setTimeout(() => {
        saveEditorsToState()
        renderDemo()
      }, 120)
    }

    htmlInput.addEventListener('input', handleEditorInput)
    cssInput.addEventListener('input', handleEditorInput)

    cols.appendChild(left)
    cols.appendChild(right)
    pane.appendChild(cols)
    root.appendChild(pane)
    updateProgress()
    loadEditorsFromState()
    renderDemo()
  }

  function renderModule(mod) {
    root.innerHTML = ''
    const pane = document.createElement('section')
    pane.className = 'pane'
    pane.innerHTML = `<h2>${mod.title}</h2>`

    if (mod.kind === 'info') {
      renderInfoModule(mod, pane)
      return
    }

    if (mod.kind === 'demo-separation') {
      renderSeparationDemo(mod, pane)
      return
    }

    const desc = document.createElement('p')
    desc.innerHTML = mod.task
    pane.appendChild(desc)

    const cols = document.createElement('div')
    cols.className = 'cols'
    const left = document.createElement('div')
    left.className = 'box'
    const right = document.createElement('div')
    right.className = 'box'

    left.innerHTML = '<h3>HTML-Quelle</h3>'
    const htmlCode = document.createElement('pre')
    htmlCode.className = 'code-view'
    htmlCode.classList.add('html-source-view')
    htmlCode.innerHTML = escapeHtml(mod.html)
    left.appendChild(htmlCode)

    const cssTitle = document.createElement('h3')
    cssTitle.textContent = 'CSS-Code'
    left.appendChild(cssTitle)

    const codeInput = document.createElement('textarea')
    codeInput.className = 'code-input'
    const editorState = loadEditorState()
    codeInput.value = editorState[mod.id] != null ? editorState[mod.id] : mod.starter
    left.appendChild(codeInput)

    const controls = document.createElement('div')
    controls.className = 'controls'
    const checkBtn = document.createElement('button')
    checkBtn.textContent = 'Code überprüfen'
    const resetBtn = document.createElement('button')
    resetBtn.className = 'secondary'
    resetBtn.textContent = 'Zurücksetzen'
    const feedback = document.createElement('div')
    feedback.className = 'feedback'
    controls.appendChild(checkBtn)
    controls.appendChild(resetBtn)
    left.appendChild(controls)
    left.appendChild(feedback)

    const previewTitle = document.createElement('h3')
    previewTitle.textContent = 'Live-Vorschau'
    right.appendChild(previewTitle)

    const previewWrap = document.createElement('div')
    previewWrap.className = 'preview-wrap'

    if (mod.id === '7') {
      const widthTools = document.createElement('div')
      widthTools.className = 'preview-tools'
      widthTools.innerHTML = `
        <button type="button" class="secondary" data-width="360">360px</button>
        <button type="button" class="secondary" data-width="520">520px</button>
        <button type="button" class="secondary" data-width="768">768px</button>
        <button type="button" class="secondary" data-width="980">980px</button>
        <button type="button" class="secondary" data-width="100%">100%</button>
        <span class="width-indicator">Breite: -</span>`
      right.appendChild(widthTools)

      previewWrap.classList.add('preview-resizable')
      const dragHandle = document.createElement('div')
      dragHandle.className = 'preview-drag-handle'
      dragHandle.textContent = '◀ ziehen ▶'

      const widthIndicator = widthTools.querySelector('.width-indicator')

      function updateWidthLabel() {
        widthIndicator.textContent = `Breite: ${Math.round(previewWrap.getBoundingClientRect().width)}px`
      }

      function saveWidth(value) {
        const state = loadEditorState()
        state[`${mod.id}-previewWidth`] = value
        saveEditorState(state)
      }

      function setPreviewWidth(value, persist = true) {
        if (value === '100%') {
          previewWrap.style.width = '100%'
          if (persist) saveWidth('100%')
          updateWidthLabel()
          return
        }

        const maxWidth = Math.max(320, Math.floor(right.clientWidth - 20))
        const px = Math.min(maxWidth, Math.max(280, parseInt(String(value).replace('px', ''), 10) || 280))
        previewWrap.style.width = `${px}px`
        if (persist) saveWidth(`${px}px`)
        updateWidthLabel()
      }

      const savedWidth = editorState[`${mod.id}-previewWidth`] || '100%'
      previewWrap.style.width = savedWidth

      widthTools.querySelectorAll('button[data-width]').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-width')
          setPreviewWidth(value)
        })
      })

      let dragging = false
      let dragStartX = 0
      let dragStartWidth = 0

      dragHandle.addEventListener('pointerdown', event => {
        event.preventDefault()
        dragging = true
        dragStartX = event.clientX
        dragStartWidth = previewWrap.getBoundingClientRect().width
        previewWrap.classList.add('is-dragging')
        dragHandle.setPointerCapture(event.pointerId)
      })

      dragHandle.addEventListener('pointermove', event => {
        if (!dragging) return
        const delta = event.clientX - dragStartX
        setPreviewWidth(`${Math.round(dragStartWidth + delta)}px`, false)
      })

      function stopDragging() {
        if (!dragging) return
        dragging = false
        previewWrap.classList.remove('is-dragging')
        saveWidth(`${Math.round(previewWrap.getBoundingClientRect().width)}px`)
      }

      dragHandle.addEventListener('pointerup', stopDragging)
      dragHandle.addEventListener('pointercancel', stopDragging)

      const ro = new ResizeObserver(updateWidthLabel)
      ro.observe(previewWrap)

      right.appendChild(dragHandle)
      setTimeout(updateWidthLabel, 0)
    }

    const preview = document.createElement('iframe')
    preview.id = 'preview'
    preview.sandbox = 'allow-same-origin'
    previewWrap.appendChild(preview)
    right.appendChild(previewWrap)

    cols.appendChild(left)
    cols.appendChild(right)
    pane.appendChild(cols)
    root.appendChild(pane)
    updateProgress()

    function renderPreview() {
      preview.srcdoc = makePreviewDoc(mod, codeInput.value)
    }

    let timer
    codeInput.addEventListener('input', () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        renderPreview()
        const state = loadEditorState()
        state[mod.id] = codeInput.value
        saveEditorState(state)
      }, 200)
    })

    resetBtn.addEventListener('click', () => {
      codeInput.value = mod.starter
      const state = loadEditorState()
      state[mod.id] = mod.starter
      saveEditorState(state)
      renderPreview()
      feedback.innerHTML = ''
    })

    checkBtn.addEventListener('click', () => {
      const result = mod.validate(codeInput.value)
      if (result.ok) {
        showStatus(feedback, true, result.message)
        completedStations.add(mod.id)
        saveCompletedStations()
        updateProgress()
        setActiveSidebarLink()
      } else {
        showStatus(feedback, false, result.message)
      }
    })

    renderPreview()
  }

  function router() {
    renderModule(getModuleByHash())
    setActiveNavLink()
    setActiveSidebarLink()
  }

  window.addEventListener('hashchange', router)
  document.addEventListener('click', () => {
    setActiveNavLink()
    setActiveSidebarLink()
  })

  const resetButton = document.getElementById('reset-btn')
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(COMPLETED_KEY)
      completedStations.clear()
      updateProgress()
      setActiveSidebarLink()
      setActiveNavLink()
      location.hash = '#/start'
      router()
    })
  }

  router()
})()