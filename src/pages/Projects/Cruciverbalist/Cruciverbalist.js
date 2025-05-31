import './Cruciverbalist.css';
import React, { useState } from 'react';
import { EditableGrid, ClueInputs, PopupModal, EndingPage } from './Components';
import { generateEmptyGrid, getCluesFromGrid, getCurrentClueNumber, getWordBounds, flattenGrid } from './Helpers';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import { collection, addDoc } from "@firebase/firestore";
import db from './firebase';

export const Cruciverbalist = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sizeInput, setSizeInput] = useState(5);
  const [grid, setGrid] = useState(generateEmptyGrid(1, 1));
  const [mode, setMode] = useState('edit');
  const [selectedCell, setSelectedCell] = useState(null);
  const [typingDirection, setTypingDirection] = useState('across');
  const [selectedWordBounds, setSelectedWordBounds] = useState([]);
  const [currentClueNumber, setCurrentClueNumber] = useState(null);
  const [clueTexts, setClueTexts] = useState({ across: {}, down: {} });
  const [showInstructions, setShowInstructions] = useState(false);
  const [resetApp, setResetApp] = useState(false);
  const [isPuzzleInvalid, setIsPuzzleInvalid] = useState(false);
  const [puzzleKey, setPuzzleKey] = useState(null);

  const initializeGrid = () => {
    if (sizeInput >= 5 && sizeInput <= 15) {
      goToPage(2);
      setGrid(generateEmptyGrid(sizeInput, sizeInput));
      setShowInstructions(true);
    } else {
      alert('Rows and columns must be between 5 and 15.');
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const handleChangeSizeInput = (value) => {
    if (!value) setSizeInput(5)
    else setSizeInput(value)
  };

  const onCellChange = (rowIndex, colIndex, value) => {
    if (!value) return;
    const reg = /[A-Z]/;
    let newValue = value.charAt(value.length - 1).toUpperCase();
    if (mode === 'edit' && grid[rowIndex][colIndex] !== '_' && reg.test(newValue)) {
      const newGrid = [...grid];
      newGrid[rowIndex][colIndex] = newValue;
      setGrid(newGrid);

      const nextCell = getNextCell(grid, selectedCell, typingDirection === 'across' ? 'ArrowRight' : 'ArrowDown');
      setSelectedCell(nextCell);

      const wordBounds = getWordBounds(grid, [nextCell.rowIndex, nextCell.colIndex], typingDirection);
      setSelectedWordBounds(wordBounds);
      const nextInputCell = document.getElementById(`input-${nextCell.rowIndex}-${nextCell.colIndex}`);
      nextInputCell.focus();
      nextInputCell.select();
    }
  };

  const onCellBlacken = (rowIndex, colIndex) => {
    if (mode === 'blacken') {
      const newGrid = [...grid];
      newGrid[rowIndex][colIndex] = newGrid[rowIndex][colIndex] === '_' ? '' : '_';
      setGrid(newGrid);
    }
  };

  const onCellClick = (rowIndex, colIndex) => {
    if (selectedCell && selectedCell.rowIndex === rowIndex && selectedCell.colIndex === colIndex) {
      setSelectedCell({ rowIndex, colIndex });
      const newDirection = typingDirection === 'across' ? 'down' : 'across';
      setTypingDirection(newDirection)
      const wordBounds = getWordBounds(grid, [selectedCell.rowIndex, selectedCell.colIndex], newDirection);
      setSelectedWordBounds(wordBounds);
      const clueNumber = getCurrentClueNumber(grid, [rowIndex, colIndex], newDirection)
      setCurrentClueNumber(clueNumber);
      const clueId = document.getElementById(`${newDirection}-${clueNumber}`);
      if (clueId) clueId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    else {
      const wordBounds = getWordBounds(grid, [rowIndex, colIndex], typingDirection);
      if (grid[rowIndex][colIndex] !== '_') {
        setSelectedCell({ rowIndex, colIndex });
        setSelectedWordBounds(wordBounds)
        const clueNumber = getCurrentClueNumber(grid, [rowIndex, colIndex], typingDirection)
        setCurrentClueNumber(clueNumber);
        const clueId = document.getElementById(`${typingDirection}-${clueNumber}`);
        if (clueId) clueId.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setSelectedCell(null);
    setSelectedWordBounds([]);
  };

  const clearBlackenedCells = () => {
    const newGrid = grid.map(row => row.map(cell => (cell === '_' ? '' : cell)));
    setGrid(newGrid);
  };

  const clearUnblackenedCells = () => {
    const newGrid = grid.map(row => row.map(cell => (cell !== '_' ? '' : cell)));
    setGrid(newGrid);
  };

  const getNextCell = (grid, selectedCell, moveDirection) => {

    let rowIndex = selectedCell.rowIndex;
    let colIndex = selectedCell.colIndex;

    if (moveDirection === "ArrowRight") colIndex++;
    else if (moveDirection === "ArrowLeft") colIndex--;
    else if (moveDirection === "ArrowUp") rowIndex--;
    else if (moveDirection === "ArrowDown") rowIndex++;

    while (rowIndex < grid.length && rowIndex > -1 && colIndex < grid.length && colIndex > -1 && grid[rowIndex][colIndex] === '_') {
      if (moveDirection === "ArrowRight") colIndex++;
      else if (moveDirection === "ArrowLeft") colIndex--;
      else if (moveDirection === "ArrowUp") rowIndex--;
      else if (moveDirection === "ArrowDown") rowIndex++;
    }

    if (rowIndex < grid.length && rowIndex > -1 && colIndex < grid.length && colIndex > -1 && grid[rowIndex][colIndex] !== '_')
      return { rowIndex, colIndex };
    return selectedCell;
  }

  const handleKeyDown = (event, rowIndex, colIndex) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "ArrowDown") {
      const nextCell = getNextCell(grid, selectedCell, event.key);
      setSelectedCell(nextCell);

      const wordBounds = getWordBounds(grid, [nextCell.rowIndex, nextCell.colIndex], typingDirection);
      setSelectedWordBounds(wordBounds);
      const nextInputCell = document.getElementById(`input-${nextCell.rowIndex}-${nextCell.colIndex}`);
      nextInputCell.focus();
      nextInputCell.select();
    }

    else if (event.key === " ") {
      const newDirection = typingDirection === 'across' ? 'down' : 'across';
      setTypingDirection(newDirection)
      const wordBounds = getWordBounds(grid, [selectedCell.rowIndex, selectedCell.colIndex], newDirection);
      setSelectedWordBounds(wordBounds)
    }

    else if (event.key === "Backspace") {
      const newGrid = [...grid];
      newGrid[selectedCell.rowIndex][selectedCell.colIndex] = '';
      setGrid(newGrid);

      const nextCell = getNextCell(grid, selectedCell, typingDirection === 'across' ? 'ArrowLeft' : 'ArrowUp');
      setSelectedCell(nextCell);
      const nextInputCell = document.getElementById(`input-${nextCell.rowIndex}-${nextCell.colIndex}`);
      nextInputCell.focus();
      nextInputCell.select();
    }

    else if (/^[A-Z]$/.test(event.key.toUpperCase())) {
      let newValue = event.key.toUpperCase();
      if (mode === 'edit' && grid[rowIndex][colIndex] !== '_') {
        const newGrid = [...grid];
        newGrid[rowIndex][colIndex] = newValue;
        setGrid(newGrid);

        const nextCell = getNextCell(grid, selectedCell, typingDirection === 'across' ? 'ArrowRight' : 'ArrowDown');
        setSelectedCell(nextCell);

        const wordBounds = getWordBounds(grid, [nextCell.rowIndex, nextCell.colIndex], typingDirection);
        setSelectedWordBounds(wordBounds);
        const nextInputCell = document.getElementById(`input-${nextCell.rowIndex}-${nextCell.colIndex}`);
        nextInputCell.focus();
        nextInputCell.select();
      }
    }
  }

  const uploadPuzzle = async () => {
    const flatGrid = flattenGrid(grid);
    // console.log(flatGrid)
    try {
      const docRef = await addDoc(collection(db, "puzzles"), {
        grid: flatGrid,
        clues: clueTexts,
      });
      // console.log(docRef)
      // console.log(docRef.id)
      return docRef.id;
    } catch (err) {
      console.error("Failed to upload puzzle:", err);
      return null;
    }
  };

  const checkPuzzleValidity = () => {
    const clues = getCluesFromGrid(grid);
    for (let row of grid) {
      for (let cell of row) {
        if (cell === '' || cell === undefined) return false;
      }
    }

    if (Object.values(clueTexts.across).length !== clues.across.count) return false;
    for (let clue of Object.values(clueTexts.across))
      if (clue === '' || clue === undefined) return false;

    if (Object.values(clueTexts.down).length !== clues.down.count) return false;
    for (let clue of Object.values(clueTexts.down))
      if (clue === '' || clue === undefined) return false;

    return true;
  }

  if (currentPage === 1) {
    const titleTextArray = [...'CRUCIVERBALIST'];

    return (
      <div id='landing-page'>
        <div id='landing-page-components'>
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            {titleTextArray.map((char, index) => {
              return <div key={index} className='grid-cell' style={{ width: '50px', height: '50px' }}>
                {index === 0 && <div style={{
                  position: 'absolute',
                  top: '0px',
                  left: '5px',
                  fontSize: '20px',
                  color: '#333'
                }}>8</div>}
                <div style={{ fontSize: '36px', marginTop: '8px', marginLeft: '2px' }}>{char}</div>
              </div>;
            })}
          </div>
          <i style={{ marginBottom: '60px' }}>8 ACROSS (14): A person skillful in creating or solving crossword puzzles</i>


          <div id='landing-page-input'>
            <label>
              Grid size:
            </label>
            <input
              type="number"
              min="5"
              max="15"
              value={sizeInput}
              onChange={(e) => handleChangeSizeInput(parseInt(e.target.value, 10))}
            />
            x {sizeInput} squares
          </div>
          <button onClick={initializeGrid} style={{ fontSize: '20px' }}>Start</button>
        </div>
      </div>
    );
  } else if (currentPage === 2) {
    return <div id='build-page'>
      <div>
        {showInstructions && (
          <PopupModal title="Instructions" onClose={() => setShowInstructions(false)}>
            <p>Click on a square to start typing.</p>
            <p>Click on a selected square or use the spacebar to change typing direction.</p>
            <p>Toggle the switch to enter 'Block Mode'. Squares will now turn black and un-editable on clicking.</p>
            <p>Fill in every cell and clue to proceed. Happy building!</p>
          </PopupModal>
        )}
        {resetApp && (
          <PopupModal title="Warning!" onClose={() => setResetApp(false)}>
            <p>You will lose all your progress if you go back.</p>
            <button onClick={() => { setResetApp(false); goToPage(1) }} style={{ fontSize: '16px', marginTop: '10px' }}>Proceed</button>
          </PopupModal>
        )}
        {isPuzzleInvalid && (
          <PopupModal title="Something's missing" onClose={() => setIsPuzzleInvalid(false)}>
            <p>Make sure all the cells of your puzzle along with their respective clues are filled correctly.</p>
          </PopupModal>
        )}
        <EditableGrid
          grid={grid}
          onCellChange={onCellChange}
          onCellBlacken={onCellBlacken}
          onCellClick={onCellClick}
          mode={mode}
          selectedCell={selectedCell}
          selectedWordBounds={selectedWordBounds}
          handleKeyDown={handleKeyDown}
        />
        <div id="button-container">
          <div className="switch-container">
            Block Mode
            <label className="switch">
              <input
                type="checkbox"
                className='slider-input'
                checked={mode === 'blacken'}
                onChange={(e) => toggleMode(e.target.checked ? 'blacken' : 'edit')}
              />
              <span className="slider"></span>
            </label>
          </div>
          <button onClick={clearBlackenedCells} style={{ fontSize: '20px' }}>
            Clear blocks
          </button>
          <button onClick={clearUnblackenedCells} style={{ fontSize: '20px' }}>
            Clear letters
          </button>
        </div>
      </div>

      <ClueInputs
        grid={grid}
        currentClue={currentClueNumber}
        direction={typingDirection}
        clueTexts={clueTexts}
        setClueTexts={setClueTexts} />

      <button onClick={() => setResetApp(true)} className="icon-button" style={{ position: 'fixed', bottom: '40px', left: '40px' }}>
        <UndoRoundedIcon fontSize="large" />
      </button>

      <button onClick={async () => {
        if (checkPuzzleValidity()) {
          const key = await uploadPuzzle();
          setPuzzleKey(key);
          goToPage(3);
        } else {
          setIsPuzzleInvalid(true);
        }
      }
      } className="icon-button" style={{ position: 'fixed', bottom: '40px', right: '40px' }}>
        <RedoRoundedIcon fontSize="large" />
      </button>
    </div>
  }

  return (
    <EndingPage puzzleKey={puzzleKey}></EndingPage>
  );
};