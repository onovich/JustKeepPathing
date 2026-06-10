import assert from 'node:assert/strict';
import {
    buildMazeDistanceMap,
    computeMazePathBetween,
    getMazeCellByKey,
    getMazeCellKey,
    getWalkableMazeNeighbors,
    parseMazeCellKey
} from '../src/logic/maze-navigation.mjs';

function createGrid(rows) {
    return rows.map((row, r) => row.split('').map((char, c) => ({
        c,
        r,
        isWall: char === '#',
        hiddenRoomId: null
    })));
}

const grid = createGrid([
    '#####',
    '#...#',
    '###.#',
    '#...#',
    '#####'
]);
const cols = grid[0].length;
const rows = grid.length;

assert.equal(getMazeCellKey(2, 3), '2,3');
assert.deepEqual(parseMazeCellKey('2,3'), { c: 2, r: 3 });
assert.equal(getMazeCellByKey(grid, '3,1'), grid[1][3]);
assert.equal(getMazeCellByKey(grid, '9,9'), null);

assert.deepEqual(
    getWalkableMazeNeighbors({ grid, cols, rows, c: 3, r: 1 }).map((cell) => getMazeCellKey(cell.c, cell.r)),
    ['2,1', '3,2']
);
assert.deepEqual(
    getWalkableMazeNeighbors({ grid, cols, rows, c: 1, r: 1 }).map((cell) => getMazeCellKey(cell.c, cell.r)),
    ['2,1']
);

assert.deepEqual(
    computeMazePathBetween({
        grid,
        cols,
        rows,
        start: { c: 1, r: 1 },
        target: { c: 1, r: 3 }
    }),
    [
        { c: 2, r: 1 },
        { c: 3, r: 1 },
        { c: 3, r: 2 },
        { c: 3, r: 3 },
        { c: 2, r: 3 },
        { c: 1, r: 3 }
    ]
);

assert.deepEqual(
    computeMazePathBetween({
        grid,
        cols,
        rows,
        start: { c: 1, r: 1 },
        target: { c: 1, r: 1 }
    }),
    []
);
assert.deepEqual(
    computeMazePathBetween({
        grid,
        cols,
        rows,
        start: { c: 1, r: 1 },
        target: { c: 1, r: 2 }
    }),
    []
);

{
    const hiddenGrid = createGrid([
        '#####',
        '#...#',
        '#####'
    ]);
    hiddenGrid[1][2].hiddenRoomId = 'room-a';
    const hiddenRooms = new Map([['room-a', { id: 'room-a', cleared: false }]]);

    assert.deepEqual(
        computeMazePathBetween({
            grid: hiddenGrid,
            cols: hiddenGrid[0].length,
            rows: hiddenGrid.length,
            start: { c: 1, r: 1 },
            target: { c: 3, r: 1 },
            avoidUnclearedHiddenRooms: true,
            getHiddenRoomById: (roomId) => hiddenRooms.get(roomId) || null
        }),
        [],
        'uncleared hidden rooms should block transit when not allowed'
    );
    assert.deepEqual(
        computeMazePathBetween({
            grid: hiddenGrid,
            cols: hiddenGrid[0].length,
            rows: hiddenGrid.length,
            start: { c: 1, r: 1 },
            target: { c: 3, r: 1 },
            avoidUnclearedHiddenRooms: true,
            allowedHiddenRoomId: 'room-a',
            getHiddenRoomById: (roomId) => hiddenRooms.get(roomId) || null
        }),
        [
            { c: 2, r: 1 },
            { c: 3, r: 1 }
        ],
        'allowed hidden rooms should stay passable'
    );
    assert.deepEqual(
        computeMazePathBetween({
            grid: hiddenGrid,
            cols: hiddenGrid[0].length,
            rows: hiddenGrid.length,
            start: { c: 1, r: 1 },
            target: { c: 2, r: 1 },
            avoidUnclearedHiddenRooms: true,
            getHiddenRoomById: (roomId) => hiddenRooms.get(roomId) || null
        }),
        [{ c: 2, r: 1 }],
        'target cell should remain reachable even inside an uncleared hidden room'
    );
}

{
    const distances = buildMazeDistanceMap({
        grid,
        cols,
        rows,
        start: { c: 1, r: 1 }
    });
    assert.equal(distances.get('1,1'), 0);
    assert.equal(distances.get('3,1'), 2);
    assert.equal(distances.get('1,3'), 6);
    assert.equal(distances.has('1,2'), false);
}

console.log('maze-navigation checks passed');
