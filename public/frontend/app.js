// URL base do backend
const baseUrl = 'http://localhost:3000'; // muda para o teu backend real

// --- LOGIN ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'  // importante para cookies de sessão
    });

    if (res.ok) {
      alert('Login feito com sucesso!');
      window.location.href = 'search.html';
    } else {
      const data = await res.json();
      alert('Erro: ' + data.message);
    }
  });
}

// --- REGISTO ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      alert('Registo feito com sucesso! Agora faça login.');
      registerForm.reset();
    } else {
      const data = await res.json();
      alert('Erro: ' + data.message);
    }
  });
}

// --- PESQUISA ---
const searchForm = document.getElementById('searchForm');
if (searchForm) {
  const resultsEl = document.getElementById('results');
  const historyEl = document.getElementById('history');

  // Carregar histórico no início
  async function loadHistory() {
    const res = await fetch(`${baseUrl}/auth/history`, {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      historyEl.innerHTML = '';
      data.pesquisas.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.termo} - ${new Date(p.data).toLocaleString()}`;
        historyEl.appendChild(li);
      });
    } else {
      alert('Não autorizado. Vai para login.');
      window.location.href = 'index.html';
    }
  }
  loadHistory();

  searchForm.addEventListener('submit', async e => {
    e.preventDefault();
    const term = document.getElementById('searchTerm').value;

    const res = await fetch(`${baseUrl}/search?term=${encodeURIComponent(term)}`, {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      resultsEl.textContent = JSON.stringify(data, null, 2);
      loadHistory();
    } else if (res.status === 401) {
      alert('Sessão expirada. Faça login.');
      window.location.href = 'index.html';
    } else {
      alert('Erro na pesquisa');
    }
  });

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', async () => {
    await fetch(`${baseUrl}/auth/logout`, {
      method: 'GET',
      credentials: 'include'
    });
    window.location.href = 'index.html';
  });
}
