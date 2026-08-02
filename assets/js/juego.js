const magicNumber    = 6;
const lowerValue     = 1;
const highestValue   = 12;
const excludedValues = [8, 9];
const types          = ['B', 'C', 'E', 'O'];
const labels         = { 
	'B': 'BASTOS', 
	'C': 'COPAS', 
	'E': 'ESPADAS', 
	'O': 'OROS' 
};

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

const newGameButton        = document.querySelector('#new-game');
const nextTurnContainer    = document.querySelector('#next-turn-container');
const auxSelect            = document.querySelector('#select-aux');

newGameButton.addEventListener('click', () => {
	console.clear();
	
	playerCards   = [];
    computerCards = [];
	
	playerCardsContainer.innerHTML   = '';
	computerCardsContainer.innerHTML = '';
	
	orosCardsContainer.innerHTML    = '';
	copasCardsContainer.innerHTML   = '';
	bastosCardsContainer.innerHTML  = '';
	espadasCardsContainer.innerHTML = '';
	
	nextTurnContainer.innerHTML = '';
	auxSelect.innerHTML         = '';
	
	console.log('Barajando las cartas...');
	const deck = shuffle();
	console.log('Cartas barajadas!');

	console.log('Repartiendo las cartas entre los jugadores...');
	deal(deck, playerCards, computerCards);
	console.log('Cartas repartidas. Que comience la partida!');
	
	printPlayerCards(playerCards);
	printComputerCards(computerCards);
	
	printAuxiliarSelect(playerCards, computerCards, magicNumber);
	printNextTurnButton(playerCards, computerCards, magicNumber);
});

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

