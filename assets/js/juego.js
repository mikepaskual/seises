const DEFAULT_LANGUAGE = "es";

const DELAY_TIME = 700;

let playerTurnInProgress = false;

const STARTING_CARD   = '6O';
const STARTING_VALUE  = 6;
const lowerValue   = 1;
const highestValue = 12;
let excludedValues = [8, 9];
const types        = ['B', 'C', 'E', 'O'];
const SUITS = {
    B: "bastos",
    C: "copas",
    E: "espadas",
    O: "oros"
};

const DEFAULT_OPPONENT_NAMES = [
	"ZEUS",
	"ARES",
	"HADES",
	"APOLLO",
	"HERMES",
	"POSEIDON",
	"ATHENA",
	"ARTEMIS",
	"DIONYSUS",
	"HEPHAESTUS",
	"ANUBIS",
	"RA",
	"OSIRIS",
	"HORUS",
	"SET",
	"THOTH",
	"ODIN",
	"THOR",
	"LOKI",
	"TYR",
	"FREYA",
	"BALDER",
	"HEIMDALL",
	"FENRIR",
	"VALKYRIE",
	"MEDUSA",
	"MINOTAUR",
	"CERBERUS",
	"PEGASUS",
	"HYDRA",
	"KRATOS",
	"ORPHEUS",
	"MERLIN",
	"EXCALIBUR",
	"TITAN",
	"QUETZALCOATL",
	"INDRA",
	"SHIVA",
	"VISHNU",
	"AMATERASU",
	"TSUKUYOMI",
	"SUSANOO",
	"RAIJIN"
];

const getRandomOpponentName = usedNames => {

	const availableNames = DEFAULT_OPPONENT_NAMES.filter(
		name => !usedNames.has(name)
	);

	if (availableNames.length === 0) {
		return null;
	}

	const randomIndex = Math.floor(
		Math.random() * availableNames.length
	);

	return availableNames[randomIndex];
};

const getCardValueName = value =>
    [1, 10, 11, 12].includes(value)
        ? t(`cards.values.${value}`)
        : value;

const generateOpponentNames = (humanName, opponentNames) => {

	const usedNames = new Set([
		humanName.toUpperCase(),
		...opponentNames
			.filter(name => name !== "")
			.map(name => name.toUpperCase())
	]);

	return opponentNames.map(name => {

		if (name !== "") {
			return name.toUpperCase();
		}

		const generatedName = getRandomOpponentName(usedNames);

		usedNames.add(generatedName);

		return generatedName;
	});
};

let gameOver  = false;
let firstMove = false;

const GAME_STATES = {
	NOT_CONFIGURED: "not-configured",
	CONFIGURED:     "configured",
	PLAYING:        "playing",
	FINISHED:       "finished"
};

let gameState = GAME_STATES.NOT_CONFIGURED;

const PLAYER   = 0;
const COMPUTER = 1;

const PLAYER_TYPES = {
	HUMAN:    "human",
	COMPUTER: "computer"
};

let players = [];

let currentPlayer = PLAYER;

let gameHistory   = [];

const playerCards   = () => players[PLAYER].cards;

const orosCardsContainer    = document.querySelector('#oros-cards-container');
const copasCardsContainer   = document.querySelector('#copas-cards-container');
const bastosCardsContainer  = document.querySelector('#bastos-cards-container');
const espadasCardsContainer = document.querySelector('#espadas-cards-container');

const nextTurnContainer = document.querySelector('#next-turn-container');

const configureGameButton = document.querySelector('#configure-game');
const startGameButton     = document.querySelector('#start-game');

const scoreboardElement       = document.querySelector('#scoreboard-modal-container');
const viewScoreboardButton    = document.querySelector('#view-scoreboard');
const scoreboardWinnerElement = document.querySelector('#scoreboard-winner');
const scoreboardModalElement  = document.querySelector('#scoreboardModal');
const statusPanel             = document.querySelector('#status-panel');
const playersContainer        = document.querySelector('#players-container');
const playerHandContainer     = document.querySelector('#player-hand-container');
const playerCardsContainer    = document.querySelector('#player-cards-container');
const gameHistoryContainer    = document.querySelector('#game-history-container');
const viewHistoryButton       = document.querySelector('#view-history');

