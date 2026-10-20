const $ = (id) => document.getElementById(id);

const estadoInicial = {
    nome: "Pipoca",
    pet: "🐱",
    fome: 80,
    felicidade: 80,
    energia: 80,
    higiene: 80,
    saude: 100,
    moedas: 0,
    experiencia: 0,
    ambiente: "sala",
    dormindo: false
};

let pet = carregarJogo();

function limitar(valor) {
    return Math.max(0, Math.min(100, valor));
}

function carregarJogo() {
    try {
        const salvo = localStorage.getItem("meuBichinhoSave");

        if (salvo) {
            const dados = JSON.parse(salvo);

            return {
                ...estadoInicial,
                ...dados,
                fome: limitar(Number(dados.fome)),
                felicidade: limitar(Number(dados.felicidade)),
                energia: limitar(Number(dados.energia)),
                higiene: limitar(Number(dados.higiene)),
                saude: limitar(Number(dados.saude)),
                moedas: Math.max(0, Number(dados.moedas) || 0),
                experiencia: Math.max(0, Number(dados.experiencia) || 0)
            };
        }
    } catch (erro) {
        console.warn("Não foi possível carregar o jogo.", erro);
    }

    return { ...estadoInicial };
}

function salvarJogo() {
    try {
        localStorage.setItem("meuBichinhoSave", JSON.stringify(pet));
    } catch (erro) {
        console.warn("Não foi possível salvar o jogo.", erro);
    }
}

function falar(mensagem) {
    $("fala").textContent = mensagem;
    $("mensagemFinal").textContent = mensagem;
}

function atualizarBarra(nome, valor) {
    const numero = Math.round(valor);

    $(nome + "Barra").style.width = numero + "%";
    $(nome + "Valor").textContent = numero + "%";
}

function atualizarTela() {
    $("nomeTitulo").textContent = pet.nome;
    $("moedas").textContent = pet.moedas;

    $("nivel").textContent =
        "Nível " + (Math.floor(pet.experiencia / 5) + 1);

    atualizarBarra("fome", pet.fome);
    atualizarBarra("felicidade", pet.felicidade);
    atualizarBarra("energia", pet.energia);
    atualizarBarra("higiene", pet.higiene);
    atualizarBarra("saude", pet.saude);

    $("pet").textContent = pet.pet;
    $("pet").classList.toggle("dormindo", pet.dormindo);

    $("nomePet").value = pet.nome;

    document.querySelectorAll("[data-room]").forEach((botao) => {
        botao.classList.toggle(
            "ativo",
            botao.dataset.room === pet.ambiente
        );
    });

    salvarJogo();
}

function ganharExperiencia(pontos = 1) {
    pet.experiencia += pontos;
}

function acordar() {
    if (pet.dormindo) {
        pet.dormindo = false;
    }
}

function cuidar(acao) {
    acordar();

    switch (acao) {
        case "alimentar":
            if (pet.fome >= 100) {
                falar("Minha barriguinha já está cheia! 😸");
                return;
            }

            pet.fome = limitar(pet.fome + 25);
            pet.felicidade = limitar(pet.felicidade + 5);
            pet.moedas += 1;
            ganharExperiencia();
            falar("Que comidinha deliciosa! 🍎😋");
            break;

        case "darBanho":
            if (pet.higiene >= 100) {
                falar("Já estou limpinho e cheiroso! 🫧");
                return;
            }

            pet.higiene = limitar(pet.higiene + 40);
            pet.felicidade = limitar(pet.felicidade + 5);
            pet.moedas += 1;
            ganharExperiencia();
            falar("Adoro ficar limpinho! 🛁✨");
            break;

        case "brincar":
            if (pet.energia < 15) {
                falar("Estou cansadinho! Preciso descansar. 😴");
                return;
            }

            pet.felicidade = limitar(pet.felicidade + 25);
            pet.energia = limitar(pet.energia - 15);
            pet.fome = limitar(pet.fome - 5);
            pet.moedas += 2;
            ganharExperiencia(2);
            falar("Oba! Vamos brincar de novo! 🧸🎉");
            pularPet();
            break;

        case "dormir":
            if (pet.energia >= 100) {
                falar("Já estou cheio de energia! Vamos brincar? ☀️");
                return;
            }

            pet.dormindo = true;
            pet.energia = limitar(pet.energia + 35);
            pet.fome = limitar(pet.fome - 5);
            falar("Zzz... Sonhando com petiscos! 🌙💤");
            break;

        case "carinho":
            pet.felicidade = limitar(pet.felicidade + 15);
            pet.saude = limitar(pet.saude + 3);
            pet.moedas += 1;
            ganharExperiencia();
            falar("Awn! Amo receber carinho! 🥰💕");
            pularPet();
            break;
    }

    atualizarSaude();
    atualizarTela();
}

function atualizarSaude() {
    const necessidades = [
        pet.fome,
        pet.felicidade,
        pet.energia,
        pet.higiene
    ];

    const media = necessidades.reduce((soma, valor) => {
        return soma + valor;
    }, 0) / necessidades.length;

    if (media < 25) {
        pet.saude = limitar(pet.saude - 3);
    } else if (media > 60) {
        pet.saude = limitar(pet.saude + 1);
    }
}

function pularPet() {
    const elemento = $("pet");

    elemento.classList.remove("pulando");

    // Reinicia a animação do bichinho.
    void elemento.offsetWidth;

    elemento.classList.add("pulando");

    elemento.addEventListener("animationend", () => {
        elemento.classList.remove("pulando");
    }, { once: true });
}

