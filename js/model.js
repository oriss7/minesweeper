'use strict'
//need to find place to those const,
//maybe a 'utils.js'
const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
const GAMEON = '🙂'
const GAMELOST = '😖'
const GAMEWON = '😎'
const REDX = '❌'

var gGame
var gLevel = {
	name: 'medium',
	size: 8,
	mines: 12
}
var scoresMap = {
	easy: 100,
	medium: 100,
	hard: 200
}
var firstClick = true

function initState() {
	gGame = {
		board: buildBoard(),
		isOn: true,
		shownCount: 0,
		markedCount: 0,
		secsPassed: 0,
		safeClicks: 3,
		hints: 3,
		isHintsMode: false,
		lives: 3,
		manuallyCreateMode: buildManuallyCreateMode()
	}
}

function buildBoard() {
	var board = []
	for (let i = 0; i < gLevel.size; i++) {
		board.push([])
		for (let j = 0; j < gLevel.size; j++) {
			board[i][j] = {
				location: {i, j},
				content: EMPTY,
				isShown: false,
				isMine: false,
				isMarked: false,
				isSafeClick: false,
				isHint: false
			}
		}
	}
	return board
}

function buildManuallyCreateMode() {
	var manuallyCreateMode = {
		isOn: false,
		isCurrentlyPlacingMines: false,
		mineCells: []
	}
	return manuallyCreateMode
}

function setMode(name, size, mines) {
	gLevel.name = name
	gLevel.size = size
	gLevel.mines = mines
}

function setBestScore(level, score) {
	scoresMap[level] = score
	localStorage.setItem('scoresMap', JSON.stringify(scoresMap));
}

function loadScoresFromStorage() {
	return JSON.parse(localStorage.getItem('scoresMap'))
}

function initScoresData() {
	if (loadScoresFromStorage()) scoresMap = loadScoresFromStorage()
}

function clearLocalStorage() {
	localStorage.clear()
}

function getScoresMap() {
	return scoresMap
}

function placeMines(firstClickCell) {
	if (gGame.manuallyCreateMode.isCurrentlyPlacingMines) return
	var emptyCells = []
	function tryToAddToEmptyCells(cell) {
		if (cell === firstClickCell) return
		emptyCells.push(cell)
	}
	iterateBoardCells(tryToAddToEmptyCells)
	var num = 0
	while (num < gLevel.mines) {
		var randNum = getRandomIntInclusive(0, emptyCells.length-1)
		var randCell = emptyCells[randNum]
		randCell.isMine = true
		randCell.content = MINE
		emptyCells.splice(randNum ,1)
		num += 1
	}
}

function setMinesNegsCount() {
	function runOverBoardToFindNegs(cell) {
		let numOfMinesAround = 0
		if (cell.isMine === false) {
			function CountNegs(currCell, i, j) {
				if (i === cell.location.i && j === cell.location.j) return
				if (currCell.isMine === true) {
					numOfMinesAround += 1
				}
			}
			iterateNegs(cell, CountNegs)
			cell.content = numOfMinesAround
		}
	}
	iterateBoardCells(runOverBoardToFindNegs)
}

function getAllCellsToShow(cell) {
	var cellsToShow = []
	function tryToAddToNegsToShow(negCell, i, j) {
		if (i === cell.location.i && j === cell.location.j) return
		if (!negCell.isMine && !negCell.isShown &&
			!negCell.isMarked && !negCell.isHint) {
			cellsToShow.push(negCell)
		}
	}
	iterateNegs(cell, tryToAddToNegsToShow)
	return cellsToShow
}

function getAllSafeCells() {
	var safeCells = []
	function tryToAddToSafeCells(cell) {
		if (!cell.isShown && !cell.isMine && !cell.isMarked
			&& !cell.isSafeClick && !cell.isHint) {
			safeCells.push(cell)
		}
	}
	iterateBoardCells(tryToAddToSafeCells)
	if (safeCells.length !== 0) gGame.safeClicks -= 1
	return safeCells
}

function getAllUnrevealedCells(cell) {
	var unrevealedCells = []
	function tryToAddToUnrevealedCells(negCell) {
		if (negCell.isMarked && negCell.isMine) return
		if (!negCell.isShown) {
			unrevealedCells.push(negCell)
		}
	}
	iterateNegs(cell, tryToAddToUnrevealedCells)
	gGame.hints -= 1
	return unrevealedCells
}

function getAllNotMarkedMinesCells() {
	var notMarkedMinesCells = []
	function tryToAddToNotMarkedMinesCells(cell) {
		if (cell.isMine && !cell.isMarked) {
			notMarkedMinesCells.push(cell)
		}
	}
	iterateBoardCells(tryToAddToNotMarkedMinesCells)
	return notMarkedMinesCells
}