const humanPlayerNameInput = document.getElementById("humanPlayerName");
const startNewGameButton   = document.getElementById("startNewGameButton");

const opponentRadios = document.querySelectorAll("input[name='opponents']");
const opponentInputs = [
	document.getElementById('cpu1Name'),
	document.getElementById('cpu2Name'),
	document.getElementById('cpu3Name'),
	document.getElementById('cpu4Name'),
];

const updateConfigurationButtonState = () => {

	const humanName = humanPlayerNameInput.value.trim().toUpperCase();

	if (humanName === '') {
		startNewGameButton.disabled = true;
		return;
	}

	const opponentNames = opponentInputs
		.filter(input => !input.disabled)
		.map(input => input.value.trim())
		.filter(name => name !== '');

	const hasDuplicateNames = 
		new Set(opponentNames).size !== opponentNames.length;

	const hasHumanNameConflict =
		opponentNames.includes(humanName);

	startNewGameButton.disabled = hasDuplicateNames || hasHumanNameConflict;

};

humanPlayerNameInput.addEventListener('input', updateConfigurationButtonState);

const renderGameControls = () => {

	const finished = gameState === GAME_STATES.FINISHED;

	viewHistoryButton.classList.add('d-none');
	viewScoreboardButton.classList.add('d-none');

	configureGameButton.classList.add('d-none');
	startGameButton.classList.add('d-none');

	if (gameState === GAME_STATES.NOT_CONFIGURED || 
			gameState === GAME_STATES.CONFIGURED ||
			finished) {
		configureGameButton.classList.remove('d-none');
	}

	if (gameState === GAME_STATES.CONFIGURED || 
			finished) {
		startGameButton.classList.remove('d-none');
	}

	if (finished) {
		viewHistoryButton.classList.remove('d-none');
	}

	if (gameState === GAME_STATES.CONFIGURED || 
			gameState === GAME_STATES.PLAYING || 
			finished) {
		viewScoreboardButton.classList.remove('d-none');
	}

};

const refreshLanguageDependentContent = () => {

    renderTexts();

    if (gameHistory.length > 0) {
        renderGameHistory();
    }

    if (players.length > 0) {
        renderScoreboard();
    }

    renderNextTurnButton();

};

viewScoreboardButton.addEventListener('click', () => {

	renderScoreboard();

});

startGameButton.addEventListener('click', () => {

	gameState = GAME_STATES.PLAYING;

	resetBoard();

	startGame();

	renderGameControls();
});

viewHistoryButton.addEventListener('click', () => {

	renderGameHistory();

});

const newGameModal = new bootstrap.Modal(
    document.getElementById("newGameModal")
);

newGameModal._element.addEventListener('shown.bs.modal', () => {
	humanPlayerNameInput.focus();
});

const languageSelector = document.querySelector("#language-selector");

const resetBoard = () => {

	statusPanel.innerHTML = '';

	playerHandContainer.classList.remove('d-none');

	playerCardsContainer.innerHTML = '';
	
	orosCardsContainer.innerHTML    = '';
	copasCardsContainer.innerHTML   = '';
	bastosCardsContainer.innerHTML  = '';
	espadasCardsContainer.innerHTML = '';
	
	nextTurnContainer.innerHTML = '';

};

const startGame = () => {

	gameOver = false;

	gameHistory   = [];

	players.forEach(player => {
		player.cards.length = 0;
	});

	deal(shuffle());

	currentPlayer = findCardOwner(STARTING_CARD);
	firstMove = true;

	renderPlayers();

	refreshGame();

	showStatus("info", t("status.newGame"));

	startFirstTurn();

};

