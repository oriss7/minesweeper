'use strict'

function renderBoard(board) {
	const selector = '.board-container'
	const elContainer = document.querySelector(selector)
	let htmlStr = '<table>'
	for (let i = 0; i < board.length; i++) {
		htmlStr += `<tr class="row-${i}">`
		const row = board[i]
		for (let j = 0; j < row.length; j++) {
			const currCell = row[j]
			htmlStr += `<td onclick="leftClick(${i}, ${j})" 
				oncontextmenu="rightClick(event, ${i}, ${j})"
				class="col-${i}-${j}">
		    	${EMPTY}</td>`
		}
		htmlStr += '</tr>'
	}
	htmlStr += '</table>'
	elContainer.innerHTML = htmlStr
}

function renderCell(cell, content) {
	const selector = `.col-${cell.location.i}-${cell.location.j}`
	renderInnerHtml(selector, content)
	if (typeof content === 'number') {
		const color = getColor(content)
		renderTextColor(selector, color)
	}
}

function renderCellColor(cell, color) {
	const selector = `.col-${cell.location.i}-${cell.location.j}`
	renderBackgroundColor(selector, color)
}

function renderNumOfMines(content) {
	const selector = '.num-of-mines'
	renderInnerHtml(selector, content)
}

function renderButton(content) {
	const selector = '.restart-btn'
	renderInnerHtml(selector, content)
}

function renderGameTimer(secsPassed) {
	const selector = '.timer'
	var addedZeros = '00'
	if (secsPassed > 9) addedZeros = '0'
	if (secsPassed > 99) addedZeros = ''
	const content = addedZeros + secsPassed
	renderInnerHtml(selector, content)
}

function renderBestScore(bestScore) {
	const selector = '.best-score'
	const content = 'BestScore - ' + bestScore
	renderInnerHtml(selector, content)
}

function renderLivesLeft(lives) {
	const selector = '.lives-left'
	const content = lives + ' Lives Left!'
	renderInnerHtml(selector, content)
}

function renderCellSafeClickAvailable(safeClicksAvailable) {
	const selector = '.safeClick-count'
	const content = safeClicksAvailable + ' clicks'
	renderInnerHtml(selector, content)
}

function renderCellHintsAvailable(hintsAvailable) {
	const selector = '.hints-count'
	const content = hintsAvailable + ' hints'
	renderInnerHtml(selector, content)
}

function renderManuallyCreate(content) {
	const selector = '.manuallyCreate-status'
	renderInnerHtml(selector, content)
}

function getColor(content) {
	switch(content) {
		case 0: return 'black'
		case 1: return 'blue'
		case 2: return 'green'
		case 3: return 'red'
		case 4: return 'darkblue'
		case 5: return 'brown'
		case 6: return 'cyan'
		case 7: return 'black'
		case 8: return 'gray'
	}
}

function renderInnerHtml(selector, content) {
	document.querySelector(selector).innerHTML = content
}

function renderBackgroundColor(selector, color) {
	document.querySelector(selector).style.backgroundColor = color
}

function renderTextColor(selector, color) {
	document.querySelector(selector).style.color = color
}