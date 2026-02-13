const erroresComunes = {
  "hiendo": { correccion: "yendo", explicacion: "El gerundio correcto del verbo 'ir' es 'yendo'." },
  "haci": { correccion: "así", explicacion: "'Así' lleva tilde." },
  "echo": { correccion: "hecho", explicacion: "'Hecho' es del verbo hacer." },
  "tubo": { correccion: "tuvo", explicacion: "'Tuvo' es del verbo tener." },
  "q": { correccion: "que", explicacion: "'Que' se escribe completo, no abreviado 'q'." },
  "xq": { correccion: "porque", explicacion: "La abreviatura 'xq' se escribe como 'porque' en textos formales." }
};

const editor = document.getElementById("editor");
const contador = document.getElementById("contador");
const info = document.getElementById("info");

let timeout;

editor.addEventListener("input", () => {
  clearTimeout(timeout);
  timeout = setTimeout(corregir, 600);
});

editor.addEventListener("click", e => {
  if (e.target.classList.contains("error")) {
    const palabra = e.target.innerText.toLowerCase();
    const correccion = erroresComunes[palabra]?.correccion;
    if (correccion) {
      e.target.outerHTML = correccion;
      corregir();
    }
  }
});

/* ========= CURSOR (ARREGLO) ========= */

function guardarCursor() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return 0;

  const range = sel.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(editor);
  preRange.setEnd(range.endContainer, range.endOffset);

  return preRange.toString().length;
}

function restaurarCursor(pos) {
  const selection = window.getSelection();
  const range = document.createRange();

  let charCount = 0;
  let nodeStack = [editor];
  let node;
  let found = false;

  while (!found && (node = nodeStack.pop())) {
    if (node.nodeType === 3) {
      const nextCount = charCount + node.length;
      if (pos <= nextCount) {
        range.setStart(node, pos - charCount);
        range.collapse(true);
        found = true;
      }
      charCount = nextCount;
    } else {
      let i = node.childNodes.length;
      while (i--) nodeStack.push(node.childNodes[i]);
    }
  }

  selection.removeAllRanges();
  selection.addRange(range);
}

/* ==================================== */

function corregirMayusculas(texto) {
  if (!texto) return texto;
  texto = texto.charAt(0).toUpperCase() + texto.slice(1);
  texto = texto.replace(/(\. |\! |\? )(\w)/g, (m, p, l) => p + l.toUpperCase());
  texto = texto.replace(/\bq\b/gi, "que");
  texto = texto.replace(/\bxq\b/gi, "porque");
  return texto;
}

async function corregir() {
  const cursorPos = guardarCursor();

  let texto = editor.innerText;
  texto = corregirMayusculas(texto);

  let totalErrores = 0;
  let html = texto;
  let explicaciones = "";

  for (let error in erroresComunes) {
    const regex = new RegExp(`\\b${error}\\b`, "gi");
    if (regex.test(html)) {
      totalErrores++;
      html = html.replace(regex, `<span class="error">${error}</span>`);
      explicaciones += `<p>❌ <b>${error}</b> → ${erroresComunes[error].correccion}<br>💡 ${erroresComunes[error].explicacion}</p>`;
    }
  }

  editor.innerHTML = html;

  restaurarCursor(cursorPos);

  contador.innerText = "Errores: " + totalErrores;
  info.innerHTML = explicaciones || "Sin errores detectados.";
}

function corregirTodo() {
  let texto = editor.innerText;

  for (let error in erroresComunes) {
    const regex = new RegExp(`\\b${error}\\b`, "gi");
    texto = texto.replace(regex, erroresComunes[error].correccion);
  }

  texto = corregirMayusculas(texto);

  editor.innerText = texto;
  corregir();
}

// Toggle modo oscuro
const toggleDark = document.getElementById("toggleDark");
toggleDark.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('ServiceWorker registrado:', reg.scope))
      .catch(err => console.log('Error ServiceWorker:', err));
  });
}