const renderGameHistory = () => {

	gameHistoryContainer.innerHTML = '';

	gameHistory.forEach((move, index) => {

		const entry = document.createElement('div');

		entry.classList.add('game-history-entry');

		const number = document.createElement('span');
		number.classList.add('game-history-number');
		number.textContent = index + 1;

		const player = document.createElement('span');
		player.classList.add('game-history-player');
		player.textContent = getPlayer(move.playerIndex).name;

		const action = document.createElement('span');
		action.classList.add('game-history-action');

		const cardSlot = document.createElement('span');
		cardSlot.classList.add('game-history-card-slot');

		const actionText = document.createElement('span');
		actionText.classList.add('game-history-action-text');

		if (move.type === 'pass') {

			actionText.textContent = t("history.pass");

		} else {

			const cardImage = document.createElement('img');

			cardImage.src = `assets/images/cards/${move.card}.png`;
			cardImage.classList.add('game-history-card');

			cardSlot.append(cardImage);

			actionText.textContent = getCardName(move.card);

		}

		action.append(cardSlot, actionText);

		entry.append(number, player, action);

		gameHistoryContainer.append(entry);

	});

};

const getCardName = (card) => {

	const value = getCardValueName(cardValue(card));
	const suit  = SUITS[card.slice(-1)];

	return t("history.play", {
		value: value,
		suit:  t(`suits.${suit}`)
	});

};

const recordMove = (playerIndex, type, card = null) => {

	gameHistory.push({
		playerIndex,
		type,
		card
	});

};

const readGameConfiguration = () => {

	const humanName = humanPlayerNameInput.value.trim().toUpperCase();

	if (humanName === '') {
		return;
	}

	const opponentCount = parseInt(
		document.querySelector("input[name='opponents']:checked").value, 10
	);

	const opponentNames = opponentInputs
		.slice(0, opponentCount)
		.map(input => input.value.trim());

	const configuration = {

		humanName,
		
		opponents: generateOpponentNames(
			humanName,
			opponentNames
		)
	};

	createPlayers(configuration);

	resetBoard();

	statusPanel.classList.add('d-none');

	gameState = GAME_STATES.CONFIGURED;

	newGameModal.hide();

	renderPlayers();
	renderScoreboard();
	renderGameControls();

};

startNewGameButton.addEventListener("click", readGameConfiguration);

const createPlayer = (name, type) => ({
	name,
	type,
	cards: [],
	score: 0
});

const updateExcludedValues = () => {

	excludedValues = [8, 9];

	if (players.length === 3) {
		excludedValues.push(2);
	}

};

const createPlayers = (configuration = null) => {

	if (configuration == null) {

		players = [
			createPlayer("Jugador", PLAYER_TYPES.HUMAN),
			createPlayer("CPU",     PLAYER_TYPES.COMPUTER)
		]

		return;
	}

	players = [
		createPlayer(configuration.humanName, PLAYER_TYPES.HUMAN)
	];

	configuration.opponents.forEach(opponentName => {

		players.push(
			createPlayer(opponentName, PLAYER_TYPES.COMPUTER)
		);

	});

	updateExcludedValues();

};

const shuffle = () => {

	let deck = [];

	for (let i = lowerValue; i <= highestValue; i++) {

		if (excludedValues.includes(i)) {
			continue;
		}

        for (const type of types) {
            deck.push(i + type);
        }
    }

	return _.shuffle(deck);

};

const deal = (deck) => {

	for (let i = 0; i < deck.length; i++) {

		const playerIndex = i % players.length;

		players[playerIndex].cards.push(deck[i]);

	}

	players.forEach(player => orderCards(player.cards));

};

const updateOpponentInputs = opponentCount => {

	opponentInputs.forEach((input, index) => {

		const container = input.closest('.col-12');
		const hidden    = index >= opponentCount;

		container.classList.toggle('d-none', hidden);

		input.disabled = hidden;

		if (hidden) {
			input.value = '';
		}

	});

};

const renderPlayerHandInfo = () => {

	playerHandContainer
		.querySelector('.player-hand-info')
		?.remove();

	const playerInfo = document.createElement('div');
	playerInfo.classList.add('player-hand-info');

	const icon = document.createElement('span');
	icon.classList.add('player-summary-icon');
	icon.textContent = '🧑';

	const name = document.createElement('span');
	name.classList.add('player-summary-name');
	name.textContent = getPlayer(PLAYER).name;

	playerInfo.append(icon, name);

	playerHandContainer.prepend(playerInfo);

};

