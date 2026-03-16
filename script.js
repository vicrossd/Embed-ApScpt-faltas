const supabaseUrlInput = document.getElementById('supabaseUrl');
const supabaseKeyInput = document.getElementById('supabaseKey');
const salvarBtn = document.getElementById('salvarBtn');
const carregarBtn = document.getElementById('carregarBtn');
const statusEl = document.getElementById('status');
const cardsEl = document.getElementById('cards');

const STORAGE_URL = 'faltas_supabase_url';
const STORAGE_KEY = 'faltas_supabase_key';

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#f87171' : '#b3b3b3';
}

function getConfig() {
  return {
    url: supabaseUrlInput.value.trim().replace(/\/$/, ''),
    key: supabaseKeyInput.value.trim()
  };
}

function salvarConfig() {
  const { url, key } = getConfig();
  if (!url || !key) {
    setStatus('Preencha a URL e a anon key do Supabase.', true);
    return false;
  }
  localStorage.setItem(STORAGE_URL, url);
  localStorage.setItem(STORAGE_KEY, key);
  setStatus('Configuração salva.');
  return true;
}

function carregarConfigSalva() {
  const url = localStorage.getItem(STORAGE_URL) || '';
  const key = localStorage.getItem(STORAGE_KEY) || '';
  supabaseUrlInput.value = url;
  supabaseKeyInput.value = key;
}

async function api(path, options = {}) {
  const { url, key } = getConfig();

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Erro ao acessar Supabase.');
  }

  if (response.status === 204) return null;
  return response.json();
}

async function carregarTudo() {
  try {
    setStatus('Carregando...');
    cardsEl.innerHTML = '';

    const materias = await api('materias?select=id,nome,cor,ordem&order=ordem.asc');
    const faltas = await api('faltas?select=materia_id,delta');

    const totais = {};
    for (const materia of materias) {
      totais[materia.id] = 0;
    }

    for (const item of faltas) {
      if (totais[item.materia_id] !== undefined) {
        totais[item.materia_id] += Number(item.delta || 0);
      }
    }

    for (const materia of materias) {
      cardsEl.appendChild(criarCard(materia, totais[materia.id] || 0));
    }

    setStatus('Dados carregados.');
  } catch (err) {
    setStatus(err.message || String(err), true);
  }
}

function criarCard(materia, total) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.setProperty('--card-color', materia.cor || '#3b82f6');

  const titulo = document.createElement('h2');
  titulo.textContent = materia.nome;

  const totalEl = document.createElement('div');
  totalEl.className = 'total';
  totalEl.textContent = total;

  const acoes = document.createElement('div');
  acoes.className = 'acoes';

  const btnAdd = document.createElement('button');
  btnAdd.className = 'btn-add';
  btnAdd.textContent = '+ Falta';
  btnAdd.addEventListener('click', async () => {
    await registrar(materia.id, 1, materia.nome);
  });

  const btnRemove = document.createElement('button');
  btnRemove.className = 'btn-remove';
  btnRemove.textContent = '− Desfazer';
  btnRemove.addEventListener('click', async () => {
    await registrar(materia.id, -1, materia.nome);
  });

  acoes.appendChild(btnAdd);
  acoes.appendChild(btnRemove);

  card.appendChild(titulo);
  card.appendChild(totalEl);
  card.appendChild(acoes);

  return card;
}

async function registrar(materiaId, delta, nome) {
  try {
    setStatus(`Registrando ação em ${nome}...`);

    await api('faltas', {
      method: 'POST',
      body: JSON.stringify([{ materia_id: materiaId, delta }]),
      headers: {
        Prefer: 'return=minimal'
      }
    });

    await carregarTudo();
    setStatus(`Atualizado: ${nome}`);
  } catch (err) {
    setStatus(err.message || String(err), true);
  }
}

salvarBtn.addEventListener('click', () => {
  salvarConfig();
});

carregarBtn.addEventListener('click', async () => {
  if (salvarConfig()) {
    await carregarTudo();
  }
});

carregarConfigSalva();
