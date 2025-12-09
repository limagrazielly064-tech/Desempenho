// ============================================================
// ARQUIVO: script.js (VERSÃO FINAL LIMPA)
// ============================================================

// --- 1. GESTÃO DE SESSÃO (BLINDADA) ---
let sessao = null;

try {
    let jsonSessao = sessionStorage.getItem("sessaoUsuario") || localStorage.getItem("sessaoUsuario");
    
    // Se não tiver sessão, lança erro para cair no catch
    if (!jsonSessao) throw new Error("Nenhuma sessão encontrada");
    
    sessao = JSON.parse(jsonSessao);
    
    // Se o objeto existe mas logado é falso
    if (!sessao.logado) throw new Error("Usuário não está logado");

} catch (erro) {
    console.warn("Redirecionando para login:", erro.message);
    // Só redireciona se não estivermos já na tela de login
    if (!window.location.href.includes("login.html")) {
        window.location.href = "login.html";
    }
}

// Atualiza a mensagem de Boas Vindas
const welcomeMsg = document.getElementById('welcome-msg');
if (welcomeMsg) {
    if (sessao) {
        welcomeMsg.innerText = `Olá, ${sessao.nome} (${sessao.tipo === 'admin' ? 'Administrador' : 'Visitante'})`;
    } else {
        welcomeMsg.innerText = "Carregando...";
    }
}

// Esconde botão de admin se for visitante
if (sessao && sessao.tipo !== 'admin') {
    const btnUsuarios = document.getElementById('btn-aba-usuarios');
    if (btnUsuarios) btnUsuarios.style.display = 'none';
}

// --- 2. VARIÁVEIS GLOBAIS ---
let avaliacoes = JSON.parse(localStorage.getItem('sistemaRH_avaliacoes')) || [];
let editandoIndex = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Só tenta renderizar se tivermos sessão válida
    if (sessao) {
        renderizarAvaliacoes();
        if (sessao.tipo === 'admin') {
            renderizarUsuarios();
        }
    }
});

// --- 3. NAVEGAÇÃO DE ABAS ---
function mudarAba(aba) {
    // Esconde todas
    const viewAv = document.getElementById('view-avaliacoes');
    const viewUsr = document.getElementById('view-usuarios');
    
    if(viewAv) viewAv.style.display = 'none';
    if(viewUsr) viewUsr.style.display = 'none';
    
    // Tira classe ativa dos botões
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Mostra a escolhida
    const abaEscolhida = document.getElementById(`view-${aba}`);
    if (abaEscolhida) abaEscolhida.style.display = 'block';
    
    // Ativa o botão visualmente
    if(aba === 'avaliacoes') {
        const btn1 = document.querySelector('.tab-btn:first-child');
        if(btn1) btn1.classList.add('active');
    } else {
        const btn2 = document.getElementById('btn-aba-usuarios');
        if(btn2) btn2.classList.add('active');
    }
}

// --- 4. AVALIAÇÕES (CRUD) ---
const formAv = document.getElementById('form-avaliacao');
if(formAv) {
    formAv.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const registro = {
            nome: document.getElementById('av-nome').value,
            cargo: document.getElementById('av-cargo').value,
            data: document.getElementById('av-data').value,
            nota: parseFloat(document.getElementById('av-nota').value),
            meta: document.getElementById('av-meta').value,
            statusMeta: document.getElementById('av-statusMeta').value,
            feedback: document.getElementById('av-feedback').value
        };

        if (editandoIndex === null) {
            avaliacoes.push(registro);
            alert("Avaliação cadastrada!");
        } else {
            avaliacoes[editandoIndex] = registro;
            alert("Avaliação atualizada!");
            cancelarEdicao();
        }

        localStorage.setItem('sistemaRH_avaliacoes', JSON.stringify(avaliacoes));
        formAv.reset();
        renderizarAvaliacoes();
    });
}

function renderizarAvaliacoes() {
    const tbody = document.getElementById('tabela-avaliacoes');
    if(!tbody) return;
    
    const inputBusca = document.getElementById('busca-avaliacao');
    const termo = inputBusca ? inputBusca.value.toLowerCase() : "";
    
    tbody.innerHTML = '';

    avaliacoes.forEach((av, index) => {
        // Filtro de Busca
        if (av.nome && !av.nome.toLowerCase().includes(termo)) return;

        // Filtro de Privacidade (Se não for admin, só vê o próprio nome)
        if (sessao && sessao.tipo !== 'admin') {
            if (av.nome.toLowerCase().trim() !== sessao.nome.toLowerCase().trim()) {
                return; 
            }
        }

        // Regra de Cores
        let corTexto = "black";
        let textoAnalise = "Regular";
        
        if (av.statusMeta === 'nao_atingida') { textoAnalise = "Crítico"; corTexto = "red"; }
        else if (av.nota >= 8 && av.statusMeta === 'atingida') { textoAnalise = "Excelente"; corTexto = "green"; }
        else if (av.nota < 6) { textoAnalise = "Atenção"; corTexto = "orange"; }

        // Botões
        let btns = `<button class="btn-acao" style="background:#3498db" onclick="alert('${av.feedback}')">Ver Feedback</button>`;
        
        if(sessao && sessao.tipo === 'admin') {
            btns += `
                <button class="btn-acao btn-edit" onclick="editarAvaliacao(${index})">✏️</button>
                <button class="btn-acao btn-del" onclick="excluirAvaliacao(${index})">🗑️</button>
            `;
        }

        const linha = `
            <tr>
                <td><strong>${av.nome}</strong><br><small>${av.cargo}</small></td>
                <td>${av.meta} <br> <span class="badge ${av.statusMeta === 'atingida' ? 'bg-verde' : (av.statusMeta === 'parcial' ? 'bg-amarelo' : 'bg-vermelho')}">${av.statusMeta}</span></td>
                <td>${av.nota}</td>
                <td style="color:${corTexto}; font-weight:bold">${textoAnalise}</td>
                <td>${btns}</td>
            </tr>
        `;
        tbody.innerHTML += linha;
    });
    
    if (tbody.innerHTML === '') {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhuma avaliação encontrada.</td></tr>';
    }
}