const findCardOwner = card =>
	players.findIndex(player => player.cards.includes(card));

const renderPlayers = () => {

    playersContainer.innerHTML = '';
    playersContainer.classList.add('players-bar');

	const finished = gameState === GAME_STATES.FINISHED;

	renderPlayerHandInfo();

	playerHandContainer.classList.toggle(
		'd-none',
		finished && playerCards().length === 0
	);

	playerHandContainer.classList.toggle(
		'active-player-hand',
		gameState === GAME_STATES.PLAYING &&
			currentPlayer === PLAYER &&
			!gameOver
	);

    players.forEach((player, index) => {

		if (finished && (index === PLAYER || player.cards.length === 0)) {
			return;
		}

        const playerPanel = document.createElement('div');
        playerPanel.classList.add('player-summary');

		if (gameState === GAME_STATES.PLAYING && index === currentPlayer) {
			playerPanel.classList.add('active-player');
		}

        const playerInfo = document.createElement('div');
        playerInfo.classList.add('player-info');

        const icon = document.createElement('span');
        icon.classList.add('player-summary-icon');
        icon.textContent = player.type === PLAYER_TYPES.HUMAN
    		? '🧑'
    		: '🤖';

        const name = document.createElement('span');
        name.classList.add('player-summary-name');
        name.textContent = player.name;

        playerInfo.append(icon, name);

		if (finished) {

			const cardsContainer = document.createElement('div');
			cardsContainer.classList.add('final-player-cards');

			player.cards.forEach(card => {

				const cardImage = document.createElement('img');

				cardImage.src = `assets/images/cards/${card}.png`;
				cardImage.classList.add('final-player-card');

				cardsContainer.append(cardImage);

			});

			playerPanel.classList.add('finished-player-summary');
			playerPanel.append(playerInfo, cardsContainer);

		} else {

			const cardsInfo = document.createElement('div');
			cardsInfo.classList.add('player-cards-info');

			const cardBack = document.createElement('img');
			cardBack.src = 'assets/images/cards/R.png';
			cardBack.classList.add('player-card-back');
			
			const cardsCounter = document.createElement('small');
			cardsCounter.id = `player-${index}-cards-counter`;

			cardsInfo.append(cardsCounter, cardBack);

			playerPanel.append(playerInfo, cardsInfo);

		}
		
        playersContainer.append(playerPanel);
    });
};

const renderScoreboard = () => {

	scoreboardWinnerElement.textContent = '';
	scoreboardElement.innerHTML = '';

	players.forEach(player => {

		const scoreItem = document.createElement('div');
		scoreItem.classList.add('score-item');

		const name = document.createElement('span');
		name.textContent = player.name;

		const score = document.createElement('span');
		score.textContent = player.score;

		scoreItem.append(name, score);

		scoreboardElement.append(scoreItem);
	});
};

const renderScoreboardWinner = (winner) => {

	scoreboardWinnerElement.innerHTML = '';

	if (winner === PLAYER) {
		scoreboardWinnerElement.textContent = t("status.playerWins");
		return;
	}

	scoreboardWinnerElement.textContent = 
		t("status.computerWins", { 
			name: getPlayer(winner).name
		}
	);

};

const renderNextTurnButton = () => {

	nextTurnContainer.innerHTML = '';

	if (gameOver || currentPlayer !== PLAYER) {
		return;
	}
	
	if (getAllowedPlayerCards().length === 0) {

		const nextTurnButton       = document.createElement('button');

		nextTurnButton.textContent = t("buttons.nextTurn");
		nextTurnButton.id          = 'next-turn';
		
		nextTurnButton.classList.add(
			'btn', 
			'btn-warning');

		nextTurnButton.addEventListener('click', (event) => {
			nextTurnPressed();
		});

		nextTurnContainer.append(nextTurnButton);

	}
};

