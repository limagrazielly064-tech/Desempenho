const formLogin = document.getElementById('form-login');
const formAlterar = document.getElementById('form-alterar');
const msgErro = document.getElementById('msg-erro');
const msgSucesso = document.getElementById('msg-sucesso');

// --- 1. GARANTIR ADMIN PADRÃO ---
// Verifica o banco de dados. Se estiver vazio ou sem admin, cria um.
let usuariosSalvos = JSON.parse(localStorage.getItem('sistemaRH_usuarios')) || [];
const adminExiste = usuariosSalvos.find(u => u.email === 'admin@empresa.com');

if (!adminExiste) {
    usuariosSalvos.push({
        nome: "Administrador Principal",
        email: "admin@empresa.com",
        senha: "123456",
        tipo: "admin",
        bloqueado: false
    });
    localStorage.setItem('sistemaRH_usuarios', JSON.stringify(usuariosSalvos));
}

// --- 2. LÓGICA DE LOGIN ---
if (formLogin) {
    formLogin.addEventListener('submit', function(event) {
        event.preventDefault();
        limparMensagens();

        const email = document.getElementById('email-login').value;
        const senha = document.getElementById('senha-login').value;
        
        // Recarrega os usuários do banco (para pegar atualizações)
        const usuarios = JSON.parse(localStorage.getItem('sistemaRH_usuarios')) || [];
        const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);

        if (usuarioEncontrado) {
            // Verifica Bloqueio
            if (usuarioEncontrado.bloqueado) {
                mostrarErro("Usuário bloqueado. Contate o administrador.");
                return;
            }

            // Cria o objeto da sessão
            const sessao = {
                logado: true,
                nome: usuarioEncontrado.nome,
                tipo: usuarioEncontrado.tipo
            };
            
            // Verifica se quer "Manter Conectado"
            const elCheckbox = document.getElementById('manter-conectado');
            const manterConectado = elCheckbox ? elCheckbox.checked : false;

            if (manterConectado) {
                // Salva no LocalStorage (Permanente)
                localStorage.setItem("sessaoUsuario", JSON.stringify(sessao));
            } else {
                // Salva no SessionStorage (Temporário)
                sessionStorage.setItem("sessaoUsuario", JSON.stringify(sessao));
            }
            
            // Redireciona para o painel
            window.location.href = "index.html";

        } else {
            mostrarErro("E-mail ou senha incorretos.");
        }
    });
}

// --- 3. LÓGICA DE ALTERAR SENHA ---
if (formAlterar) {
    formAlterar.addEventListener('submit', function(event) {
        event.preventDefault();
        limparMensagens();

        const email = document.getElementById('alt-email').value;
        const senhaAntiga = document.getElementById('alt-senha-antiga').value;
        const senhaNova = document.getElementById('alt-senha-nova').value;
        
        let usuarios = JSON.parse(localStorage.getItem('sistemaRH_usuarios')) || [];
        const index = usuarios.findIndex(u => u.email === email && u.senha === senhaAntiga);

        if (index !== -1) {
            usuarios[index].senha = senhaNova;
            localStorage.setItem('sistemaRH_usuarios', JSON.stringify(usuarios));
            
            mostrarSucesso("Senha alterada com sucesso! Faça login.");
            document.getElementById('form-alterar').reset();
            
            // Volta para a tela de login após 2 segundos
            setTimeout(() => {
                alternarFormulario('login');
                limparMensagens();
            }, 2000);
        } else {
            mostrarErro("E-mail ou senha atual incorretos.");
        }
    });
}

// --- FUNÇÕES VISUAIS ---
function alternarFormulario(modo) {
    limparMensagens();
    if (modo === 'alterar') {
        formLogin.style.display = 'none';
        formAlterar.style.display = 'block';
        document.getElementById('titulo-login').innerText = "Definir nova senha";
    } else {
        formLogin.style.display = 'block';
        formAlterar.style.display = 'none';
        document.getElementById('titulo-login').innerText = "Insira suas credenciais";
    }
}

function mostrarErro(texto) {
    if(msgErro) {
        msgErro.style.display = 'block';
        msgErro.innerText = texto;
    } else {
        alert(texto);
    }
}

function mostrarSucesso(texto) {
    if(msgSucesso) {
        msgSucesso.style.display = 'block';
        msgSucesso.innerText = texto;
    }
}

function limparMensagens() {
    if(msgErro) msgErro.style.display = 'none';
    if(msgSucesso) msgSucesso.style.display = 'none';
}