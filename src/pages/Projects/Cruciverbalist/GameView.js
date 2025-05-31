import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { doc, getDoc } from '@firebase/firestore';
import db from './firebase';

export const GameComponent = () => {
    const { id } = useParams();
    const [grid, setGrid] = useState(null);
    const [clues, setClues] = useState(null);

    const reshapeGrid = ({ rows, cols, cells }) => {
        const result = [];
        for (let i = 0; i < rows; i++) {
            result.push(cells.slice(i * cols, (i + 1) * cols));
        }
        return result;
    };

    useEffect(() => {
        const fetchPuzzle = async () => {
            const docRef = doc(db, "puzzles", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const puzzleData = docSnap.data();
                const reshapedGrid = reshapeGrid(puzzleData.grid);
                setGrid(reshapedGrid);
                setClues(puzzleData.clues);
            } else {
                console.error("No such puzzle!");
            }
        };
        fetchPuzzle();
    }, [id]);

    if (!grid || !clues) return <div>Loading puzzle...</div>;

    return <GameView grid={grid} clues={clues} />;
};



export const GameView = ({ grid, clues }) => {
    const getClueNumbers = (grid) => {
        let cellIndex = 1;
        const clueNumbers = [];

        for (let row = 0; row < grid.length; row++) {
            const gridRow = [];
            for (let col = 0; col < grid.length; col++) {
                const isNotBlocked = grid[row][col] !== '_';
                const isLeftBlocked = (col - 1 < 0 || grid[row][col - 1] === '_');
                const isTopBlocked = (row - 1 < 0 || grid[row - 1][col] === '_');
                const isRightNotBlocked = !(col + 1 >= grid.length || grid[row][col + 1] === '_');
                const isBottomNotBlocked = !(row + 1 >= grid.length || grid[row + 1][col] === '_');
                if (isNotBlocked && ((isTopBlocked && isBottomNotBlocked) || (isLeftBlocked && isRightNotBlocked))) {
                    gridRow.push(cellIndex);
                    cellIndex++;
                }
                else {
                    gridRow.push('');
                }
            }
            clueNumbers.push(gridRow);
        }

        return clueNumbers;
    };

    const [playerGrid, setPlayerGrid] = useState(grid.map(row => row.map(cell => (cell === '_' ? '_' : ''))));
    const [selectedCell, setSelectedCell] = useState(null);
    const [typingDirection, setTypingDirection] = useState('across');
    const [selectedWordBounds, setSelectedWordBounds] = useState([]);
    const [currentClueNumber, setCurrentClueNumber] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    const clueNumbers = getClueNumbers(grid);
    const gridContainerSize = 500;
    const gridCellSize = Math.floor(gridContainerSize / grid[0].length);
    const fontSize = Math.floor(gridCellSize * 0.6);
    const indexFontSize = Math.floor(gridCellSize * 0.3);

    useEffect(() => {
        if (selectedCell) {
            const bounds = getWordBounds(playerGrid, [selectedCell.rowIndex, selectedCell.colIndex], typingDirection);
            setSelectedWordBounds(bounds);

            const clueNum = getCurrentClueNumber(playerGrid, [selectedCell.rowIndex, selectedCell.colIndex], typingDirection);
            setCurrentClueNumber(clueNum);
        }
    }, [selectedCell, typingDirection, playerGrid]);

    const PopupModal = ({ title, children, onClose }) => {
        return (
            <div style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(30, 30, 30, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '1000'
            }}>
                <div style={{
                    background: 'white',
                    padding: '30px 40px',
                    borderRadius: '10px',
                    width: '90%',
                    maxWidth: '500px',
                    position: 'relative',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                    textAlign: 'center'
                }}>
                    <button style={{
                        position: 'absolute',
                        top: '10px',
                        right: '15px',
                        fontSize: '20px',
                        background: 'transparent',
                        color: '#000',
                        border: 'none',
                        cursor: 'pointer'
                    }} onClick={onClose}>✕</button>
                    {title && <h2 style={{ fontSize: '24px' }}>{title}</h2>}
                    <div style={{ fontSize: '16px' }}>
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    const onCellClick = (rowIndex, colIndex) => {
        const clueNumber = getCurrentClueNumber(grid, [rowIndex, colIndex], typingDirection);
        setCurrentClueNumber(clueNumber);

        if (selectedCell && selectedCell.rowIndex === rowIndex && selectedCell.colIndex === colIndex) {
            setSelectedCell({ rowIndex, colIndex });
            const newDirection = typingDirection === 'across' ? 'down' : 'across';
            setTypingDirection(newDirection)
            const wordBounds = getWordBounds(grid, [selectedCell.rowIndex, selectedCell.colIndex], newDirection);
            setSelectedWordBounds(wordBounds);
            const clueNumber = getCurrentClueNumber(grid, [rowIndex, colIndex], newDirection)
            setCurrentClueNumber(clueNumber);
            const cellId = document.getElementById(`input-${rowIndex}-${colIndex}`);
            cellId.focus();
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

    const getNextCell = (grid, selectedCell, moveDirection) => {
        let rowIndex = selectedCell.rowIndex;
        let colIndex = selectedCell.colIndex;

        if (moveDirection === "ArrowRight") colIndex++;
        else if (moveDirection === "ArrowLeft") colIndex--;
        else if (moveDirection === "ArrowUp") rowIndex--;
        else if (moveDirection === "ArrowDown") rowIndex++;

        while (
            rowIndex < grid.length && rowIndex > -1 &&
            colIndex < grid.length && colIndex > -1 &&
            grid[rowIndex][colIndex] === '_'
        ) {
            if (moveDirection === "ArrowRight") colIndex++;
            else if (moveDirection === "ArrowLeft") colIndex--;
            else if (moveDirection === "ArrowUp") rowIndex--;
            else if (moveDirection === "ArrowDown") rowIndex++;
        }

        if (
            rowIndex < grid.length && rowIndex > -1 &&
            colIndex < grid.length && colIndex > -1 &&
            grid[rowIndex][colIndex] !== '_'
        ) {
            return { rowIndex, colIndex };
        }

        return selectedCell;
    };

    const handleKeyDown = (event, rowIndex, colIndex) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "ArrowDown") {
            const nextCell = getNextCell(playerGrid, selectedCell, event.key);
            setSelectedCell(nextCell);

            const wordBounds = getWordBounds(playerGrid, [nextCell.rowIndex, nextCell.colIndex], typingDirection);
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
            const newGrid = [...playerGrid];
            newGrid[selectedCell.rowIndex][selectedCell.colIndex] = '';
            setPlayerGrid(newGrid);

            const nextCell = getNextCell(playerGrid, selectedCell, typingDirection === 'across' ? 'ArrowLeft' : 'ArrowUp');
            setSelectedCell(nextCell);
            const nextInputCell = document.getElementById(`input-${nextCell.rowIndex}-${nextCell.colIndex}`);
            nextInputCell.focus();
            nextInputCell.select();
        }

        else if (/^[A-Z]$/.test(event.key.toUpperCase())) {
            let newValue = event.key.toUpperCase();
            if (playerGrid[rowIndex][colIndex] !== '_') {
                const newGrid = [...playerGrid];
                newGrid[rowIndex][colIndex] = newValue;
                setPlayerGrid(newGrid);

                const nextCell = getNextCell(playerGrid, selectedCell, typingDirection === 'across' ? 'ArrowRight' : 'ArrowDown');
                setSelectedCell(nextCell);

                const wordBounds = getWordBounds(playerGrid, [nextCell.rowIndex, nextCell.colIndex], typingDirection);
                setSelectedWordBounds(wordBounds);
                const nextInputCell = document.getElementById(`input-${nextCell.rowIndex}-${nextCell.colIndex}`);
                nextInputCell.focus();
                nextInputCell.select();

                checkCorrectness();
            }
        }
    }

    const checkCorrectness = () => {
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[0].length; c++) {
                if (grid[r][c] !== '_' && grid[r][c] !== playerGrid[r][c]) {
                    setIsCorrect(false);
                    return;
                }
            }
        }
        setIsCorrect(true);
    };

    const getWordBounds = (grid, cell, direction) => {
        const size = grid.length;
        if (!cell) return [];

        const row = cell[0];
        const col = cell[1];

        let bounds = [];

        if (direction === 'across') {
            let c = col;
            while (c >= 0 && grid[row][c] !== '_') {
                c--;
            }
            c++;
            while (c < size && grid[row][c] !== '_') {
                bounds.push([row, c]);
                c++;
            }
        } else if (direction === 'down') {
            let r = row;
            while (r >= 0 && grid[r][col] !== '_') {
                r--;
            }
            r++;
            while (r < size && grid[r][col] !== '_') {
                bounds.push([r, col]);
                r++;
            }
        }

        return bounds;
    }

    const getCurrentClueNumber = (grid, cell, direction) => {
        const clueNumbers = getClueNumbers(grid);

        const row = cell[0];
        const col = cell[1];

        if (direction === 'across') {
            let c = col;
            while (c >= 0 && grid[row][c] !== '_') {
                c--;
            }
            c++;
            return clueNumbers[row][c];
        } else {
            let r = row;
            while (r >= 0 && grid[r][col] !== '_') {
                r--;
            }
            r++;
            return clueNumbers[r][col];
        }

    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', padding: '20px' }}>
            {isCorrect && (
                <PopupModal title="You win!" onClose={() => setIsCorrect(false)}></PopupModal>
            )}
            <div
                style={{
                    display: 'grid',
                    width: '500px',
                    height: '500px',
                    gridTemplateColumns: `repeat(${grid[0].length}, ${gridCellSize}px)`,
                    gridTemplateRows: `repeat(${grid.length}, ${gridCellSize}px)`,
                }}>
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const isBlack = cell === '_';
                        const isSelected = selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === colIndex;
                        const isHighlighted = selectedWordBounds.some(([r, c]) => r === rowIndex && c === colIndex);

                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    border: '1px solid #000',
                                    marginTop: '-1px',
                                    marginLeft: '-1px',
                                    backgroundColor: isBlack ? 'black' : isSelected ? '#8ea467' : isHighlighted ? '#8ea46780' : '#fff'
                                }}
                                onClick={() => onCellClick(rowIndex, colIndex)}>
                                {!isBlack && (
                                    <div>
                                        <div style={{
                                            position: 'absolute',
                                            top: '0px',
                                            left: '5px',
                                            fontSize: indexFontSize,
                                            color: '#333',
                                            zIndex: '1',
                                        }}>{clueNumbers[rowIndex][colIndex]}</div>
                                        <input
                                            id={`input-${rowIndex}-${colIndex}`}
                                            type="text"
                                            value={playerGrid[rowIndex][colIndex]}
                                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                            style={{
                                                width: `${gridCellSize}px`,
                                                height: `${gridCellSize}px`,
                                                fontSize: `${fontSize}px`,
                                                textAlign: 'center',
                                                border: 'none',
                                                outline: 'none',
                                                caretColor: 'transparent',
                                                backgroundColor: 'transparent',
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', maxHeight: '500px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '20px' }}>
                    <h3>Across Clues</h3>
                    <div style={{
                        width: '300px',
                        padding: '10px',
                        border: '1px solid #808080',
                        minHeight: '360px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        marginBottom: '100px'
                    }}>
                        {Object.keys(clues.across).length === 0 ? <p>No clues here!</p> : Object.entries(clues.across).sort((a, b) => a.clueNumber - b.clueNumber).map(([clueNumber, clueText]) => (
                            <div key={`across-${clueNumber}`} id={`across-${clueNumber}`} style={{ padding: '10px', backgroundColor: typingDirection === 'across' && currentClueNumber === parseInt(clueNumber) ? '#8ea46780' : '#fff' }}>
                                {clueNumber}. {clueText}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '20px' }}>
                    <h3>Down Clues</h3>
                    <div style={{
                        width: '300px',
                        padding: '10px',
                        border: '1px solid #808080',
                        minHeight: '360px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        marginBottom: '100px'
                    }}>
                        {Object.keys(clues.down).length === 0 ? <p>No clues here!</p> : Object.entries(clues.down).sort((a, b) => a.clueNumber - b.clueNumber).map(([clueNumber, clueText]) => (
                            <div key={`down-${clueNumber}`} id={`down-${clueNumber}`} style={{ padding: '10px', backgroundColor: typingDirection === 'down' && currentClueNumber === parseInt(clueNumber) ? '#8ea46780' : '#fff' }}>
                                {clueNumber}. {clueText}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};