const renderCards = (playerIndex, container, options) => {
	container.innerHTML = '';

	const allowedCards = options.clickable 
		? getAllowedCards(playerIndex) 
		: [];
	
	for (const card of getPlayerCards(playerIndex)) {
		const cardImg = document.createElement('img');

		cardImg.src = options.hidden 
			? "assets/images/cards/R.png" 
			: `assets/images/cards/${card}.png`;

		cardImg.classList.add('carta');

		if (options.clickable && 
				!gameOver && 
				!playerTurnInProgress &&
				currentPlayer === PLAYER &&
				allowedCards.includes(card)) {
			cardImg.classList.add('playable-card');

			cardImg.addEventListener('click', () => {
				playPlayerCard(card);
			});
		} else {
			cardImg.classList.add('locked-card');
		}

		container.append(cardImg);
	}
};

const renderCardsCounter = (playerIndex, counterElement) => {
	const cards = getPlayerCards(playerIndex);

	counterElement.textContent = cards.length;

	counterElement.classList.remove(
		'cards-warning', 
		'cards-danger');

	if (cards.length <= 3 && cards.length > 1) {
		counterElement.classList.add('cards-warning');
	}

	if (cards.length === 1) {
		counterElement.classList.add('cards-danger');
	}
};

const renderCardsOnTheTable = () => {
	orosCardsContainer.innerHTML    = '';
	copasCardsContainer.innerHTML   = '';
	bastosCardsContainer.innerHTML  = '';
	espadasCardsContainer.innerHTML = '';
 
	let allCards = cardsOnTheTable();
	
	for (const type of types) {
		for (let i = 0; i < allCards.length; i++) {
			if (allCards[i].endsWith(type)) {
				const cardImg = document.createElement('img');
				cardImg.src = `assets/images/cards/${ allCards[i] }.png`;
				cardImg.classList.add('carta');
				if (type === 'O') {
					orosCardsContainer.append(cardImg);
				} else if (type === 'C') {
					copasCardsContainer.append(cardImg);
				} else if (type === 'B') {
					bastosCardsContainer.append(cardImg);
				} else {
					espadasCardsContainer.append(cardImg);
				}
			}
		}
	}
};

const orderCards = (cardsToOrder) => {
	return cardsToOrder.sort((a, b) => {
		const letraA = a.match(/[A-Z]$/)[0];
		const letraB = b.match(/[A-Z]$/)[0];

		if (letraA !== letraB) {
			return letraA.localeCompare(letraB);
		}

		const numeroA = parseInt(a.match(/\d+/)[0], 10);
		const numeroB = parseInt(b.match(/\d+/)[0], 10);

		return numeroA - numeroB;
	});
};

const nextTurnPressed = async () => {

	if (gameOver || playerTurnInProgress) {
		return;
	}

	playerTurnInProgress = true;

	recordMove(PLAYER, "pass");

	showStatus(
		"warning", 
		t("status.playerPass", {
			name: getPlayer(PLAYER).name
		})
	);

	nextTurnContainer.innerHTML = '';

	await delay(DELAY_TIME);

	playerTurnInProgress = false;

	await changeTurn();

};

const randomInt                  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const removeCard                 = (playerIndex, card) => getPlayerCards(playerIndex).splice(getPlayerCards(playerIndex).indexOf(card), 1)[0];
const hasPlayerWon               = playerIndex => getPlayerCards(playerIndex).length === 0;
const cardValue                  = card => parseInt(card.slice(0, -1), 10);
const getAllowedPlayerCards      = () => getAllowedCards(PLAYER);

const getAllowedCards = playerIndex => { 

	if (firstMove) {
		return getPlayerCards(playerIndex).includes(STARTING_CARD)
			? [STARTING_CARD]
			: [];
	}

	return allowedCards(
		getPlayerCards(playerIndex), 
		cardsOnTheTable())
};

const nextPlayer = () => currentPlayer = (currentPlayer + 1) % players.length;
const getPlayerCards = playerIndex => players[playerIndex].cards;
const getPlayer = playerIndex => players[playerIndex];

