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

let playerCards   = [];
let computerCards = [];

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

const languageSelector = document.querySelector("#language-selector");

newGameButton.addEventListener('click', () => {
	setUp();
	
	const deck = shuffle();
	deal(deck);
	
	refreshGame();
});

const setUp = () => {
	gameOver      = false;

	playerCards   = [];
    computerCards = [];
	
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
			playerCards.push(deck[i]);
		} else {
			computerCards.push(deck[i]);
		}
	}

	orderCards(playerCards);
	orderCards(computerCards);
};

const renderNextTurnButton = () => {
	nextTurnContainer.innerHTML = '';
		
	const allowedPlayerCards = getAllowedPlayerCards();
	
	if (allowedPlayerCards.length === 0) {
		const nextTurnButton = document.createElement('button');
		nextTurnButton.textContent = t("buttons.nextTurn");
		nextTurnButton.classList.add('btn', 'btn-warning');
		nextTurnButton.id = 'next-turn';
		nextTurnButton.addEventListener('click', (event) => {
			nextTurnPressed(playerCards, computerCards);
		});
		nextTurnContainer.append(nextTurnButton);
	}
};

const renderPlayerCards = () => {
	playerCardsContainer.innerHTML = '';

	const allowedPlayerCards = getAllowedPlayerCards();
	
	for (const playerCard of playerCards) {
		const playerCardImg = document.createElement('img');
		playerCardImg.src = `assets/images/cards/${ playerCard }.png`;
		playerCardImg.classList.add('carta');

		if (!gameOver && allowedPlayerCards.includes(playerCard)) {
			playerCardImg.classList.add('playable-card');
			playerCardImg.addEventListener('click', () => {
				playPlayerCard(playerCard);
			});
		} else {
			playerCardImg.classList.add('locked-card');
		}

		playerCardsContainer.append(playerCardImg);
	}
};

const pluralize = (count, singularKey, pluralKey) => {
    return `${count} ${t(count === 1 ? singularKey : pluralKey)}`;
};

const renderPlayerCardsCounter = () => {
	playerCardsCounterElement.textContent = pluralize(playerCards.length, "cards.singular", "cards.plural");

	playerCardsCounterElement.classList.remove('cards-warning', 'cards-danger');

	if (playerCards.length <= 3 && playerCards.length > 1) {
		playerCardsCounterElement.classList.add('cards-warning');
	}

	if (playerCards.length === 1) {
		playerCardsCounterElement.classList.add('cards-danger');
	}
};

const renderComputerCards = () => {
	computerCardsContainer.innerHTML = '';
	
	for (let i = 0; i < computerCards.length; i++) {
		const computerCardImg = document.createElement('img');
		computerCardImg.src = `assets/images/cards/R.png`;
		computerCardImg.classList.add('carta');
		computerCardsContainer.append(computerCardImg);
	}
};

const renderComputerCardsCounter = () => {
	computerCardsCounterElement.textContent = pluralize(computerCards.length, "cards.singular", "cards.plural");

	computerCardsCounterElement.classList.remove('cards-warning', 'cards-danger');

	if (computerCards.length <= 3 && computerCards.length > 1) {
		computerCardsCounterElement.classList.add('cards-warning');
	}

	if (computerCards.length === 1) {
		computerCardsCounterElement.classList.add('cards-danger');
	}
};

const renderCardsOnTheTable = () => {
	orosCardsContainer.innerHTML    = '';
	copasCardsContainer.innerHTML   = '';
	bastosCardsContainer.innerHTML  = '';
	espadasCardsContainer.innerHTML = '';
 
	let allCards = [];
	
	for (let i = lowerValue; i <= highestValue; i++) {
		if (excludedValues.includes(i)) {
			continue;
		}
        for (const type of types) {
			if (!playerCards.includes(i + type) && !computerCards.includes(i + type)) {
				allCards.push(i + type);
			}
        }
    }
	
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

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const playPlayerCard = (card) => {
	if (gameOver) {
		return;
	}
	
	const cardSelected = card;
	
	const numero = cardSelected.substring(0, cardSelected.length - 1);
	const desc   = t(`suits.${SUITS[cardSelected.substring(cardSelected.length - 1)]}`);
	
	playerCards.splice(playerCards.indexOf(cardSelected), 1);
	
	refreshGame();
	
	if (playerCards.length === 0) {
		playerScore++;
		gameOver = true;
		playerScoreCounterElement.textContent = playerScore;
		nextTurnContainer.innerHTML = '';
		showStatus('success', t("status.playerWins"));
	} else {
		const allowedComputerCards = getAllowedComputerCards();
		
		if (allowedComputerCards.length === 0) {
			showStatus('warning', t("status.computerPass"));
		} else {
			const aleatoryIndex = randomInt(1, allowedComputerCards.length) - 1;
			
			const cardOfComputerDeleted = computerCards.splice(computerCards.indexOf(allowedComputerCards[aleatoryIndex]), 1)[0];
			
			refreshGame();
			
			const numero2 = cardOfComputerDeleted.substring(0, cardOfComputerDeleted.length - 1);
			const desc2   = t(`suits.${SUITS[cardOfComputerDeleted.substring(cardOfComputerDeleted.length - 1)]}`);

			showStatus('computer', t("status.computerPlays", {
				value: numero2,
				suit: desc2
			}));

			if (computerCards.length === 0) {
				computerScore++;
				gameOver = true;
				computerScoreCounterElement.textContent = computerScore;
				nextTurnContainer.innerHTML = '';
				showStatus('error', t("status.computerWins"));
			}
		}
	}
};

const nextTurnPressed = (playerCards, computerCards) => {
	const allowedComputerCards = getAllowedComputerCards();
	
	const aleatoryIndex = randomInt(1, allowedComputerCards.length) - 1;
	
	const cardOfComputerDeleted = computerCards.splice(computerCards.indexOf(allowedComputerCards[aleatoryIndex]), 1)[0];
		
	refreshGame();
	
	const numero = cardOfComputerDeleted.substring(0, cardOfComputerDeleted.length - 1);
	const desc   = t(`suits.${SUITS[cardOfComputerDeleted.substring(cardOfComputerDeleted.length - 1)]}`);

	showStatus('computer', t('status.computerPlays', {
		value: numero,
		suit: desc
	}));
	
	if (computerCards.length === 0) {
		computerScore++;
		gameOver = true;
		computerScoreCounterElement.textContent = computerScore;
		nextTurnContainer.innerHTML = '';

		showStatus('error', t("status.computerWins"));
	}
};

const cardsOnTheTable = () => {
	let cardsOnTheTable = [];
	
	for (let i = lowerValue; i <= highestValue; i++) {
		if (excludedValues.includes(i)) {
			continue;
		}
        for (const type of types) {
			const card = i + type;
			if (!playerCards.includes(card) && !computerCards.includes(card)) {
				cardsOnTheTable.push(card);
			}
        }
    }
	return orderCards(cardsOnTheTable);
};

const cardValue = card => parseInt(card.slice(0, -1), 10);

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
	renderNextTurnButton();
	renderPlayerCards();
	renderPlayerCardsCounter();
	renderComputerCards();
	renderComputerCardsCounter();
	renderCardsOnTheTable();
};

const renderTexts = () => {
    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {
            element.innerHTML = t(element.dataset.i18n);
        });
	renderPlayerCardsCounter();
	renderComputerCardsCounter();
};

const getAllowedPlayerCards = () => {
	return allowedCards(playerCards, cardsOnTheTable());
};

const getAllowedComputerCards = () => {
	return allowedCards(computerCards, cardsOnTheTable());
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