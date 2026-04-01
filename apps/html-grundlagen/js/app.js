(()=>{
  const root = document.getElementById('app')
  const editorTpl = document.getElementById('editor-tpl')
  const hilfeTpl = document.getElementById('hilfe-tpl')

  function renderEditor(){
    root.innerHTML = ''
    root.appendChild(editorTpl.content.cloneNode(true))
    const ta = document.getElementById('editor')
    const preview = document.getElementById('preview')
    document.getElementById('run').addEventListener('click', ()=>{
      preview.srcdoc = ta.value
    })
    document.getElementById('reset').addEventListener('click', ()=>{
      ta.value = '<h2>Hallo Welt</h2>\n<p>Das ist ein kleiner HTML-Code zum Ausprobieren.</p>'
      preview.srcdoc = ta.value
    })
    // initial render
    preview.srcdoc = ta.value
  }

  function renderHilfe(){
    root.innerHTML = ''
    root.appendChild(hilfeTpl.content.cloneNode(true))
  }

  function router(){
    const hash = location.hash || '#/editor'
    if(hash.startsWith('#/editor')) renderEditor()
    else if(hash.startsWith('#/hilfe')) renderHilfe()
    else renderEditor()
  }

  window.addEventListener('hashchange', router)
  router()
})()