const deal = (deck, playerCards, computerCards) => {
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

const printNextTurnButton = (playerCards, computerCards) => {
	nextTurnContainer.innerHTML = '';
		
	const cc = cardsOnTheTable(playerCards, computerCards);
	const aa = allowedCards(playerCards, cc, magicNumber);
	
	if (aa.length === 0) {
		const nextTurnButton = document.createElement('button');
		nextTurnButton.textContent = 'Paso';
		nextTurnButton.classList.add('btn', 'btn-warning');
		nextTurnButton.id = 'next-turn';
		nextTurnButton.addEventListener('click', (event) => {
			nextTurnPressed(playerCards, computerCards);
		});
		nextTurnContainer.append(nextTurnButton);
	}
};

const printAuxiliarSelect = (playerCards, computerCards, magicNumber) => {
	auxSelect.innerHTML = '';
	
	const cc = cardsOnTheTable(playerCards, computerCards);
	const aa = allowedCards(playerCards, cc, magicNumber);
	
	if (aa.length !== 0) {
		const playerCardsSelect = document.createElement('select');
		playerCardsSelect.addEventListener('change', (event) => {
			putCardOnTheTable(event, playerCards, computerCards, magicNumber);
		});
		
		const playerCardOptionDefault  = document.createElement('option');
		playerCardOptionDefault.text   = '-- Selecciona una carta --';
		playerCardOptionDefault.value  = '';
		playerCardsSelect.add(playerCardOptionDefault);
		
		for (let i = 0; i < aa.length; i++) {
			const allowedCard = aa[i];
			const playerCardOption  = document.createElement('option');
			playerCardOption.text   = allowedCard.substring(0, allowedCard.length - 1) 
					+ ' de ' + labels[allowedCard.substring(allowedCard.length - 1)];
			playerCardOption.value  = allowedCard;
			playerCardsSelect.add(playerCardOption);
		}
		
		auxSelect.append(playerCardsSelect);
	}
};

const printPlayerCards = (playerCards) => {
	playerCardsContainer.innerHTML = '';
	
	for (let i = 0; i < playerCards.length; i++) {
		const playerCardImg = document.createElement('img');
		playerCardImg.src = `assets/images/cards/${ playerCards[i] }.png`;
		playerCardImg.classList.add('carta');
		playerCardsContainer.append(playerCardImg);
	}
	
	playerCardsCounterElement.textContent = `${playerCards.length} ${playerCards.length === 1 ? 'carta' : 'cartas'}`;

	playerCardsCounterElement.classList.remove('cards-warning', 'cards-danger');

	if (playerCards.length <= 3 && playerCards.length > 1) {
		playerCardsCounterElement.classList.add('cards-warning');
	}

	if (playerCards.length === 1) {
		playerCardsCounterElement.classList.add('cards-danger');
	}
};

const printComputerCards = (computerCards) => {
	computerCardsContainer.innerHTML = '';
	
	for (let i = 0; i < computerCards.length; i++) {
		const computerCardImg = document.createElement('img');
		computerCardImg.src = `assets/images/cards/R.png`;
		computerCardImg.classList.add('carta');
		computerCardsContainer.append(computerCardImg);
	}
	
	computerCardsCounterElement.textContent = `${computerCards.length} ${computerCards.length === 1 ? 'carta' : 'cartas'}`;

	computerCardsCounterElement.classList.remove('cards-warning', 'cards-danger');

	if (computerCards.length <= 3 && computerCards.length > 1) {
		computerCardsCounterElement.classList.add('cards-warning');
	}

	if (computerCards.length === 1) {
		computerCardsCounterElement.classList.add('cards-danger');
	}
};

const printCardsOnTheTable = (playerCards, computerCards) => {
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

const orderCards = (cards) => {
	cards.sort((a, b) => {
		const letraA = a.match(/[A-Z]$/)[0];
		const letraB = b.match(/[A-Z]$/)[0];

		if (letraA !== letraB) {
			return letraA.localeCompare(letraB);
		}

		const numeroA = parseInt(a.match(/\d+/)[0], 10);
		const numeroB = parseInt(b.match(/\d+/)[0], 10);

		return numeroA - numeroB;
	});
	return cards;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function putCardOnTheTable(event, playerCards, computerCards, magicNumber) {
	const cardSelected = event.target.value;
	
	const numero = cardSelected.substring(0, cardSelected.length - 1);
	const desc   = labels[cardSelected.substring(cardSelected.length - 1)];
	console.log('Lanzas el ' + numero + ' de ' + desc);
	
	playerCards.splice(playerCards.indexOf(cardSelected), 1);
	
	printAuxiliarSelect(playerCards, computerCards, magicNumber);
	printNextTurnButton(playerCards, computerCards, magicNumber);
	printPlayerCards(playerCards);
	printComputerCards(computerCards);
	printCardsOnTheTable(playerCards, computerCards);
	
	if (playerCards.length === 0) {
		playerScore++;
		playerScoreCounterElement.textContent = playerScore;
		nextTurnContainer.innerHTML = '';
		auxSelect.innerHTML         = '';

		console.log('Ganaste! Fin de la partida :)');
		alert('Ganaste! Fin de la partida :)');
	} else {
		const cc = cardsOnTheTable(playerCards, computerCards);
		const aa = allowedCards(computerCards, cc, magicNumber);
		
		if (aa.length === 0) {
			console.log('La IA pasa turno');
			alert('La IA pasa turno');
		} else {
			const aleatoryIndex = randomInt(1, aa.length) - 1;
			
			const cardOfComputerDeleted = computerCards.splice(computerCards.indexOf(aa[aleatoryIndex]), 1)[0];
			
			printAuxiliarSelect(playerCards, computerCards, magicNumber);
			printNextTurnButton(playerCards, computerCards, magicNumber);
			printPlayerCards(playerCards);
			printComputerCards(computerCards);
			printCardsOnTheTable(playerCards, computerCards);
			
			const numero2 = cardOfComputerDeleted.substring(0, cardOfComputerDeleted.length - 1);
			const desc2   = labels[cardOfComputerDeleted.substring(cardOfComputerDeleted.length - 1)];

			console.log('La IA lanza el ' + numero2 + ' de ' + desc2);
			alert('La IA lanza el ' + numero2 + ' de ' + desc2);

			if (computerCards.length === 0) {
				computerScore++;
				computerScoreCounterElement.textContent = computerScore;
				nextTurnContainer.innerHTML = '';
				auxSelect.innerHTML         = '';

				console.log('Perdiste. Fin de la partida :(');
				alert('Perdiste. Fin de la partida :(');
			}
		}
	}
}

const nextTurnPressed = (playerCards, computerCards) => {
	console.log('Pasas turno');
	
	const cc = cardsOnTheTable(playerCards, computerCards);
	const aa = allowedCards(computerCards, cc, magicNumber);
	
	const aleatoryIndex = randomInt(1, aa.length) - 1;
	
	const cardOfComputerDeleted = computerCards.splice(computerCards.indexOf(aa[aleatoryIndex]), 1)[0];
		
	printAuxiliarSelect(playerCards, computerCards, magicNumber);
	printNextTurnButton(playerCards, computerCards, magicNumber);
	printPlayerCards(playerCards);
	printComputerCards(computerCards);
	printCardsOnTheTable(playerCards, computerCards);
	
	const numero = cardOfComputerDeleted.substring(0, cardOfComputerDeleted.length - 1);
	const desc   = labels[cardOfComputerDeleted.substring(cardOfComputerDeleted.length - 1)];

	console.log('La computadora lanza el ' + numero + ' de ' + desc);
	alert('La computadora lanza el ' + numero + ' de ' + desc);

	if (computerCards.length === 0) {
		computerScore++;
		computerScoreCounterElement.textContent = computerScore;
		nextTurnContainer.innerHTML = '';
		auxSelect.innerHTML         = '';

		console.log('Perdiste. Fin de la partida :(');
		alert('Perdiste!');
	}
};

const cardsOnTheTable = (playerCards, computerCards) => {
	let cardsOnTheTable = [];
	
	for (let i = lowerValue; i <= highestValue; i++) {
		if (excludedValues.includes(i)) {
			continue;
		}
        for (const type of types) {
			if (!playerCards.includes(i + type) && !computerCards.includes(i + type)) {
				cardsOnTheTable.push(i + type);
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

const allowedCards = (cards, cardsOnTheTable, magicNumber) => {
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

