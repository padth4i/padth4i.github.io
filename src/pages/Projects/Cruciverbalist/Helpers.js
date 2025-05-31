export const getCluesFromGrid = (grid) => {
    const rows = grid.length;
    const cols = grid[0].length;
    const clueNumbers = getClueNumbers(grid);

    const acrossClues = [];
    const downClues = [];

    for (let row = 0; row < rows; row++) {
        let col = 0;
        while (col < cols) {
            if (grid[row][col] !== '_') {
                const start = col;
                while (col < cols && grid[row][col] !== '_') {
                    col++;
                }
                const length = col - start;
                if (length >= 2) {
                    acrossClues.push({
                        row: row,
                        col: start,
                        clueNumber: clueNumbers[row][start],
                        length
                    });
                }
            } else {
                col++;
            }
        }
    }

    for (let col = 0; col < cols; col++) {
        let row = 0;
        while (row < rows) {
            if (grid[row][col] !== '_') {
                const start = row;
                while (row < rows && grid[row][col] !== '_') {
                    row++;
                }
                const length = row - start;
                if (length >= 2) {
                    downClues.push({
                        row: start,
                        col: col,
                        clueNumber: clueNumbers[start][col],
                        length
                    });
                }
            } else {
                row++;
            }
        }
    }

    return {
        across: {
            count: acrossClues.length,
            clues: acrossClues,
        },
        down: {
            count: downClues.length,
            clues: downClues,
        },
    };
}

export const getClueNumbers = (grid) => {
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

export const generateEmptyGrid = (rows, cols) => {
    return Array(rows).fill(null).map(() => Array(cols).fill(''));
};

export const getWordBounds = (grid, cell, direction) => {
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

export const getCurrentClueNumber = (grid, cell, direction) => {
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

export const flattenGrid = (grid) => {
    return {
        rows: grid.length,
        cols: grid[0].length,
        cells: grid.flat()
    };
};
