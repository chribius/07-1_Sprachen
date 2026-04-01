(()=>{
  const root = document.getElementById('app')
  const progressEl = document.getElementById('progress')

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
      text: `HTML ist die Struktur-Sprache des Webs. Tags wie <html>, <body>, <h1> und <p> geben dem Browser an, was angezeigt werden soll.
      Nach der Theorie gehst du gleich zur Praxis: fang mit einer Überschrift und einem Absatz an.`,
      check: ()=>({ok:true, message:'Verstanden, lass uns schreiben!'}),
    },
    {
      id: '2',
      title: '2. Überschriften & Absätze',
      kind: 'editor',
      task: 'Schreibe eine <h1>-Überschrift und zwei <p>-Absätze. Vergiss nicht die schließenden Tags.',
      starter: '<h1>Abenteuer auf der Insel</h1>\n<p>Ich erreiche ein geheimnisvolles Lager.</p>\n<p>Hier lerne ich erste HTML-Fundamente.</p>',
      validate(doc){
        const hasH1 = doc.querySelectorAll('h1').length > 0
        const hasP = doc.querySelectorAll('p').length >= 2
        if(!hasH1) return {ok:false, message:'Füge mindestens eine <h1> Überschrift hinzu.'}
        if(!hasP) return {ok:false, message:'Füge mindestens zwei Absätze <p> ein.'}
        return {ok:true, message:'Super! Überschrift und Absätze sitzen.'}
      }
    },
    {
      id: '3',
      title: '3. Ungeordnete & geordnete Listen',
      kind: 'editor',
      task: 'Erstelle eine <ul> mit 3 Dingen, die du auf der Insel findest, und eine <ol> mit 3 Abenteuerschritten.',
      starter: '<h2>Meine Fundstücke</h2>\n<ul>\n  <li>Mysteriöse Karte</li>\n  <li>Alte Feder</li>\n  <li>Kartenschnitzerei</li>\n</ul>\n<h2>Mein Plan</h2>\n<ol>\n  <li>Baue ein Lager</li>\n  <li>Suche den Schatz</li>\n  <li>Erzähle deine Abenteuer</li>\n</ol>',
      validate(doc){
        const hasUl = doc.querySelectorAll('ul li').length >= 3
        const hasOl = doc.querySelectorAll('ol li').length >= 3
        if(!hasUl) return {ok:false, message:'Ergänze mindestens 3 Elemente in einer <ul> Liste.'}
        if(!hasOl) return {ok:false, message:'Ergänze mindestens 3 Elemente in einer <ol> Liste.'}
        return {ok:true, message:'Perfekt! Listen zeigen Struktur.'}
      }
    },
    {
      id: '4',
      title: '4. Links setzen',
      kind: 'editor',
      task: 'Schreibe einen Link, der zum Beispiel auf https://www.inf-schule.de zeigt. Text: "Mehr erfahren".',
      starter: '<p>Weiter geht`s: <a href="https://www.inf-schule.de" target="_blank">Mehr erfahren</a></p>',
      validate(doc){
        const a = doc.querySelector('a[href]')
        if(!a) return {ok:false, message:'Es fehlt ein <a href="..."> Link.'}
        if(!a.textContent.trim()) return {ok:false, message:'Der Link braucht sichtbaren Text (z.B. "Mehr erfahren").'}
        return {ok:true, message:'Link erstellt – Navigation funktioniert.'}
      }
    },
    {
      id: '5',
      title: '5. Bilder einbinden',
      kind: 'editor',
      task: 'Füge ein Bild ein: <img src="..." alt="...">. Probiere z.B. https://via.placeholder.com/250.',
      starter: '<p>Hier ist unsere Schatzkarte:</p>\n<img src="https://via.placeholder.com/250" alt="Schatzkarte" />',
      validate(doc){
        const img = doc.querySelector('img')
        if(!img) return {ok:false, message:'Füge mindestens ein <img> Element hinzu.'}
        if(!img.getAttribute('src')) return {ok:false, message:'Das img-Tag braucht ein src-Attribut.'}
        if(!img.getAttribute('alt')) return {ok:false, message:'Das img-Tag braucht ein alt-Attribut für Barrierefreiheit.'}
        return {ok:true, message:'Bild eingebunden: großartig!'}
      }
    },
    {
      id: '6',
      title: '6. Text formatieren',
      kind: 'editor',
      task: 'Verwende <strong>, <em> und <small>, um einen Satz lebendiger zu machen.',
      starter: '<p>Der <strong>mutige Entdecker</strong> fand <em>eine seltene Karte</em> im <small>verstaubten</small> Buch.</p>',
      validate(doc){
        const strong = doc.querySelector('strong')
        const em = doc.querySelector('em')
        const small = doc.querySelector('small')
        if(!strong || !em || !small) return {ok:false, message:'Nutze <strong>, <em> und <small> mindestens einmal.'}
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

  function updateProgress(currentId) {
    const idx = modules.findIndex(m => m.id === currentId)
    const done = modules.slice(0, Math.max(0, idx+1)).filter(m=>m.kind==='editor').length
    const total = modules.filter(m=>m.kind==='editor').length
    progressEl.textContent = `Fertig: ${done}/${total} Praxisstationen`;
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
      updateProgress(mod.id)
      return
    }

    const desc = document.createElement('p'); desc.textContent = mod.task
    pane.appendChild(desc)

    const cols = document.createElement('div'); cols.className='cols'
    const left = document.createElement('div'); left.className='box'
    const codeInput = document.createElement('textarea');
    codeInput.id='editor'
    codeInput.value = mod.starter
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
    updateProgress(mod.id)

    function renderPreview(){
      const code = codeInput.value
      const parse = parseHtml(code)
      preview.srcdoc = code
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
      timer = setTimeout(renderPreview, 250)
    })

    resetBtn.addEventListener('click', ()=>{
      codeInput.value = mod.starter
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
      const result = mod.validate(parse.doc)
      if(result.ok){
        showStatus(feedback, true, `${result.message} 🎉`)
      } else {
        showStatus(feedback, false, result.message)
      }
    })

    renderPreview()
  }

  function router(){
    const mod = getModuleByHash()
    renderModule(mod)
  }

  window.addEventListener('hashchange', router)
  router()
})()
