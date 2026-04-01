(()=>{
  const root = document.getElementById('app')
  const progressEl = document.getElementById('progress')

  function checkTagNesting(source, tags){
    const tokenRe = /<\/?([a-z0-9]+)(\s[^>]*)?>/gi
    const selfClosing = new Set(['img','br','hr','meta','link','input'])
    const stack = []
    let match
    while((match = tokenRe.exec(source)) !== null){
      const raw = match[0]
      const tag = match[1].toLowerCase()
      const isClose = raw.startsWith('</')
      if(!tags.includes(tag)) continue
      if(!isClose){
        if(!selfClosing.has(tag)) stack.push(tag)
      } else {
        if(stack.length === 0) {
          return {ok:false, message:`Überflüssiges &lt;/${tag}&gt; gefunden.`}
        }
        const top = stack[stack.length-1]
        if(top === tag){
          stack.pop()
        } else {
          return {ok:false, message:`Schachtelungsfehler: Erwarte &lt;/${top}&gt; bevor &lt;/${tag}&gt;.`}
        }
      }
    }
    if(stack.length>0){
      const openTag = stack.pop()
      return {ok:false, message:`Es fehlt das schließende &lt;/${openTag}&gt; für ein geöffnetes &lt;${openTag}&gt;.`}
    }
    return {ok:true}
  }

  const modules = [
    {
      id: 'start',
      title: 'Willkommen auf der Code-Insel',
      kind: 'info',
      text: `Stell dir vor: Du bist auf einer Insel, auf der HTML-Schätze versteckt sind.
      In sechs Missionen lernst du Schritt für Schritt, wie man HTML-Texte, Listen, Links und Bilder aufbaust.
      Jede Station gibt dir Live-Feedback und zeigt Ankerpunkte für die nächste Etappe.`,
      check: ()=>({ok:true, message:'Bereit für die Reise!'}),
    },
    {
      id: 'abenteuer',
      title: 'Abenteuerthema: Schatzinsel-Expedition',
      kind: 'info',
      text: `Du bist Entdecker:in auf einer geheimnisvollen Insel. Jeder HTML-Baustein hilft dir, Karten, Notizen und Hinweise zu bauen.
      Du erkennst: HTML ist die Sprache, die Webseiten strukturiert und sie für Menschen und Maschinen lebendig macht.`,
      check: ()=>({ok:true, message:'Geschichte geladen'}),
    },
    {
      id: 'editor',
      title: 'Editor-Übersicht',
      kind: 'info',
      text: `Hier wählst du Aufgaben in der Sidebar aus und probierst sie im Split View aus. 
      Für jede Station gibt es unten einen Code-Check und Live-Preview.`,
      check: ()=>({ok:true, message:'Editor sichtbar'})
    },
    {
      id: 'hilfe',
      title: 'Hilfe',
      kind: 'info',
      text: `<ul>
        <li>Nutze die Sidebar, um Module zu wechseln.</li>
        <li>Schreibe Code im linken Feld, erhalte Vorschau rechts.</li>
        <li>Mit Code prüfen bekommst du Rückmeldung: ✔️ für richtig, ⚠️ für fehlende Bausteine.</li>
      </ul>`,
      check: ()=>({ok:true, message:'Hilfeseite bereit'})
    },
    {
      id: '1',
      title: '1. Was ist HTML?',
      kind: 'info',
      text: `<span class="important">HTML steht für "HyperText Markup Language"</span>. Damit beschreiben Menschen dem Browser, wie eine Webseite aufgebaut ist.<br>
      <span class="punch">HyperText</span> bedeutet: Text, der mit Links verbunden ist.<br>
      <span class="punch">Markup</span> bedeutet: Kennzeichnungen (<code class="inline-code">Tags</code>), die zeigen, welcher Teil Überschrift, Absatz, Liste oder Bild ist.<br>
      <span class="punch">Language</span> bedeutet: es ist eine Sprache, die der Computer versteht, um Dokumente zu strukturieren.<br><br>

      In HTML kommt alles in spitze Klammern, z. B. <code class="inline-code">&lt;h1&gt;</code>, <code class="inline-code">&lt;p&gt;</code> oder <code class="inline-code">&lt;img&gt;</code>. Jede Webseite beginnt normalerweise mit <code class="inline-code">&lt;html&gt;</code>, <code class="inline-code">&lt;head&gt;</code> und <code class="inline-code">&lt;body&gt;</code>.<br>
      <span class="important">Jetzt kommt der praktische Teil:</span> Im nächsten Schritt probierst du selbst: Schreibe eine Überschrift und zwei Absätze im Editor, damit du die Wirkung direkt siehst.`, 
      check: ()=>({ok:true, message:'Gute Basis – weiter mit der Praxis!'}),
    },
    {
      id: '2',
      title: '2. HTML-Dokumentaufbau: html/head/body',
      kind: 'info',
      text: `Jetzt tauchst du tiefer in die Webseite als Ganzes ein!<br>
        <span class="important">&lt;html&gt;</span> ist die äußere Hülle, damit der Browser weiß: Hier beginnt ein HTML-Dokument.<br>
        <span class="important">&lt;head&gt;</span> enthält unsichtbare Infos: Titel, Schriftarten, Meta-Angaben. Die Besucher sehen das *nicht direkt*, der Browser aber schon.<br>
        <span class="important">&lt;body&gt;</span> enthält alles, was sichtbar ist: Texte, Bilder, Links – also das, was Kinder auf der Seite lesen und klicken.<br>
        <br>
        Beispiel:
        <pre class="code">&lt;!doctype html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Meine Erste Seite&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Willkommen!&lt;/h1&gt;
    &lt;p&gt;Hier lerne ich HTML.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</pre>
        <span class="punch">Merke:</span> Ohne &lt;html&gt; funktioniert die Seite trotzdem manchmal, aber mit dem korrekten Aufbau verstehen Browser und Lehrkräfte sofort, was du meintest.<br>
        <strong>In den folgenden Modulen wirst du den &lt;body&gt;-Bereich füllen. Es ist okay, wenn &lt;html&gt; und &lt;head&gt; nicht in deinem Editor auftauchen – konzentriere dich auf die Bausteine im &lt;body&gt;!</strong>`,
      check: ()=>({ok:true, message:'Struktur ready! Weiter mit Überschrift und Absatz'})
    },
    {
      id: '3',
      title: '3. Überschriften & Absätze',
      kind: 'editor',
      task: `<span class="important">Überschriften und Absätze sind zwei der wichtigsten Strukturlemente.</span><br>
      Denn sie machen Text lesbar und helfen, Inhalte zu finden. <br>
      <span class="punch">Es gibt 6 Stufen von Überschriften</span>, von <code class="inline-code">&lt;h1&gt;</code> (größte) bis <code class="inline-code">&lt;h6&gt;</code> (kleinste).<br>
      <strong>Haupttitel</strong> gehört in <code class="inline-code">&lt;h1&gt;</code>, <strong>Untertitel</strong> in <code class="inline-code">&lt;h2&gt;</code>.<br>
      Das <code class="inline-code">h</code> steht übrigens für <code class="inline-code">heading</code>.<br>
      <br>
      Absätze machen dein Schreiben luftiger: <code class="inline-code">&lt;p&gt;</code> ... <code class="inline-code">&lt;/p&gt;</code>.<br>
      <span class="important">Jedes HTML-Element hat einen offenen und einen schließenden Tag</span>, z. B.:<br>
      <code class="inline-code">&lt;h1&gt;Titel&lt;/h1&gt;</code> und <code class="inline-code">&lt;p&gt;Text&lt;/p&gt;</code>.<br>
      Das <code class="inline-code">p</code> steht für <code class="inline-code">paragraph</code>.<br>
      <br>
      <strong>Deine Aufgabe:</strong> Verwende <code class="inline-code">&lt;h1&gt;</code> für den Haupttitel und mindestens zwei <code class="inline-code">&lt;p&gt;</code>-Absätze im Text.`,
      starter: 'Mein Insel-Abenteuer\n\nHeute erreiche ich eine geheimnisvolle Bucht und schreibe meine ersten Entdecker-Notizen.\n\nIm zweiten Absatz beschreibe ich, wie ich das Lager baue und was ich als nächstes untersuchen will.',
      validate(doc, source){
        const hasH1 = doc.querySelectorAll('h1').length > 0
        const hasP = doc.querySelectorAll('p').length >= 2
        if(!hasH1) return {ok:false, message:'Füge mindestens eine &lt;h1&gt;-Überschrift hinzu.'}
        if(!hasP) return {ok:false, message:'Füge mindestens zwei &lt;p&gt;-Absätze ein.'}

        const nesting = checkTagNesting(source, ['h1','p'])
        if(!nesting.ok) return nesting

        return {ok:true, message:'Super! Überschrift und Absätze sitzen.'}
      }
    },
    {
      id: '4',
      title: '4. Ungeordnete & geordnete Listen',
      kind: 'editor',
      task: `Abenteuer-Modus: Du bist Schatzsucher und sortierst deine Entdeckungen. <br>
        <span class="important">Das Tag <code class="inline-code">&lt;ul&gt;</code> steht für unordered list (ungeordnete Liste).</span><br>
        <span class="important">Das Tag <code class="inline-code">&lt;ol&gt;</code> steht für ordered list (geordnete, nummerierte Liste).</span><br>
        <span class="important">Das Tag <code class="inline-code">&lt;li&gt;</code> steht für list item (ein Listeneintrag).</span><br>
        Schreibe: <code class="inline-code">&lt;ul&gt;...&lt;/ul&gt;</code> für Dinge, die du einfach sammelst (z. B. Glitzersteine). <br>
        Schreibe: <code class="inline-code">&lt;ol&gt;...&lt;/ol&gt;</code> für Abfolgen (z. B. Schritte zum Schatz). <br>
        Jeder Listeneintrag gehört in <code class="inline-code">&lt;li&gt;...&lt;/li&gt;</code>. <br>
        Wichtig: <code class="inline-code">&lt;li&gt;</code> darf nur in <code class="inline-code">&lt;ul&gt;</code> oder <code class="inline-code">&lt;ol&gt;</code> stehen. <br>
        <span class="punch">Achte auf die richtige Tag-Paarung:</span> Öffnen + Inhalt + Schließen, z.B. <code class="inline-code">&lt;li&gt;Punkt&lt;/li&gt;</code>. <br><strong>Deine Aufgabe:</strong> Baue eine <code class="inline-code">&lt;ul&gt;</code> mit 3 Fundstücken und eine <code class="inline-code">&lt;ol&gt;</code> mit 3 Abenteuerschritten.`,


      starter: 'Meine Fundstücke:\nKarte\nKompass\nNotizbuch\n\nMein Plan:\nLager errichten\nSchatz suchen\nRückweg planen',
      validate(doc, source){
        const ulCount = doc.querySelectorAll('ul').length
        const olCount = doc.querySelectorAll('ol').length
        const liInUl = doc.querySelectorAll('ul li').length
        const liInOl = doc.querySelectorAll('ol li').length
        if(ulCount < 1) return {ok:false, message:'Füge mindestens eine &lt;ul&gt;-Liste ein.'}
        if(olCount < 1) return {ok:false, message:'Füge mindestens eine &lt;ol&gt;-Liste ein.'}
        if(liInUl < 3) return {ok:false, message:'Füge mindestens 3 &lt;li&gt;-Elemente zur &lt;ul&gt; hinzu.'}
        if(liInOl < 3) return {ok:false, message:'Füge mindestens 3 &lt;li&gt;-Elemente zur &lt;ol&gt; hinzu.'}

        const nesting = checkTagNesting(source, ['ul','ol','li'])
        if(!nesting.ok) return nesting

        return {ok:true, message:'Perfekt! Listenstruktur und Elemente stimmen.'}
      }
    },
    {
      id: '5',
      title: '5. Links setzen',
      kind: 'editor',
      task: `Klick-Modus: Du baust Wegweiser für deine Leser. <br>
        <span class="important">Das Tag <code class="inline-code">&lt;a&gt;</code> steht für anchor (Anker), es verbindet Seiten.</span><br>
        <span class="important">Das Attribut <code class="inline-code">href</code> steht für hyperlink reference (Zieladresse).</span><br>
        <span class="important">target="_blank" bedeutet: öffne die Seite in einem neuen Browser-Tab.</span><br>
        <span class="important">Jedes Link-Element hat Öffnen + Text + Schließen, z.B. <code class="inline-code">&lt;a href="url"&gt;Text&lt;/a&gt;</code>.</span><br>
        <span class="punch">Merke:</span> Kurze Linktexte wirken professionell, wenn der Inhalt klar ist (z.B. "Mehr erfahren", "Zum Kapitel"). <br>
        <strong>Deine Aufgabe:</strong> Erstelle einen Link auf <code class="inline-code">https://www.inf-schule.de</code> mit Text "mehr erfahren".`,

      starter: 'Auf inf-schule.de kannst du über HTML mehr erfahren.',
      validate(doc){
        const a = doc.querySelector('a[href]')
        if(!a) return {ok:false, message:'Es fehlt ein &lt;a href="..."&gt;-Link.'}
        if(!a.textContent.trim()) return {ok:false, message:'Der Link braucht sichtbaren Text (z.B. "Mehr erfahren").'}
        if(!a.getAttribute('href') || !a.getAttribute('href').startsWith('https://')) return {ok:false, message:'Der Link muss mit https:// beginnen.'}
        return {ok:true, message:'Link erstellt – Navigation funktioniert.'}
      }
    },
    {
      id: '6',
      title: '6. Bilder einbinden',
      kind: 'editor',
      task: `Bild-Reporter: Ein Bild macht deine Seite lebendig. <br>
        <span class="important">Das Tag <code class="inline-code">&lt;img&gt;</code> steht für image (Bild).</span><br>
        <span class="important">src steht für source (Quelle) der Bilddatei.</span><br>
        <span class="important">alt steht für alternative Text (Ersatzbeschreibung bei fehlendem Bild).</span><br>
        <span class="important">So lautet die Struktur: <code class="inline-code">&lt;img src="URL" alt="Beschreibung" /&gt;</code>.</span><br>
        <strong>Deine Aufgabe:</strong> Binde ein Bild mit einer klaren und nützlichen Beschreibung ein.`,




      starter: 'Schatzkarte einbinden:\n- Bild-URL: https://i.sstatic.net/bYvO3.jpg\n- alt-Text: Schatzkarte',
      validate(doc){
        const img = doc.querySelector('img')
        if(!img) return {ok:false, message:'Füge mindestens ein &lt;img&gt;-Element hinzu.'}
        if(!img.getAttribute('src')) return {ok:false, message:'Das &lt;img&gt;-Tag braucht ein src-Attribut.'}
        if(!img.getAttribute('alt') || !img.getAttribute('alt').trim()) return {ok:false, message:'Das &lt;img&gt;-Tag braucht ein alt-Attribut für Barrierefreiheit.'}
        return {ok:true, message:'Bild eingebunden: großartig!'}
      }
    },
    {
      id: '7',
      title: '7. Text formatieren',
      kind: 'editor',
      task: `Autor-Update: Mit Formatierung lenkst du die Aufmerksamkeit. <br>
        <span class="important">Das Tag <code class="inline-code">&lt;strong&gt;</code> heißt strong (stark) und markiert wichtige Wörter.</span><br>
        <span class="important">Das Tag <code class="inline-code">&lt;em&gt;</code> heißt emphasis (Betonung) und hebt etwas hervor.</span><br>
        <span class="important">Das Tag <code class="inline-code">&lt;small&gt;</code> zeigt Hinweise oder einen kleineren Text.</span><br>
        <span class="punch">Jedes Formatierungs-Tag funktioniert als Paar: öffnen + Text + schließen.</span><br>
        Beispiel: <code class="inline-code">&lt;strong&gt;Top&lt;/strong&gt;</code>, <code class="inline-code">&lt;em&gt;wichtig&lt;/em&gt;</code>, <code class="inline-code">&lt;small&gt;Anmerkung&lt;/small&gt;</code>. <br>
        <strong>Deine Aufgabe:</strong> Formatiere diesen Satz mit allen drei Tags, z. B. <em>"Der mutige Held ist <strong>wichtig</strong>, <em>gespannt</em> und fügt eine <small>Anmerkung</small> hinzu."</em>.`,




      starter: 'Der mutige Entdecker fand eine seltene Karte im verstaubten Buch.',
      validate(doc){
        const strong = doc.querySelector('strong')
        const em = doc.querySelector('em')
        const small = doc.querySelector('small')
        if(!strong || !em || !small) return {ok:false, message:'Nutze &lt;strong&gt;, &lt;em&gt; und &lt;small&gt; mindestens einmal.'}
        return {ok:true, message:'Du beherrschst Textauszeichnung prima!'}
      }
    },
    {
      id: 'abschluss',
      title: 'Abschluss & Nächste Mission',
      kind: 'info',
      text: `Glückwunsch! Du hast die ersten HTML-Bausteine gelernt. Jetzt bist du bereit für den <strong>HTML-Quiz</strong> und später Klassen/IDs + CSS.
      Klicke in der Sidebar auf "HTML-Quiz" (später, sobald verfügbar).`,
      check: ()=>({ok:true, message:'Abschluss erfolgreich.'})
    }
  ]

  function getModuleByHash(){
    const hash = location.hash.replace('#/', '') || 'start'
    if(hash.startsWith('modul/')) {
      const key = hash.split('/')[1]
      return modules.find(m=>m.id===key) || modules[0]
    }
    return modules.find(m=>m.id===hash) || modules[0]
  }

  const COMPLETED_KEY = 'html-grundlagen-completed'

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

  const completedStations = loadCompletedStations()

  function updateProgress() {
    const done = completedStations.size
    const total = modules.filter(m=>m.kind==='editor').length
    progressEl.textContent = `Fertig: ${done}/${total} Praxisstationen`;
  }

  function setActiveNavLink() {
    const rawHash = location.hash || '#/start'
    const currentHash = rawHash.startsWith('#/modul/') ? '#/editor' : rawHash
    document.querySelectorAll('.topnav a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === currentHash)
    })
  }

  const STORAGE_KEY = 'html-grundlagen-module-state'

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

  function setActiveSidebarLink() {
    const rawHash = location.hash || '#/start'
    const sidebarHash = rawHash.startsWith('#/modul/') ? rawHash : rawHash
    document.querySelectorAll('.sidebar a').forEach(link => {
      const href = link.getAttribute('href')
      const active = href === sidebarHash || (href === '#/editor' && rawHash.startsWith('#/modul/'))
      link.classList.toggle('active', active)

      const moduleId = href.replace('#/modul/', '')
      if (href.startsWith('#/modul/') && completedStations.has(moduleId)) {
        link.classList.add('completed')
      } else {
        link.classList.remove('completed')
      }
      if (href === '#/editor' && rawHash.startsWith('#/modul/') && completedStations.has(moduleId)) {
        link.classList.add('completed')
      }
    })
  }

  function showStatus(place, status, text) {
    place.innerHTML = `<span class="status ${status ? 'success' : 'error'}">${status ? '✅' : '⚠️'} ${text}</span>`
  }

  function parseHtml(value){
    const parser = new DOMParser()
    const doc = parser.parseFromString(value, 'text/html')
    const err = doc.querySelector('parsererror')
    return {doc, parserError: !!err, parserErrorMessage: err ? err.textContent : ''}
  }

  function renderModule(mod){
    root.innerHTML = ''
    const pane = document.createElement('section')
    pane.className = 'pane'
    const title = document.createElement('h2'); title.textContent = mod.title
    pane.appendChild(title)

    if(mod.kind === 'info'){
      const p = document.createElement('p'); p.innerHTML = mod.text
      pane.appendChild(p)
      root.appendChild(pane)
      updateProgress()
      return
    }

    const desc = document.createElement('p'); desc.innerHTML = mod.task
    pane.appendChild(desc)

    const cols = document.createElement('div'); cols.className='cols'
    const left = document.createElement('div'); left.className='box'
    const codeInput = document.createElement('textarea');
    codeInput.id='editor'
    const editorState = loadEditorState()
    codeInput.value = editorState[mod.id] != null ? editorState[mod.id] : mod.starter
    left.appendChild(codeInput)

    const controls = document.createElement('div')
    const r = document.createElement('button'); r.textContent='Code überprüfen';
    const resetBtn = document.createElement('button'); resetBtn.textContent='Zurücksetzen'; resetBtn.className='secondary'
    const feedback = document.createElement('div'); feedback.id='feedback'; feedback.className='feedback'
    controls.appendChild(r); controls.appendChild(resetBtn); left.appendChild(controls); left.appendChild(feedback)

    const right = document.createElement('div'); right.className='box'
    const iframeTitle = document.createElement('h3'); iframeTitle.textContent='Live-Vorschau'
    const preview = document.createElement('iframe'); preview.id='preview'; preview.sandbox='allow-same-origin'
    right.appendChild(iframeTitle); right.appendChild(preview)

    cols.appendChild(left); cols.appendChild(right)
    pane.appendChild(cols)

    const tooltip = document.createElement('p')
    tooltip.innerHTML = 'Fehlerhinweise erscheinen hier. <span class="tooltip">Nehme Hover<br><span>Syntaxfehler werden erkannt; klicke "Code überprüfen".</span></span>'
    pane.appendChild(tooltip)

    root.appendChild(pane)
    updateProgress()

    function makePreviewDoc(code) {
      const trimmed = code.trim()
      if (/^\s*<!doctype|^\s*<html/i.test(trimmed)) {
        return code
      }
      return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:1.3rem;background:#0f172a;color:#e2e8f0;font-family:Segoe UI,Arial,sans-serif;line-height:1.75;font-size:1.35rem;}h1,h2,h3,h4{color:#f1f5f9;}a{color:#22d3ee;}p{margin:0.75rem 0;}.vframe{max-width:100%;}img{max-width:100%;height:auto;border:1px solid #334155;border-radius:6px;}</style></head><body class="vframe">${code}</body></html>`
    }

    function renderPreview(){
      const code = codeInput.value
      const parse = parseHtml(code)
      preview.srcdoc = makePreviewDoc(code)
      if(parse.parserError) {
        codeInput.style.borderColor = 'var(--danger)'
        tooltip.innerHTML = `Syntaxfehler erkannt: <strong>Prüfe geschlossene Tags</strong>, dann nochmal prüfen. <span class=\"tooltip\">Details<span>${parse.parserErrorMessage}</span></span>`
        return false
      }
      codeInput.style.borderColor = 'var(--accent)'
      tooltip.innerHTML = 'Kein gleich erkennbarer Parser-Fehler. Klicke "Code überprüfen" für fachliche Kontrolle.'
      return true
    }

    let timer
    codeInput.addEventListener('input', ()=>{
      clearTimeout(timer)
      timer = setTimeout(()=>{
        renderPreview()
        const state = loadEditorState()
        state[mod.id] = codeInput.value
        saveEditorState(state)
      }, 250)
    })

    resetBtn.addEventListener('click', ()=>{
      codeInput.value = mod.starter
      const state = loadEditorState()
      state[mod.id] = mod.starter
      saveEditorState(state)
      renderPreview()
      feedback.innerHTML = ''
    })

    r.addEventListener('click', ()=>{
      const code = codeInput.value
      const parse = parseHtml(code)
      if(parse.parserError){
        showStatus(feedback, false, 'HTML-Syntax fehlerhaft: '+parse.parserErrorMessage.replace(/\s+/g,' ').slice(0,120))
        return
      }
      const result = mod.validate(parse.doc, code)
      if(result.ok){
        showStatus(feedback, true, `${result.message} 🎉`)
        if(mod.kind === 'editor') {
          completedStations.add(mod.id)
          saveCompletedStations()
          updateProgress()
          setActiveSidebarLink()
        }
      } else {
        showStatus(feedback, false, result.message)
      }
    })

    renderPreview()
  }

  function router(){
    const mod = getModuleByHash()
    renderModule(mod)
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
