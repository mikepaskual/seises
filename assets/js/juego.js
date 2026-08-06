const DEFAULT_LANGUAGE = "es";

const magicNumber    = 6;
const lowerValue     = 1;
const highestValue   = 12;
const excludedValues = [8, 9];
const types          = ['B', 'C', 'E', 'O'];
const SUITS = {
    B: "bastos",
    C: "copas",
    E: "espadas",
    O: "oros"
};
const STATUS_ICONS = {
    info:     "ℹ️",
    player:   "🧑",
    computer: "🤖",
    warning:  "⚠️",
    success:  "🎉",
    error:    "💀"
};

let gameOver      = false;
let playerScore   = 0;
let computerScore = 0;

const PLAYER   = 0;
const COMPUTER = 1;

const PLAYER_TYPES = {
	HUMAN:    "human",
	COMPUTER: "computer"
};

const createPlayer = (name, type) => ({
	name,
	type,
	cards: [],
	score: 0
});

let players = [
	createPlayer("Jugador", PLAYER_TYPES.HUMAN), 
	createPlayer("CPU", PLAYER_TYPES.COMPUTER)
];

let currentPlayer = PLAYER;

const playerCards   = () => players[PLAYER].cards;
const computerCards = () => players[COMPUTER].cards;

const playerCardsCounterElement   = document.querySelector('#player-cards-counter');
const computerCardsCounterElement = document.querySelector('#computer-cards-counter');

const playerCardsContainer   = document.querySelector('#player-cards-container');
const computerCardsContainer = document.querySelector('#computer-cards-container');

const orosCardsContainer    = document.querySelector('#oros-cards-container');
const copasCardsContainer   = document.querySelector('#copas-cards-container');
const bastosCardsContainer  = document.querySelector('#bastos-cards-container');
const espadasCardsContainer = document.querySelector('#espadas-cards-container');

const playerScoreCounterElement   = document.querySelector('#victories-counter');
const computerScoreCounterElement = document.querySelector('#defeats-counter');

const newGameButton     = document.querySelector('#new-game');
const nextTurnContainer = document.querySelector('#next-turn-container');

const statusPanel   = document.querySelector("#status-panel");
const statusIcon    = document.querySelector("#status-icon");
const statusMessage = document.querySelector("#status-message");

const cardContainers = [
	playerCardsContainer,
	computerCardsContainer
];

const cardCounterElements = [
	playerCardsCounterElement,
	computerCardsCounterElement
];

const languageSelector = document.querySelector("#language-selector");

newGameButton.addEventListener('click', () => {

	setUp();

	deal(shuffle());

	refreshGame();

});

const setUp = () => {

	gameOver = false;

	currentPlayer = PLAYER;

	players = [
		createPlayer("Jugador", PLAYER_TYPES.HUMAN), 
		createPlayer("CPU", PLAYER_TYPES.COMPUTER)
	];
	
	playerCardsContainer.innerHTML   = '';
	computerCardsContainer.innerHTML = '';
	
	orosCardsContainer.innerHTML    = '';
	copasCardsContainer.innerHTML   = '';
	bastosCardsContainer.innerHTML  = '';
	espadasCardsContainer.innerHTML = '';
	
	nextTurnContainer.innerHTML = '';

	showStatus("info", t("status.newGame"));

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
		if (i % 2 === 0) {
			playerCards().push(deck[i]);
		} else {
			computerCards().push(deck[i]);
		}
	}

	orderCards(playerCards());
	orderCards(computerCards());
};