function editarAvaliacao(index) {
    editandoIndex = index;
    const av = avaliacoes[index];
    document.getElementById('av-nome').value = av.nome;
    document.getElementById('av-cargo').value = av.cargo;
    document.getElementById('av-data').value = av.data;
    document.getElementById('av-nota').value = av.nota;
    document.getElementById('av-meta').value = av.meta;
    document.getElementById('av-statusMeta').value = av.statusMeta;
    document.getElementById('av-feedback').value = av.feedback;

    document.getElementById('btn-salvar-av').innerText = "Salvar Alterações";
    document.getElementById('btn-cancelar-av').style.display = "inline-block";
    document.getElementById('titulo-form-avaliacao').innerText = "Editando Registro";
    window.scrollTo(0,0);
}

function cancelarEdicao() {
    editandoIndex = null;
    document.getElementById('form-avaliacao').reset();
    document.getElementById('btn-salvar-av').innerText = "Salvar Avaliação";
    document.getElementById('btn-cancelar-av').style.display = "none";
    document.getElementById('titulo-form-avaliacao').innerText = "Nova Avaliação";
}

function excluirAvaliacao(index) {
    if(confirm("Deseja realmente excluir esta avaliação?")) {
        avaliacoes.splice(index, 1);
        localStorage.setItem('sistemaRH_avaliacoes', JSON.stringify(avaliacoes));
        renderizarAvaliacoes();
    }
}

// ============================================================
// --- 5. GESTÃO DE USUÁRIOS (SEM DUPLICIDADE) ---
// ============================================================

function salvarNovoUsuario() {
    // 1. Captura os dados
    const nome = document.getElementById('usr-nome').value;
    const email = document.getElementById('usr-email').value;
    const senha = document.getElementById('usr-senha').value;
    const tipo = document.getElementById('usr-tipo').value;

    // 2. Validação simples
    if (!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    // 3. Pega a lista do banco
    let listaUsuarios = JSON.parse(localStorage.getItem('sistemaRH_usuarios')) || [];

    // 4. Verifica duplicidade
    if(listaUsuarios.find(u => u.email === email)) {
        alert("ERRO: Este e-mail já está cadastrado!");
        return;
    }

    // 5. Salva
    const novoUsuario = {
        nome: nome,
        email: email,
        senha: senha,
        tipo: tipo,
        bloqueado: false
    };

    listaUsuarios.push(novoUsuario);
    localStorage.setItem('sistemaRH_usuarios', JSON.stringify(listaUsuarios));

    // 6. Limpa e Atualiza
    document.getElementById('form-usuario').reset();
    renderizarUsuarios();
    
    alert("Usuário criado com sucesso!");
}

function renderizarUsuarios() {
    const tbody = document.getElementById('tabela-usuarios');
    if(!tbody) return;

    tbody.innerHTML = '';
    let listaUsuarios = JSON.parse(localStorage.getItem('sistemaRH_usuarios')) || [];

    listaUsuarios.forEach((u, index) => {
        const isMainAdmin = (u.email === 'admin@empresa.com');
        const statusTexto = u.bloqueado ? "BLOQUEADO" : "ATIVO";
        const corStatus = u.bloqueado ? "red" : "green";
        
        let botoes = '';
        if(!isMainAdmin) {
            botoes = `
                <button class="btn-acao" style="background:#f39c12" onclick="toggleBloqueio(${index})">${u.bloqueado ? 'Desbloquear' : 'Bloquear'}</button>
                <button class="btn-acao btn-del" onclick="excluirUsuario(${index})">Excluir</button>
            `;
        }

        const linha = `
            <tr>
                <td><strong>${u.nome}</strong><br><small>${u.email}</small></td>
                <td>${u.tipo === 'admin' ? '<span class="badge bg-roxo">ADMIN</span>' : 'Comum'}</td>
                <td style="color:${corStatus}; font-weight:bold">${statusTexto}</td>
                <td>${botoes}</td>
            </tr>
        `;
        tbody.innerHTML += linha;
    });
}

function toggleBloqueio(index) {
    let lista = JSON.parse(localStorage.getItem('sistemaRH_usuarios'));
    lista[index].bloqueado = !lista[index].bloqueado;
    localStorage.setItem('sistemaRH_usuarios', JSON.stringify(lista));
    renderizarUsuarios();
}

function excluirUsuario(index) {
    if(confirm("Apagar este usuário?")) {
        let lista = JSON.parse(localStorage.getItem('sistemaRH_usuarios'));
        lista.splice(index, 1);
        localStorage.setItem('sistemaRH_usuarios', JSON.stringify(lista));
        renderizarUsuarios();
    }
}

// Logout Global
function logout() {
    sessionStorage.removeItem("sessaoUsuario");
    localStorage.removeItem("sessaoUsuario");
    window.location.href = "login.html";
}
