'use strict'

var gameInterval = null

function init() {
	finishGameInterval()
	firstClickTrue()
	initState()
	// clearLocalStorage()
	initScoresData()
	renderBoard(getBoard())
	renderNumOfMines(getGLevelMines() - getMarkedCount())
	renderButton(GAMEON)
	renderGameTimer(getSecsPassed())
	renderBestScore(getScoresMap()[getGLevelName()])
	renderLivesLeft(getLives())
	renderCellSafeClickAvailable(getSafeClicks())
	renderCellHintsAvailable(getHints())
	renderManuallyCreate('Off')
}

function startGameInterval() {
	gameInterval = setInterval(manageGameTimer, 1000)
}

function finishGameInterval() {
	clearInterval(gameInterval)
	gameInterval = null
}

function setLevel(event) {
	const level = event.target.value
	if (level === 'easy') setMode('easy', 4, 2)
	if (level === 'medium') setMode('medium', 8, 12)
	if (level === 'hard') setMode('hard', 12, 30)
	init()
}

function leftClick(i, j) {
	var cell = getCell(i, j)
	if (getIsManuallyCreateMode()) {
		placeMinesManuallyCreateMode(cell)
		return
	}
	if (!getIsGameOn() || cell.isMarked || cell.isHint) return
	if (getFirstClick()) executedAfterFirstClick(cell)
	if (getHintsMode()) {
		useHints(cell)
		return
	}
	if (!cell.isShown && !cell.isMine) {
		//showCell()
		increaseShownCount(cell)
		if (cell.content === 0) {
			renderCellColor(cell, 'darkgray')
			expandShown(cell)
		} else {
			renderCell(cell, cell.content)
		}
		checkVictory()
	} else if (cell.isMine) {
		gameOver(cell)
	}
}

function rightClick(event, i, j) {
	event.preventDefault()
	var cell = getCell(i, j)
	if (!getIsGameOn() || getIsManuallyCreateMode() || getHintsMode()
		|| cell.isShown || cell.isHint) return
	if (getFirstClick()) executedAfterFirstClick(cell)
	if (!cell.isMarked) {
		if (getMarkedCount() < getGLevelMines()) {
			increaseMarkedCount(cell)
			renderCell(cell, FLAG)
			renderNumOfMines(getGLevelMines() - getMarkedCount())
			checkVictory()
		}
	} else {
		decreaseMarkedCount(cell)
		renderCell(cell, EMPTY)
		renderNumOfMines(getGLevelMines() - getMarkedCount())
	}
}

function executedAfterFirstClick(cell) {
	startGameInterval()
	placeMines(cell)
	setMinesNegsCount()
	firstClickFalse()
}

function manageGameTimer() {
	increaseSecsPassed()
	renderGameTimer(getSecsPassed())
}

function expandShown(cell) {
	var cellsToShow = getAllCellsToShow(cell)
	for (var i = 0; i < cellsToShow.length; i++) {
		var currCell = cellsToShow[i]
		if (!currCell.isShown) {
			increaseShownCount(currCell)
			if (currCell.content === 0) {
				renderCellColor(currCell, 'darkgray')
				expandShown(currCell)
			} else {
				renderCell(currCell, currCell.content)
			}
		}
	}
}

function safeClick() {
	if (!getIsGameOn() || getFirstClick()) return
	if (getHintsMode()) hintsModeOff()
	if (!getSafeClicks() > 0) return
	var safeCells = getAllSafeCells()	
	if (safeCells.length === 0) return
	var randNum = getRandomIntInclusive(0, safeCells.length-1)
	var randCell = safeCells[randNum]
	renderCellColor(randCell, 'lightgreen')
	renderCellSafeClickAvailable(getSafeClicks())
	isSafeClickTrue(randCell)
	setTimeout(endSafeClick, 2000, randCell)
}

function endSafeClick(randCell) {
	if (randCell.isHint) return
	if (randCell.content === 0 && randCell.isShown) return
	renderCellColor(randCell, 'lightgray')
}

function hintsButtonPressed() {
	if (!getIsGameOn() || getFirstClick()) return
	if (getHints() > 0) hintsModeOn()
}

function useHints(cell) { 
	if (cell.isShown) return
	var unrevealedCells = getAllUnrevealedCells(cell)
	for (var i = 0; i < unrevealedCells.length; i++) {
		isHintTrue(unrevealedCells[i])
		renderCell(unrevealedCells[i], unrevealedCells[i].content)
		renderCellColor(unrevealedCells[i], 'lightgreen')
	}
	renderCellHintsAvailable(getHints())
	hintsModeOff()
	setTimeout(endHints, 2000, unrevealedCells)
}

function endHints(unrevealedCells) {
	for (var i = 0; i < unrevealedCells.length; i++) {
		isHintFalse(unrevealedCells[i])
		renderCell(unrevealedCells[i], EMPTY)
		renderCellColor(unrevealedCells[i], 'lightgray')
	}
}

function manuallyCreateMode() {
	if (getIsManuallyCreateMode()) return
	if (getIsGameOn() && getManuallyCreateModeMineCells().length > 0) return
	init()
	manuallyCreateModeOn()
	renderManuallyCreate('On')
}

function placeMinesManuallyCreateMode(cell) {
	if (cell.isMine) return
	pushInManuallyCreateModeMineCells(cell)
	renderCell(cell, MINE)
	var mineCells = getManuallyCreateModeMineCells()
	if (getGLevelMines() === mineCells.length) {
		for (var i = 0; i < mineCells.length; i++) {
			renderCell(mineCells[i], EMPTY)
		}
		manuallyCreateModeOff()
		manuallyCreateModeIsCurrentlyPlacingMinesTrue()
	}
}

function gameOver(cell) {
	decreaseLives()
	renderLivesLeft(getLives())
	renderCellColor(cell, 'red')
	if (getLives() > 0) {
		setTimeout(renderCellColor, 1000, cell, 'lightgray')
		return
	}

	var notMarkedMinesCells = getAllNotMarkedMinesCells()
	for (var i = 0; i < notMarkedMinesCells.length; i++) {
		var currCell = notMarkedMinesCells[i]
		renderCell(currCell, currCell.content)
	}

	var notMinesMarkedCells = getAllNotMinesMarkedCells()
	for (var i = 0; i < notMinesMarkedCells.length; i++) {
		var currCell = notMinesMarkedCells[i]
		renderCell(currCell, REDX)
	}

	gameOff()
	renderButton(GAMELOST)
	finishGameInterval()
}

function checkVictory() {
	var notMinesCellsCount = getGLevelSize()*getGLevelSize() - getGLevelMines()
	if (getMarkedCount() === getGLevelMines() && getShownCount() === notMinesCellsCount) {
		gameOff()
		renderButton(GAMEWON)
		finishGameInterval()
		if (getSecsPassed() < getScoresMap()[getGLevelName()]) {
			setBestScore(getGLevelName(), getSecsPassed())
			loadScoresFromStorage()
			renderBestScore(getScoresMap()[getGLevelName()])
		}
	}
}