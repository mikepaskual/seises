const es = {
    board: {
        title: "MESA"
    },
    buttons: {
        configureGame:  "Configurar juego",
        howToPlay:      "Cómo jugar",
        nextTurn:       "Paso",
        startGame:      "Iniciar partida",
        viewHistory:    "Consultar movimientos",
        viewScoreboard: "Consultar marcador"
    },
    cards: {
        singular: "carta",
        plural:   "cartas"
    },
    footer: {
        author: "Desarrollado por",
        version: "Versión"
    },
    headings: {
        ia:     "IA",
        player: "Jugador",
        table:  "Mesa de juego"
    },
    history: {
        pass: "Pasó turno",
        play: "{value} de {suit}"
    },
    modal: {
        configureGame: {
            accept:            "Aceptar",
            cancel:            "Cancelar",
            humanPlayer:       "Tu nombre",
            numberOfOpponents: "Número de rivales",
            opponents:         "Rivales",
            opponentItem: [
                "Nombre del rival 1",
                "Nombre del rival 2",
                "Nombre del rival 3",
                "Nombre del rival 4"
            ],
            title: "Configuración del juego"
        },
        gameHistory: {
            close: "Cerrar",
            title: "Historial de movimientos"
        },
        howToPlay: {
            close: "¡Entiendo!",
            objective: {
                title:       "Objetivo",
                description: "Sé el primer jugador en jugar todas tus cartas."
            },
            rules: {
                title: "Reglas del juego",
                items: [
                    "Cualquier <strong>Seis</strong> inicia un palo.",
                    "Solo se puede jugar la carta inmediatamente superior o inferior del mismo palo.",
                    "La baraja española sigue este orden:",
                    "Después del <strong>7</strong>, la siguiente carta es el <strong>10</strong>.",
                    "Si no puedes jugar, se salta tu turno.",
                    "El primer jugador sin cartas restantes gana."
                ]
            },
            title: "Cómo jugar"
        },
        scoreboard: {
            close: "Cerrar",
            title: "Marcador"
        }
    },
    status: {
        computerPass:  "{name} pasa turno.",
        computerPlays: "{name} juega el {value} de {suit}.",
        computerWins:  "{name} gana.",
        newGame:       "Comienza una nueva partida.",
        playerPass:    "Pasas turno.",
        playerPlays:   "Juegas el {value} de {suit}.",
        playerWins:    "¡Has ganado!",
        title:         "Actividad de la partida"
    },
    suits: {
        bastos:  "Bastos",
        copas:   "Copas",
        espadas: "Espadas",
        oros:    "Oros",
    }
};