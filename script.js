document.addEventListener('DOMContentLoaded', () => {
    // Referências DOM
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');
    const form = document.getElementById('data-form');
    const qrContainer = document.getElementById('qrcode');
    const qrResult = document.getElementById('qr-result');
    
    // Elementos de Detalhes do Resultado
    const resNome = document.getElementById('res-nome');
    const resEndereco = document.getElementById('res-endereco');
    const resCodigo = document.getElementById('res-codigo');

    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const registerCard = document.getElementById('register-card');
    const newRegisterBtn = document.getElementById('new-register-btn');
    const historyCard = document.querySelector('.history-card');

    // 1. Tela de Carregamento (3 segundos)
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            appContainer.style.display = 'block';
        }, 500); // Aguarda a transição de opacidade terminar
    }, 3000);

    // Carregar histórico ao iniciar
    loadHistory();

    // 2. Manipulação do Formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const endereco = document.getElementById('endereco').value.trim();
        const codigo = document.getElementById('codigo').value.trim();

        // Validação extra para 7 dígitos
        if (!/^\d{7}$/.test(codigo)) {
            alert('O código de rastreio deve conter exatamente 7 números.');
            return;
        }

        // Dados combinados
        const dados = {
            id: Date.now(),
            nome,
            endereco,
            codigo,
            dataHora: new Date().toLocaleString('pt-BR')
        };

        // Gerar string para o QR Code (JSON)
        const qrString = JSON.stringify({
            n: nome,
            e: endereco,
            c: codigo
        });

        // 3. Gerar QR Code e Salvar
        try {
            // Salvar Dados PRIMEIRO
            saveData(dados);

            // PREPARAR UI (Mostrar container ANTES de gerar QR para evitar erro de dimensão)
            qrResult.classList.remove('hidden');
            registerCard.classList.add('hidden');
            historyCard.classList.add('hidden');
            
            // Preencher os detalhes
            resNome.textContent = nome;
            resEndereco.textContent = endereco;
            resCodigo.textContent = codigo;

            // Gerar QR (Agora o container está visível)
            qrContainer.innerHTML = ''; 
            new QRCode(qrContainer, {
                text: qrString,
                width: 200,
                height: 200,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });

            // Scroll suave até o QR Code
            qrResult.scrollIntoView({ behavior: 'smooth' });
        } catch (e) {
            console.error(e);
            alert('Ocorreu um erro ao gerar o registro: ' + e.message);
            // Reverter UI em caso de erro
            qrResult.classList.add('hidden');
            registerCard.classList.remove('hidden');
            historyCard.classList.remove('hidden');
        }
    });

    // Botão de Novo Cadastro
    newRegisterBtn.addEventListener('click', () => {
        form.reset();
        qrContainer.innerHTML = '';
        qrResult.classList.add('hidden');
        registerCard.classList.remove('hidden');
        historyCard.classList.remove('hidden');
        
        // Remove estilos inline que possam ter sido adicionados anteriormente
        registerCard.style.display = '';
        historyCard.style.display = '';
    });

    // Funções de Armazenamento
    function saveData(item) {
        let history = JSON.parse(localStorage.getItem('rastreioHistory')) || [];
        history.unshift(item); // Adiciona no início
        localStorage.setItem('rastreioHistory', JSON.stringify(history));
        renderHistory();
    }

    function loadHistory() {
        renderHistory();
    }

    function renderHistory() {
        let history = JSON.parse(localStorage.getItem('rastreioHistory')) || [];
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<li style="padding:10px; text-align:center; color:#9ca3af;">Nenhum registro salvo ainda.</li>';
            return;
        }

        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-info">
                    <strong>${item.codigo}</strong>
                    <span>${item.nome}</span>
                </div>
                <div style="font-size: 0.75rem; color: #9ca3af;">
                    ${item.dataHora.split(' ')[0]}
                </div>
            `;
            // Re-clicar no histórico poderia regenerar o QR Code (feature extra)
            li.addEventListener('click', () => {
                 document.getElementById('nome').value = item.nome;
                 document.getElementById('endereco').value = item.endereco;
                 document.getElementById('codigo').value = item.codigo;
                 qrResult.classList.add('hidden'); // Esconde o anterior até gerar novo
                 window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            historyList.appendChild(li);
        });
    }

    // Limpar histórico
    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Tem certeza que deseja limpar todo o histórico?')) {
            localStorage.removeItem('rastreioHistory');
            renderHistory();
        }
    });
});
