const URL_PLANILHA = 'https://script.google.com/macros/s/SEU_WEBHOOK_ID/exec';

document.getElementById("form-sorteio").addEventListener("submit", async function (e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const msg = document.getElementById("msg");

  if (!nome || !telefone) {
    msg.textContent = "Preencha todos os campos.";
    return;
  }

  try {
    const res = await fetch(URL_PLANILHA, {
      method: "POST",
      body: JSON.stringify({ nome, telefone }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    msg.textContent = data.message || data.error;
    if (res.ok) this.reset();
  } catch {
    msg.textContent = "Erro ao enviar.";
  }
});