const renderNextTurnButton = () => {
	nextTurnContainer.innerHTML = '';
	
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

		if (options.clickable && !gameOver && allowedCards.includes(card)) {
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

	counterElement.textContent = pluralize(
		cards.length, 
		"cards.singular", 
		"cards.plural");

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

const nextTurnPressed = () => { 
	changeTurn();
};

const pluralize                  = (count, singularKey, pluralKey) => `${count} ${t(count === 1 ? singularKey : pluralKey)}`;
const randomInt                  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const removeCard                 = (playerIndex, card) => getPlayerCards(playerIndex).splice(getPlayerCards(playerIndex).indexOf(card), 1)[0];
const hasPlayerWon               = playerIndex => getPlayerCards(playerIndex).length === 0;
const cardValue                  = card => parseInt(card.slice(0, -1), 10);
const getAllowedPlayerCards      = () => getAllowedCards(PLAYER);
const getAllowedComputerCards    = () => getAllowedCards(COMPUTER);
const getAllowedCards            = playerIndex => allowedCards(getPlayerCards(playerIndex), cardsOnTheTable());
const nextPlayer                 = () => currentPlayer = (currentPlayer + 1) % players.length;
const getPlayerCards             = playerIndex => players[playerIndex].cards;
const getPlayer                  = playerIndex => players[playerIndex];

const executeCurrentPlayerTurn = () => {

	if (gameOver) {
		return;
	}

	if (currentPlayer === PLAYER) {
		return;
	}

	playComputerCard();

};

/*
 * Cambia el turno al siguiente jugador,
 * ejecuta automáticamente el turno de la IA
 * y devuelve el control al jugador humano
 */
const changeTurn = () => {

	nextPlayer();

	executeCurrentPlayerTurn();

	if (!gameOver) {
		nextPlayer();
	}
};

const playComputerCard = () => {
	
	const allowedComputerCards = getAllowedComputerCards();

	if (allowedComputerCards.length === 0) {
		showStatus("warning", t("status.computerPass"));
		return;
	}

	const aleatoryIndex = randomInt(1, allowedComputerCards.length) - 1;

	const cardPlayed = removeCard(
		COMPUTER, 
		allowedComputerCards[aleatoryIndex]
	);

	refreshGame();

	showPlayedCard('computer', cardPlayed);

	if (hasPlayerWon(COMPUTER)) {
		finishGame(COMPUTER);
	}

};

const showPlayedCard = (playerType, card) => {

	const value = card.substring(0, card.length - 1);

	const suit = t(
		`suits.${SUITS[card.substring(card.length - 1)]}`);

	showStatus(
		playerType,
		t(`status.${playerType}Plays`, {
			value,
			suit
		})
	);

};

const playPlayerCard = (card) => {

	if (gameOver) {
		return;
	}
	
	removeCard(PLAYER, card);

	showPlayedCard("player", card);

	refreshGame();
	
	if (hasPlayerWon(PLAYER)) {
		finishGame(PLAYER);
	} else {
		changeTurn();
	}

};

const finishGame = (winner) => {
	
	gameOver = true;

	nextTurnContainer.innerHTML = '';

	if (winner === PLAYER) {
		playerScore++;
		playerScoreCounterElement.textContent = playerScore;
		showStatus("success", t("status.playerWins"));
	} else {
		computerScore++;
		computerScoreCounterElement.textContent = computerScore;
		showStatus("success", t("status.computerWins"));
	}
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
	players.forEach((player, index) => {
		renderCards(
			index, 
			cardContainers[index], 
			{
				hidden:    index !== PLAYER,
				clickable: index === PLAYER
			}
		);

		renderCardsCounter(
			index, 
			cardCounterElements[index]
		);
	});

	renderNextTurnButton();
	
	renderCardsOnTheTable();
};

const renderTexts = () => {
    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => element.innerHTML = t(element.dataset.i18n)
	);

	players.forEach((player, index) => renderCardsCounter(index, cardCounterElements[index]));
};

const allowedCards = (cards, cardsOnTheTable) => {
	const allowedCards = cards.filter(card => card.startsWith(String(magicNumber)));
	
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

    statusPanel.className = "status-panel";
    statusPanel.classList.add(type);

    statusIcon.textContent = STATUS_ICONS[type];

    statusMessage.textContent = message;

};

languageSelector.addEventListener("change", event => {
	const language = event.target.value;
	setLanguage(language);
	localStorage.setItem("language", language);
	renderTexts();
});

const language = localStorage.getItem("language") ?? DEFAULT_LANGUAGE;
setLanguage(language);
languageSelector.value = language;
renderTexts();