const ambientes = {
    sala: {
        nome: "🛋️ Sala de estar",
        classe: "sala",
        fala: "Explore a sala com seu amiguinho!",
        objetos: [
            { emoji: "🪴", nome: "Planta", acao: "planta" },
            { emoji: "🛋️", nome: "Sofá", acao: "sofa" },
            { emoji: "🧸", nome: "Brinquedo", acao: "brincar" }
        ]
    },
    quarto: {
        nome: "🛏️ Quarto",
        classe: "quarto",
        fala: "O que vamos fazer no quarto?",
        objetos: [
            { emoji: "🧸", nome: "Ursinho", acao: "brincar" },
            { emoji: "🛏️", nome: "Cama", acao: "dormir" },
            { emoji: "🪟", nome: "Janela", acao: "janela" }
        ]
    },
    cozinha: {
        nome: "🍳 Cozinha",
        classe: "cozinha",
        fala: "Vamos preparar uma comidinha!",
        objetos: [
            { emoji: "🍎", nome: "Maçã", acao: "alimentar" },
            { emoji: "🧊", nome: "Geladeira", acao: "geladeira" },
            { emoji: "🍲", nome: "Panela", acao: "alimentar" }
        ]
    },
    banheiro: {
        nome: "🛁 Banheiro",
        classe: "banheiro",
        fala: "Hora de cuidar da higiene!",
        objetos: [
            { emoji: "🧴", nome: "Shampoo", acao: "darBanho" },
            { emoji: "🛁", nome: "Banheira", acao: "darBanho" },
            { emoji: "🪞", nome: "Espelho", acao: "espelho" }
        ]
    },
    quintal: {
        nome: "🌳 Quintal",
        classe: "quintal",
        fala: "Vamos explorar o quintal!",
        objetos: [
            { emoji: "🌷", nome: "Flores", acao: "flores" },
            { emoji: "🌳", nome: "Árvore", acao: "arvore" },
            { emoji: "🦋", nome: "Borboleta", acao: "borboleta" }
        ]
    }
};

function trocarAmbiente(nome) {
    const ambiente = ambientes[nome];
    if (!ambiente) return;

    pet.ambiente = nome;

    $("cenario").className = "cenario " + ambiente.classe;
    $("nomeCenario").textContent = ambiente.nome;

    $("decoracao").innerHTML = ambiente.objetos.map((objeto, indice) => `
        <button
            type="button"
            class="objeto objeto${indice + 1}"
            data-acao="${objeto.acao}"
            aria-label="${objeto.nome}"
            title="${objeto.nome}"
        >${objeto.emoji}</button>
    `).join("");

    // Reposiciona o pet ao entrar em outro cômodo.
    $("pet").style.left = "50%";
    $("pet").style.top = "60%";

    falar(ambiente.fala);
    atualizarTela();
}

$("salvarNome").addEventListener("click", () => {
    const nome = $("nomePet").value.trim();

    if (!nome) {
        falar("Escolha um nome para o seu amiguinho! 💕");
        return;
    }

    pet.nome = nome.slice(0, 16);
    falar("Oi! Meu nome é " + pet.nome + "! 🐾");
    atualizarTela();
});

$("nomePet").addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        $("salvarNome").click();
    }
});

$("alimentar").addEventListener("click", () => cuidar("alimentar"));
$("darBanho").addEventListener("click", () => cuidar("darBanho"));
$("brincar").addEventListener("click", () => cuidar("brincar"));
$("dormir").addEventListener("click", () => cuidar("dormir"));
$("carinho").addEventListener("click", () => cuidar("carinho"));

$("pet").addEventListener("click", (evento) => {
    evento.stopPropagation();
    cuidar("carinho");
});

document.querySelectorAll("[data-room]").forEach((botao) => {
    botao.addEventListener("click", () => {
        trocarAmbiente(botao.dataset.room);
    });
});

$("reiniciar").addEventListener("click", () => {
    const confirmar = confirm(
        "Deseja recomeçar? Todo o progresso salvo deste jogo será apagado."
    );

    if (!confirmar) return;

    pet = { ...estadoInicial };

    try {
        localStorage.removeItem("meuBichinhoSave");
    } catch (erro) {
        console.warn("Não foi possível limpar o salvamento.", erro);
    }

    trocarAmbiente("sala");
    falar("Olá! Vamos começar nossa aventura? 🐣💕");
    atualizarTela();
});

// O tempo passa mesmo quando você não aperta os botões.
setInterval(() => {
    if (pet.dormindo) {
        pet.energia = limitar(pet.energia + 3);
        pet.fome = limitar(pet.fome - 1);
        pet.higiene = limitar(pet.higiene - 1);

        if (pet.energia >= 100) {
            pet.dormindo = false;
            falar("Bom dia! Acordei cheio de energia! ☀️");
        }
    } else {
        pet.fome = limitar(pet.fome - 2);
        pet.felicidade = limitar(pet.felicidade - 1);
        pet.energia = limitar(pet.energia - 1);
        pet.higiene = limitar(pet.higiene - 1);
    }

    atualizarSaude();
    atualizarTela();

    if (pet.saude <= 20) {
        falar("Preciso de muitos cuidados para ficar bem! ❤️");
    } else if (pet.fome <= 20) {
        falar("Minha barriguinha está roncando! 🍎");
    } else if (pet.energia <= 20 && !pet.dormindo) {
        falar("Estou com soninho... 🌙");
    }
}, 15000);

// Abre o jogo com o ambiente que estava salvo.
trocarAmbiente(pet.ambiente);
atualizarTela();