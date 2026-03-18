const apiInput = document.getElementById('apiUrl');
const salvarUrlBtn = document.getElementById('salvarUrlBtn');
const carregarBtn = document.getElementById('carregarBtn');
const statusEl = document.getElementById('status');
const cardsEl = document.getElementById('cards');

const STORAGE_KEY = 'faltas_api_url';

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#b91c1c' : '#374151';
}

function getApiUrl() {
  return apiInput.value.trim();
}

function saveApiUrl() {
  return apiInput.value.trim() || localStorage.getItem(STORAGE_KEY)?.trim() || '';
}

  if (!url) {
    url = 'https://script.google.com/macros/s/AKfycbzmV5z5qDr8fSdz0EkaSZjD9WbxbPecq7B3p0lwv-RLJWfVibMwIZ03DS_7d7p8sNiZVg/exec';
    setStatus('Campo vazio. URL padrão salva.');
  } else {
    setStatus('URL salva.');
  }

  localStorage.setItem(STORAGE_KEY, url);
}

function loadSavedApiUrl() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    apiInput.value = saved;
  }
}

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

    window[callbackName] = function (data) {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    const script = document.createElement('script');
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;

    script.onerror = function () {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('Falha ao carregar resposta da API.'));
    };

    document.body.appendChild(script);
  });
}

async function chamarApi(params = {}) {
  const baseUrl = getApiUrl();
  if (!baseUrl) {
    throw new Error('URL do Apps Script não informada.');
  }

  const query = new URLSearchParams(params).toString();
  const url = query ? `${baseUrl}?${query}` : baseUrl;

  return await jsonp(url);
}

function criarCard(materia, total) {
  const card = document.createElement('div');
  card.className = 'card';

  const titulo = document.createElement('h2');
  titulo.textContent = materia;

  const totalEl = document.createElement('div');
  totalEl.className = 'total';
  totalEl.textContent = total ?? 0;

  const acoes = document.createElement('div');
  acoes.className = 'acoes';

  const btnAdd = document.createElement('button');
  btnAdd.className = 'btn-add';
  btnAdd.textContent = '+ Falta';
  btnAdd.addEventListener('click', async () => {
    await registrar('registrar', materia);
  });

  const btnRemove = document.createElement('button');
  btnRemove.className = 'btn-remove';
  btnRemove.textContent = '− Desfazer';
  btnRemove.addEventListener('click', async () => {
    await registrar('desfazer', materia);
  });

  acoes.appendChild(btnAdd);
  acoes.appendChild(btnRemove);

  card.appendChild(titulo);
  card.appendChild(totalEl);
  card.appendChild(acoes);

  return card;
}

async function carregarTudo() {
  try {
    setStatus('Carregando...');
    cardsEl.innerHTML = '';

    const materiasResp = await chamarApi({ acao: 'materias' });
    if (!materiasResp.ok) throw new Error(materiasResp.erro || 'Erro ao carregar matérias.');

    const totaisResp = await chamarApi({ acao: 'totais' });
    if (!totaisResp.ok) throw new Error(totaisResp.erro || 'Erro ao carregar totais.');

    const materias = materiasResp.materias || [];
    const totais = totaisResp.totais || {};

    materias.forEach(materia => {
      const total = Object.prototype.hasOwnProperty.call(totais, materia) ? totais[materia] : 0;
      cardsEl.appendChild(criarCard(materia, total));
    });

    setStatus('Dados carregados.');
  } catch (err) {
    setStatus(err.message || String(err), true);
  }
}

async function registrar(acao, materia) {
  try {
    setStatus(`Enviando ação para ${materia}...`);
    const resp = await chamarApi({ acao, materia });

    if (!resp.ok) throw new Error(resp.erro || 'Erro na operação.');

    await carregarTudo();
    setStatus(`Ação concluída: ${materia}`);
  } catch (err) {
    setStatus(err.message || String(err), true);
  }
}

salvarUrlBtn.addEventListener('click', saveApiUrl);
carregarBtn.addEventListener('click', async () => {

  await carregarTudo();
});

loadSavedApiUrl();
