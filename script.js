// --- 1. GESTÃO DE SESSÃO (BLINDADA) ---
let sessao = null;

try {
    let jsonSessao = sessionStorage.getItem("sessaoUsuario") || localStorage.getItem("sessaoUsuario");
    if (!jsonSessao) throw new Error("Nenhuma sessão encontrada");
    sessao = JSON.parse(jsonSessao);
    if (!sessao.logado) throw new Error("Usuário não está logado");
} catch (erro) {
    console.warn("Redirecionando para login:", erro.message);
    if (!window.location.href.includes("login.html")) {
        window.location.href = "login.html";
    }
}

// Exibe nome do usuário
const welcomeMsg = document.getElementById('welcome-msg');
if (welcomeMsg && sessao) {
    welcomeMsg.innerText = `Olá, ${sessao.nome} (${sessao.tipo === 'admin' ? 'Administrador' : 'Visitante'})`;
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
    renderizarAvaliacoes();
    if (sessao && sessao.tipo === 'admin') {
        renderizarUsuarios();
    }
});

// --- 3. NAVEGAÇÃO DE ABAS ---
function mudarAba(aba) {
    document.getElementById('view-avaliacoes').style.display = 'none';
    document.getElementById('view-usuarios').style.display = 'none';
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`view-${aba}`).style.display = 'block';
    
    if(aba === 'avaliacoes') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
    } else {
        document.getElementById('btn-aba-usuarios').classList.add('active');
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
    
    const termo = document.getElementById('busca-avaliacao').value.toLowerCase();
    tbody.innerHTML = '';

    avaliacoes.forEach((av, index) => {
        // 1. FILTRO DA BARRA DE PESQUISA
        if (!av.nome.toLowerCase().includes(termo)) return;

        // --- NOVO: FILTRO DE PRIVACIDADE ---
        // Se o usuário NÃO for admin...
        if (sessao.tipo !== 'admin') {
            // ...e o nome na avaliação for diferente do nome do usuário logado...
            // Usamos toLowerCase() e trim() para evitar erros com maiúsculas ou espaços
            if (av.nome.toLowerCase().trim() !== sessao.nome.toLowerCase().trim()) {
                return; // Pula esta linha (não mostra na tela)
            }
        }
        // -----------------------------------

        // Regra de Cores
        let corTexto = "black";
        let textoAnalise = "Regular";
        
        if (av.statusMeta === 'nao_atingida') { textoAnalise = "Crítico"; corTexto = "red"; }
        else if (av.nota >= 8 && av.statusMeta === 'atingida') { textoAnalise = "Excelente"; corTexto = "green"; }
        else if (av.nota < 6) { textoAnalise = "Atenção"; corTexto = "orange"; }

        // Botões Admin
        let btns = `<button class="btn-acao" style="background:#3498db" onclick="alert('${av.feedback}')">Ver Feedback</button>`;
        
        if(sessao.tipo === 'admin') {
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
    
    // Aviso caso a tabela fique vazia para o funcionário
    if (tbody.innerHTML === '') {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhuma avaliação encontrada para você.</td></tr>';
    }
}

        // Botões Admin (Sem botão de histórico)
        let btns = `<button class="btn-acao" style="background:#3498db" onclick="alert('${av.feedback}')">Ver Feedback</button>`;
        
        if(sessao.tipo === 'admin') {
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
    ;

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

// --- 5. GESTÃO DE USUÁRIOS (Admin) ---
const formUsr = document.getElementById('form-usuario');
if(formUsr) {
    formUsr.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const novoUser = {
            nome: document.getElementById('usr-nome').value,
            email: document.getElementById('usr-email').value,
            senha: document.getElementById('usr-senha').value,
            tipo: document.getElementById('usr-tipo').value,
            bloqueado: false
        };

        let listaAtualizada = JSON.parse(localStorage.getItem('sistemaRH_usuarios')) || [];
        
        if(listaAtualizada.find(u => u.email === novoUser.email)) {
            alert("ERRO: E-mail já cadastrado!");
            return;
        }

        listaAtualizada.push(novoUser);
        localStorage.setItem('sistemaRH_usuarios', JSON.stringify(listaAtualizada));
        
        formUsr.reset();
        renderizarUsuarios();
        alert("Usuário criado com sucesso!");
    });
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
// ============================================================
// LÓGICA DE CADASTRO DE USUÁRIOS (Cole isso no final do script.js)
// ============================================================

const formUsr = document.getElementById('form-usuario');

// 1. Verifica se o formulário existe na tela antes de tentar usar
if (formUsr) {
    formUsr.addEventListener('submit', function(e) {
        e.preventDefault(); // IMPEDE A PÁGINA DE RECARREGAR
        
        // 2. Captura os dados digitados
        const nome = document.getElementById('usr-nome').value;
        const email = document.getElementById('usr-email').value;
        const senha = document.getElementById('usr-senha').value;
        const tipo = document.getElementById('usr-tipo').value;

        // 3. Pega a lista atual do banco de dados
        let listaUsuarios = JSON.parse(localStorage.getItem('sistemaRH_usuarios')) || [];
        
        // 4. Verifica se o e-mail já existe (para não duplicar)
        const emailExiste = listaUsuarios.find(u => u.email === email);
        if (emailExiste) {
            alert("ERRO: Este e-mail já possui cadastro!");
            return; // Para o código aqui
        }

        // 5. Cria o novo objeto de usuário
        const novoUsuario = {
            nome: nome,
            email: email,
            senha: senha,
            tipo: tipo,
            bloqueado: false
        };

        // 6. Salva e Atualiza
        listaUsuarios.push(novoUsuario);
        localStorage.setItem('sistemaRH_usuarios', JSON.stringify(listaUsuarios));
        
        // 7. Limpa o formulário e avisa
        formUsr.reset();
        renderizarUsuarios(); // Desenha a tabela novamente
        alert("Usuário criado com sucesso!");
    });
}
