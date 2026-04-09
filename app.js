/**
 * ARQUITETURA DE JOGO INCREMENTAL: PRODUTOR MUSICAL
 * Construído em Vanilla JavaScript (Sem dependências ext.)
 */

// 1. Árvore da Máquina de Estado de Retenção Absoluta 
let state = {
    streams: 0,
    pps: 0, // Streams (Passivo) Por Segundo
    expenses: 0, // Custo fixo passivo que instiga falência [23, 31]
    clickValue: 1,
    isGameOver: false,
    hasWon: false,
    
    // Modelagem de Dados Baseados na Escala Exponencial c = c0 * r^n 
    upgrades: [
        { name: "Microfone Condensador", baseCost: 10, currentCost: 10, ppsAdd: 0.1, costAdd: 0, count: 0, rate: 1.15 },
        { name: "Software de Produção", baseCost: 100, currentCost: 100, ppsAdd: 1, costAdd: 0, count: 0, rate: 1.15 },
        { name: "Instrumentos Virtuais", baseCost: 500, currentCost: 500, ppsAdd: 5, costAdd: 0, count: 0, rate: 1.15 },
        { name: "Estúdio Caseiro", baseCost: 2000, currentCost: 2000, ppsAdd: 20, costAdd: 2, count: 0, rate: 1.15 },
        { name: "Equipe de Marketing", baseCost: 10000, currentCost: 10000, ppsAdd: 100, costAdd: 10, count: 0, rate: 1.15 }
    ]
};

// Marcos Lógicos Base de Limite [24]
const VICTORY_GOAL = 1000000;
let lastFrameTime = 0;
let saveIntervalId;

// Referenciamento do DOM em Constantes Aceleradas (Evita pesquisa na árvore repetidamente)
const domStreams = document.getElementById('total-streams');
const domPPS = document.getElementById('pps-rate');
const domClickZone = document.getElementById('click-zone');
const domUpgradeList = document.getElementById('upgrade-list');
const domStatus = document.getElementById('system-message');
const domOverlay = document.getElementById('start-overlay');

// Engenharia do Sub-Módulo de Áudio 
// Arquivos estáticos locais; O navegador falhará graciosamente se não encontrados
const sfxClick = new Audio('assets/kick-drum.mp3');
const sfxBuy = new Audio('assets/cash-register.mp3');

// 2. Controladores de Engajamento e Mecanismos Básicos
function initGame() {
    loadProgress(); // Tenta recuperar a memória em base morta do LocalStorage 
    recalculateMetrics(); // Rebalança todos os custos e produção na inicialização segura
    renderStore(); // Expõe os itens atualizados no menu
    updateCounters(); // Pintura inicial 

    // Alinhamento de ciclo nativo desacoplado da fila de macros
    lastFrameTime = performance.now();
    requestAnimationFrame(mainGameLoop);

    // Sistema Síncrono Intervalar Preventivo de Corrupção (A cada 10s) [33, 35]
    saveIntervalId = setInterval(saveProgress, 10000);
}

// Interação principal originada da fenda do usuário do clique na tela principal
domClickZone.addEventListener('mousedown', () => {
    if(state.isGameOver || state.hasWon) return; // Nega acesso em suspensão narrativa
    
    state.streams += state.clickValue;
    
    // Anulação de Cursor do Buffer: Essencial para Sobreposições ininterruptas 
    sfxClick.currentTime = 0; 
    sfxClick.play().catch(e => console.warn("Interação de áudio contida")); 
    
    updateCounters();
});

// Resolução de Conflitos e Gatilho da Política Antibloqueio de Automação [44, 45]
document.getElementById('btn-start').addEventListener('click', () => {
    domOverlay.classList.remove('active');
    // A ativação manual em contexto realimenta e aprova canais globais na página 
    initGame(); 
});

// 3. Mecanismos Transacionais e Econômicos 
window.purchaseUpgrade = function(index) {
    if(state.isGameOver || state.hasWon) return;

    let item = state.upgrades[index];
    if (state.streams >= item.currentCost) {
        state.streams -= item.currentCost;
        item.count++;
        
        // C_n = C_0 * r^n (Arredondamento imperativo de inflação financeira para valores limpos) [14]
        item.currentCost = Math.floor(item.baseCost * Math.pow(item.rate, item.count));
        
        sfxBuy.currentTime = 0;
        sfxBuy.play().catch(e=>e);

        recalculateMetrics();
        renderStore();
        updateCounters();
    }
};

function recalculateMetrics() {
    let rawPPS = 0;
    let rawExpenses = 0;

    state.upgrades.forEach(item => {
        rawPPS += (item.count * item.ppsAdd);
        rawExpenses += (item.count * item.costAdd);
    });

    state.pps = rawPPS;
    state.expenses = rawExpenses;
}

// 4. O Coração Assíncrono da Execução Paralela (Temporalização Indep. da Máquina) 
function mainGameLoop(timestamp) {
    if(state.isGameOver || state.hasWon) return;

    // Cálculo exato de decaimento em base segundos decorridos reais (Delta) 
    const deltaSeconds = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    if (deltaSeconds > 0) {
        let netIncome = state.pps - state.expenses;
        state.streams += (netIncome * deltaSeconds);
    }

    evaluateWinLossBoundaries(); // Sonda barreiras na matriz global [27]
    updateCounters();

    // Invoca auto-chamada de encadeamento no término do processamento do quadro em tela 
    requestAnimationFrame(mainGameLoop); 
}