const executeCurrentPlayerTurn = async () => {

	if (gameOver || currentPlayer === PLAYER) {
		return;
	}

	await playComputerCard(currentPlayer);

};

const delay = milliseconds =>
	new Promise(resolve => setTimeout(resolve, milliseconds));

/*
 * Cambia el turno al siguiente jugador,
 * ejecuta automáticamente el turno de la IA
 * y devuelve el control al jugador humano
 */
const changeTurn = async () => {

	nextPlayer();

	while (currentPlayer !== PLAYER && !gameOver) {

		refreshGame();

		showStatus(
			'computer',
			t('status.computerTurn', {
				name: getPlayer(currentPlayer).name
			})
		);

		await delay(DELAY_TIME);

		await executeCurrentPlayerTurn();

		if (!gameOver) {
			nextPlayer();
		}
	}

	if (!gameOver) {
		refreshGame();
		showStatus(
			"player", 
			t("status.playerTurn").toUpperCase()
		);
	}

};

const playComputerCard = async (playerIndex) => {
	
	const allowedComputerCards = getAllowedCards(playerIndex);

	if (allowedComputerCards.length === 0) {

		recordMove(playerIndex, "pass");

		showStatus("warning", t("status.computerPass", {
			name: getPlayer(playerIndex).name
		}));

		await delay(DELAY_TIME);

		return;
	}

	const aleatoryIndex = randomInt(1, allowedComputerCards.length) - 1;

	const cardPlayed = removeCard(
		playerIndex, 
		allowedComputerCards[aleatoryIndex]
	);

	recordMove(playerIndex, "play", cardPlayed);

	if (firstMove) {
		firstMove = false;
	}

	refreshGame();

	showPlayedCard(playerIndex, cardPlayed);

	await delay(DELAY_TIME);

	if (hasPlayerWon(playerIndex)) {
		finishGame(playerIndex);
	}

};

const showPlayedCard = (playerIndex, card) => {

	const value = getCardValueName(cardValue(card));

	const suit = t(
		`suits.${SUITS[card.substring(card.length - 1)]}`).toUpperCase();

	const playerType = playerIndex === PLAYER 
		? "player"
		: "computer";

	const params = {
		value,
		suit,
		name: getPlayer(playerIndex).name
	};

	showStatus(
		playerType,
		t(`status.${playerType}Plays`, params)
	);

};

const startFirstTurn = async () => {

	if (currentPlayer === PLAYER) {

		refreshGame();

		showStatus(
			"player", 
			t("status.playerTurn").toUpperCase()
		);

		return;
	}

	while (currentPlayer !== PLAYER && !gameOver) {

		refreshGame();

		showStatus(
			'computer', 
			t('status.computerTurn', {
				name: getPlayer(currentPlayer).name
			})
		);

		await delay(DELAY_TIME);

		await executeCurrentPlayerTurn();

		if (!gameOver) {
			nextPlayer();
		}
	}

	if (!gameOver) {
		refreshGame();
		showStatus(
			"player", 
			t("status.playerTurn").toUpperCase()
		);
	}
};

const playPlayerCard = async (card) => {

	if (gameOver || playerTurnInProgress) {
		return;
	}

	playerTurnInProgress = true;
	
	removeCard(PLAYER, card);

	recordMove(PLAYER, "play", card);

	if (firstMove) {
		firstMove = false;
	}

	refreshGame();

	showPlayedCard(PLAYER, card);

	nextTurnContainer.innerHTML = '';
	
	if (hasPlayerWon(PLAYER)) {

		finishGame(PLAYER);

		playerTurnInProgress = false;

		return;

	}

	await delay(DELAY_TIME);

	playerTurnInProgress = false;

	changeTurn();

};

