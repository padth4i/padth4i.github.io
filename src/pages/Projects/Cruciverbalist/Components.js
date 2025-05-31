import './Cruciverbalist.css';
import React, { useState } from 'react';
import { getClueNumbers, getCluesFromGrid } from './Helpers';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Check from '@mui/icons-material/Check';

export function EditableGrid({ grid, onCellBlacken, mode, selectedCell, onCellClick, selectedWordBounds, handleKeyDown }) {

    const gridContainerSize = 500;
    const gridCellSize = Math.floor(gridContainerSize / grid[0].length);
    const fontSize = Math.floor(gridCellSize * 0.6);
    const indexFontSize = Math.floor(gridCellSize * 0.3);
    const clueNumbers = getClueNumbers(grid);

    const handleClick = (rowIndex, colIndex) => {
        if (mode === 'edit') {
            onCellClick(rowIndex, colIndex);
        } else if (mode === 'blacken') {
            onCellBlacken(rowIndex, colIndex);
        }
    };

    return (
        <div
            className='crossword-grid'
            style={{
                gridTemplateColumns: `repeat(${grid[0].length}, ${gridCellSize}px)`,
                gridTemplateRows: `repeat(${grid[0].length}, ${gridCellSize}px)`,
            }}>
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                    const isBlackCell = cell === '_';
                    const isSelected =
                        selectedCell && selectedCell.rowIndex === rowIndex && selectedCell.colIndex === colIndex;
                    const backgroundColor =
                        isBlackCell ? 'black' : isSelected ? '#8ea467' : JSON.stringify(selectedWordBounds).includes(JSON.stringify([rowIndex, colIndex])) ? '#8ea46780' : '#f9f9f9';
                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className='grid-cell'
                            style={{
                                backgroundColor: backgroundColor,
                                cursor: isBlackCell && mode === 'edit' ? 'not-allowed' : 'pointer',
                            }}
                            onClick={() => handleClick(rowIndex, colIndex)}>
                            {isBlackCell ? <div /> :
                                <input
                                    id={`input-${rowIndex}-${colIndex}`}
                                    type="text"
                                    value={cell === '_' ? '' : cell}
                                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                    style={{ marginTop: '10px', width: `${gridCellSize}px`, height: `${gridCellSize}px`, fontSize: `${fontSize}px` }}
                                />
                            }
                            <div className="cell-index" style={{ fontSize: indexFontSize }}>
                                {clueNumbers[rowIndex][colIndex]}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};


export const ClueInputs = ({ grid, currentClue, direction, clueTexts, setClueTexts }) => {
    const clues = getCluesFromGrid(grid);

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '40px' }}>
                <h3>Across Clues</h3>
                <div className='clue-list'>
                    {clues.across.count === 0 ? <p>No space for clues!</p> : [...clues.across.clues].sort((a, b) => a.clueNumber - b.clueNumber).map((clue, index) => (
                        <div key={`across-${index}`} id={`across-${clue.clueNumber}`} style={{ padding: '10px', display: 'flex', flexDirection: 'column', marginBottom: '5px', backgroundColor: direction === 'across' && currentClue === clue.clueNumber ? '#8ea46780' : '#fff' }}>
                            Clue {clue.clueNumber} ({clue.length})
                            <input
                                type="text"
                                id={`input-across-${clue.clueNumber}`}
                                placeholder={`Clue ${clue.clueNumber} (${clue.length})`}
                                value={clueTexts.across[clue.clueNumber] || ''}
                                onChange={(e) => {
                                    setClueTexts(prev => ({
                                        ...prev,
                                        across: {
                                            ...prev.across,
                                            [clue.clueNumber]: e.target.value,
                                        }
                                    }));
                                }}
                                style={{ width: '80%', padding: '5px' }}
                            />
                        </div>
                    ))}
                </div>


            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '30px' }}>
                <h3>Down Clues</h3>
                <div className='clue-list'>
                    {clues.down.count === 0 ? <p>No space for clues!</p> : [...clues.down.clues].sort((a, b) => a.clueNumber - b.clueNumber).map((clue, index) => (
                        <div key={`down-${index}`} id={`down-${clue.clueNumber}`} style={{ padding: '10px', display: 'flex', flexDirection: 'column', marginBottom: '5px', backgroundColor: direction === 'down' && currentClue === clue.clueNumber ? '#8ea46780' : '#fff' }}>
                            Clue {clue.clueNumber} ({clue.length})
                            <input
                                type="text"
                                id={`input-down-${clue.clueNumber}`}
                                placeholder={`Clue ${clue.clueNumber} (${clue.length})`}
                                value={clueTexts.down[clue.clueNumber] || ''}
                                onChange={(e) => {
                                    setClueTexts(prev => ({
                                        ...prev,
                                        down: {
                                            ...prev.down,
                                            [clue.clueNumber]: e.target.value,
                                        }
                                    }));
                                }}
                                style={{ width: '80%', padding: '5px' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const EndingPage = ({ puzzleKey }) => {
    console.log(puzzleKey)
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const puzzleLinkId = document.getElementById("crossword-link");
        if (!puzzleLinkId) return;
        navigator.clipboard.writeText(puzzleLinkId.innerText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="ending-overlay">
            <div className="ending-content">
                <h1>All done!</h1>
                <p className='ending-page-text'>Click the copy button to copy the below code block to your clipboard. Use this anywhere in your code to embed the puzzle into your website.</p>
                <div className="code-container">
                    <pre>
                        <code id='crossword-link'>{
                            `<iframe
    src="https://padth4i.github.io/projects/cruciverbalist/play/${puzzleKey}"
    width="1200px"
    height="540px"
    frameborder="0"
    style="border:1px solid #ccc; border-radius: 8px;">
</iframe>`
                        }</code>
                    </pre>
                    <button onClick={handleCopy}>
                        {copied ? <Check fontSize='small' /> : <ContentCopyIcon fontSize="small" />}
                    </button>
                </div>

                <p className='ending-page-text'>Happy puzzling!</p>
            </div>
        </div>
    );
};


export const PopupModal = ({ title, children, onClose }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="popup-close" onClick={onClose}>✕</button>
                {title && <h2 style={{ fontSize: '24px' }}>{title}</h2>}
                <div style={{ fontSize: '16px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};