// 5. Avaliação Condicional Lógica Fria (Vitória e Derrota) [23, 24, 31]
function evaluateWinLossBoundaries() {
    // DERROTA: Endividamento fatal de Custos Operacionais suprimindo o lastro do Banco 
    if (state.streams < 0) {
        state.streams = 0; // Previne o exibicionismo do negativo feio na UI gráfica
        state.isGameOver = true;
        domStatus.innerHTML = "<span style='color:#e74c3c'>FALÊNCIA! Os custos de locação arruinaram sua carreira. Jogo encerrado.</span>";
        clearInterval(saveIntervalId);
        return;
    }

    // VITÓRIA: Obtenção cumulativa da marca fundamental estipulada pela premissa [24]
    if (state.streams >= VICTORY_GOAL &&!state.hasWon) {
        state.hasWon = true;
        domStatus.innerHTML = "<span style='color:#00d26a'>MÁXIMO ALCANCE! Sua música virou hit global e a Maior Gravadora assumiu seu selo!</span>";
        saveProgress();
    }
}

// 6. Atualização Otimizada de Visualização (Não altera layout, apenas Texto de nós ativados)
function updateCounters() {
    // Math.floor para truncar decimais que crescem linearmente pela adição temporal 
    domStreams.innerText = Math.floor(state.streams).toLocaleString('pt-BR');
    
    let net = state.pps - state.expenses;
    domPPS.innerText = `${net >= 0? '+' : ''}${net.toFixed(1)}/seg`;
    if(net < 0) domPPS.style.color = "#e74c3c";
    else domPPS.style.color = "white";

    // Reatividade de Bloqueio Botões visuais do painel 
    const btns = document.querySelectorAll('.btn-buy');
    btns.forEach((btn, index) => {
        btn.disabled = state.streams < state.upgrades[index].currentCost;
    });
}

function renderStore() {
    domUpgradeList.innerHTML = ''; // Limpeza brutal e reestruturação da fenda da tabela DOM
    state.upgrades.forEach((item, index) => {
        let costPenaltyStr = item.costAdd > 0? ` <span style="color:#e74c3c">(-${item.costAdd} custo fixo/seg)</span>` : '';
        const li = document.createElement('li');
        li.className = 'upgrade-item';
        li.innerHTML = `
            <div class="upgrade-details">
                <strong>${item.name} <span style="color:var(--color-accent)">(x${item.count})</span></strong>
                <span>+${item.ppsAdd} Streams/s${costPenaltyStr}</span>
            </div>
            <button class="btn-buy" onclick="purchaseUpgrade(${index})">
                $${item.currentCost.toLocaleString('pt-BR')}
            </button>
        `;
        domUpgradeList.appendChild(li);
    });
}

// 7. Modulação Crucial de Persistência em Memória Rígida 
function saveProgress() {
    if(state.isGameOver) return; // Nega preservação da podridão falida
    try {
        // Objeto em Cascata aninhada colapsado perfeitamente na string JSON 
        localStorage.setItem('beatMasterGameSavedState', JSON.stringify(state));
    } catch (e) {
        console.error("Inviabilidade de acesso estrito I/O na máquina do cliente", e);
    }
}

function loadProgress() {
    try {
        const memoryString = localStorage.getItem('beatMasterGameSavedState');
        if (memoryString) {
            let parsedState = JSON.parse(memoryString);
            // Previne mesclagem fatal forçando preenchimento ordenado
            if(!parsedState.isGameOver) state = parsedState; 
        }
    } catch (e) {
        console.warn("Nó de arquivo corrompido ou inexistente. Redefinindo fita inicial.", e);
    }
}

// 8. Reinicialização Contratual
document.getElementById('btn-save').addEventListener('click', () => { saveProgress(); alert("Jogo salvo com sucesso!"); });
document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm("Deseja expurgar toda a carreira fonográfica? Isso é irremediável!")) {
        // 1. Remove os dados salvos fisicamente do navegador
        localStorage.removeItem('beatMasterGameSavedState');

        // 2. Verifica se o loop de jogo havia sido paralisado por Falência/Vitória
        const wasLoopDead = state.isGameOver || state.hasWon;

        // 3. Reseta o estado lógico interno manualmente 
        state.streams = 0;
        state.pps = 0;
        state.expenses = 0;
        state.clickValue = 1;
        state.isGameOver = false;
        state.hasWon = false;

        // 4. Zera o inventário da loja para as configurações iniciais
        state.upgrades.forEach(item => {
            item.count = 0;
            item.currentCost = item.baseCost;
        });

        // 5. Restaura a interface visual
        document.getElementById('system-message').innerHTML = "O estúdio de garagem aguarda a primeira batida...";
        recalculateMetrics();
        renderStore();
        updateCounters();

        // 6. Reativa o Motor Principal caso o jogo tivesse acabado
        if (wasLoopDead) {
            lastFrameTime = performance.now();
            requestAnimationFrame(mainGameLoop);
            
            clearInterval(saveIntervalId);
            saveIntervalId = setInterval(saveProgress, 10000);
        }

        // 7. Tenta o recarregamento da página como via de redundância
        window.location.reload();
    }
});