const URL_ADMIN = 'https://script.google.com/macros/s/AKfycbxJviyoxVzFs53mUKS7hVaOfbj_AW_UX0tmGGzX4aqf3TDmVIn_0C2IkSjglsdCqdBVtQ/exec';

function verificarSenha() {
  const senha = document.getElementById('senha').value;
  const erro = document.getElementById('erro');

  fetch(URL_ADMIN, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // importante!
  body: JSON.stringify({ acao: 'verificarSenha', senha })
})

    .then(res => res.json())
    .then(dados => {
      if (dados.autorizado) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('painelAdmin').style.display = 'block';
        carregarLista();
      } else {
        erro.textContent = 'Senha incorreta.';
      }
    })
    .catch(() => {
      erro.textContent = 'Erro ao verificar senha.';
    });
}

function carregarLista() {
  const lista = document.getElementById('listaParticipantes');

  fetch(URL_ADMIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acao: 'listar' })
  })
    .then(res => res.json())
    .then(dados => {
      lista.innerHTML = '';
      dados.participantes.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.nome} - ${p.telefone}`;
        lista.appendChild(li);
      });
    })
    .catch(() => {
      lista.innerHTML = '<li>Erro ao carregar participantes.</li>';
    });
}

function sortear() {
  const lista = document.querySelectorAll('#listaParticipantes li');
  if (lista.length === 0) {
    document.getElementById('sorteado').textContent = 'Nenhum participante.';
    return;
  }
  const sorteado = lista[Math.floor(Math.random() * lista.length)].textContent;
  document.getElementById('sorteado').textContent = `🎉 Sorteado: ${sorteado}`;
}