function getAllNotMinesMarkedCells() {
	var notMinesMarkedCells = []
	function tryToAddToNotMinesMarkedCells(cell) {
		if (!cell.isMine && cell.isMarked) {
			notMinesMarkedCells.push(cell)
		}
	}
	iterateBoardCells(tryToAddToNotMinesMarkedCells)
	return notMinesMarkedCells
}

function iterateNegs(cell, doItCb) {
	for (let i = cell.location.i - 1; i <= cell.location.i + 1; i++) {
		if (i < 0 || i >= gLevel.size) continue
		for (let j = cell.location.j - 1; j <= cell.location.j + 1; j++) {
			if (j < 0 || j >= gLevel.size) continue	
			var currCell = gGame.board[i][j]
			doItCb(currCell, i, j)
		}
	}
}

function iterateBoardCells(doItCb) {
	for (var i = 0; i < gLevel.size; i++) {
		for (var j = 0; j < gLevel.size; j++) {
			var cell = gGame.board[i][j]
			doItCb(cell)
		}
	}
}

function getRandomIntInclusive(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getGLevelName() {
	return gLevel.name
}

function getGLevelSize() {
	return gLevel.size
}

function getGLevelMines() {
	return gLevel.mines
}

function getFirstClick() {
	return firstClick
}

function firstClickTrue() {
	firstClick = true
}

function firstClickFalse() {
	firstClick = false
}

function getGGame() {
	return gGame
}

function getBoard() {
	return gGame.board
}

function getCell(i, j) {
	return gGame.board[i][j]
}

function getIsGameOn() {
	return gGame.isOn
}

function getShownCount() {
	return gGame.shownCount
}

function getMarkedCount() {
	return gGame.markedCount
}

function getSecsPassed() {
	return gGame.secsPassed
}

function getSafeClicks() {
	return gGame.safeClicks
}

function getHints() {
	return gGame.hints
}

function getHintsMode() {
	return gGame.isHintsMode
}

function getLives() {
	return gGame.lives
}

function getIsManuallyCreateMode() {
	return gGame.manuallyCreateMode.isOn
}

function getManuallyCreateModeMineCells() {
	return gGame.manuallyCreateMode.mineCells
}

function gameOff() {
	gGame.isOn = false
}

function increaseShownCount(cell) {
	cell.isShown = true
	gGame.shownCount += 1
}

function decreaseShownCount(cell) {
	cell.isShown = false
	gGame.shownCount -= 1
}

function increaseMarkedCount(cell) {
	cell.isMarked = true
	gGame.markedCount += 1
}

function decreaseMarkedCount(cell) {
	cell.isMarked = false
	gGame.markedCount -= 1
}

function increaseSecsPassed() {
	gGame.secsPassed += 1
}

function isSafeClickTrue(cell) {
	cell.isSafeClick = true
}

function hintsModeOn() {
	gGame.isHintsMode = true
}

function hintsModeOff() {
	gGame.isHintsMode = false
}

function isHintTrue(cell) {
	cell.isHint = true
}

function isHintFalse(cell) {
	cell.isHint = false
}

function decreaseLives() {
	gGame.lives -= 1
}

function manuallyCreateModeOn() {
	gGame.manuallyCreateMode.isOn = true
}

function manuallyCreateModeOff() {
	gGame.manuallyCreateMode.isOn = false
}

function manuallyCreateModeIsCurrentlyPlacingMinesTrue() {
	gGame.manuallyCreateMode.isCurrentlyPlacingMines = true
}

function pushInManuallyCreateModeMineCells(cell) {
	gGame.manuallyCreateMode.mineCells.push(cell)
	cell.isMine = true
	cell.content = MINE
}

// function setMinesNegsCount() {
// 	for (var i = 0; i < gLevel.size; i++) {
// 		for (var j = 0; j < gLevel.size; j++) {
// 			let numOfMinesAround = 0
// 			var cell = gGame.board[i][j]
// 			if (cell.isMine === false) {
// 				for (let i = cell.location.i - 1; i <= cell.location.i + 1; i++) {
// 					if (i < 0 || i >= gLevel.size) continue;
// 					for (let j = cell.location.j - 1; j <= cell.location.j + 1; j++) {
// 						if (j < 0 || j >= gLevel.size) continue;
// 						if (i === cell.location.i && j === cell.location.j) continue;
// 						let currCell = gGame.board[i][j]
// 						if (currCell.isMine === true) {
// 							numOfMinesAround += 1
// 						}
// 					}
// 				}
// 				cell.content = numOfMinesAround
// 			}
// 		}
// 	}
// }