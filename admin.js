const SENHA_ADMIN = '2001Lima'; 
const PLANILHA_ID = 'https://script.google.com/macros/s/AKfycbxJviyoxVzFs53mUKS7hVaOfbj_AW_UX0tmGGzX4aqf3TDmVIn_0C2IkSjglsdCqdBVtQ/exec ';

function verificarSenha() {
  const senha = document.getElementById('senha').value;
  if (senha === SENHA_ADMIN) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('painelAdmin').style.display = 'block';
    carregarLista();
  } else {
    document.getElementById('erro').textContent = 'Senha incorreta.';
  }
}

async function carregarLista() {
  const lista = document.getElementById('listaParticipantes');
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${PLANILHA_ID}/gviz/tq?tqx=out:json`);
    const texto = await res.text();
    const json = JSON.parse(texto.substring(47).slice(0, -2));
    const linhas = json.table.rows;

    lista.innerHTML = '';
    linhas.slice(1).forEach(l => {
      const nome = l.c[0]?.v || '';
      const tel = l.c[1]?.v || '';
      const li = document.createElement('li');
      li.textContent = `${nome} - ${tel}`;
      lista.appendChild(li);
    });
  } catch {
    lista.innerHTML = '<li>Erro ao carregar participantes.</li>';
  }
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