const finishGame = (winner) => {
	
	gameOver  = true;
	gameState = GAME_STATES.FINISHED;

	playerHandContainer.classList.toggle('d-none', winner === PLAYER);

	nextTurnContainer.innerHTML = '';

	getPlayer(winner).score++;

	renderScoreboard();

	renderScoreboardWinner(winner);

	const scoreboardModal = bootstrap.Modal.getOrCreateInstance(scoreboardModalElement);
	scoreboardModal.show();

	if (winner === PLAYER) {
		showStatus(
			"success", 
			t("status.playerWins")
		);
	} else {
		showStatus(
			"success", 
			t("status.computerWins", {
				name: getPlayer(winner).name
			})
		);
	}

	refreshGame();

	renderGameControls();

};

const cardsOnTheTable = () => {

	let cardsOnTheTable = [];
	
	for (let i = lowerValue; i <= highestValue; i++) {

		if (excludedValues.includes(i)) {
			continue;
		}

        for (const type of types) {
			const card = `${i}${type}`;

			const isInAnyPlayer = players.some(player => 
				player.cards.includes(card)
			); 

			if (!isInAnyPlayer) {
				cardsOnTheTable.push(card);
			}
        }
    }
	return orderCards(cardsOnTheTable);
	
};

const nextCardValue = value => {
	let next = value + 1;
	while (excludedValues.includes(next)) {
		next++;
	}
	return next;
};

const previousCardValue = value => {
	let previous = value - 1;
	while (excludedValues.includes(previous)) {
		previous--;
	}
	return previous;
};

const refreshGame = () => {

	renderPlayers();

	players.forEach((player, index) => {

		const cardsCounter =
			document.getElementById(`player-${index}-cards-counter`);

		if (cardsCounter) {
			renderCardsCounter(
				index,
				cardsCounter
			);
		}
		
	});

	playerCardsContainer.innerHTML = '';

	renderCards(
		PLAYER,
		playerCardsContainer,
		{
			hidden: false,
			clickable: true
		}
	);

	renderNextTurnButton();
	
	renderCardsOnTheTable();

};

const renderTexts = () => {

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => 
			element.innerHTML = t(element.dataset.i18n)
	);

};

const allowedCards = (cards, cardsOnTheTable) => {
	const allowedCards = cards.filter(card => card.startsWith(String(STARTING_VALUE)));
	
	for(const type of types) {
		const cardsOfType = cardsOnTheTable.filter(card => card.endsWith(type));
		
		if (cardsOfType.length === 0) {
			continue;
		}
			
		const lowest = cardsOfType.reduce((min, card) => 
			cardValue(card) < cardValue(min) ? card : min
		);
			
		const highest = cardsOfType.reduce((max, card) => 
			cardValue(card) > cardValue(max) ? card : max
		);
		
		const previousCard = `${previousCardValue(cardValue(lowest))}${type}`;
		const nextCard     = `${nextCardValue(cardValue(highest))}${type}`;
			
		if (cards.includes(previousCard)) {
			allowedCards.push(previousCard);
		}
			
		if (cards.includes(nextCard)) {
			allowedCards.push(nextCard);
		}
    }
	
	return orderCards(allowedCards);
};

const showStatus = (type, message) => {

	const statusPanel = document.getElementById('status-panel');

	statusPanel.classList.remove('success', 'info', 'warning', 'danger', 'd-none');

	statusPanel.classList.add(type);

	statusPanel.innerHTML = `<span class="status-message">${message}</span>`;

};

document.querySelectorAll(
		'#humanPlayerName, #cpu1Name, #cpu2Name, #cpu3Name, #cpu4Name')
	.forEach(input => {
		input.addEventListener('input', () => {
			input.value = input.value.toUpperCase();
			updateConfigurationButtonState();
		})
	});

languageSelector.addEventListener("change", event => {

	const language = event.target.value;

	setLanguage(language);
	localStorage.setItem("language", language);

	refreshLanguageDependentContent();
	
});

opponentRadios.forEach(radio => {

	radio.addEventListener("change", () => {

		const opponentCount = parseInt(radio.value, 10);

		updateOpponentInputs(opponentCount);
		updateConfigurationButtonState();

	});

});

const language = localStorage.getItem("language") ?? DEFAULT_LANGUAGE;
setLanguage(language);
languageSelector.value = language;

renderTexts();

renderGameControls();

updateOpponentInputs(1);