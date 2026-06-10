export function getMazeCellKey(c, r) {
    return `${c},${r}`;
}

export function parseMazeCellKey(key) {
    const [c, r] = String(key).split(',').map(Number);
    return { c, r };
}

export function getMazeCellByKey(grid, key) {
    const { c, r } = parseMazeCellKey(key);
    return grid?.[r]?.[c] || null;
}

export function getWalkableMazeNeighbors({
    grid,
    cols = grid?.[0]?.length || 0,
    rows = grid?.length || 0,
    c,
    r
} = {}) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const neighbors = [];
    for (const [dc, dr] of dirs) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc <= 0 || nr <= 0 || nc >= cols || nr >= rows) continue;
        const cell = grid?.[nr]?.[nc];
        if (cell && !cell.isWall) neighbors.push(cell);
    }
    return neighbors;
}

function canVisitMazeNeighbor({
    neighbor,
    target,
    avoidUnclearedHiddenRooms = false,
    allowedHiddenRoomId = null,
    getHiddenRoomById = () => null
}) {
    if (!avoidUnclearedHiddenRooms || !neighbor?.hiddenRoomId) return true;

    const hiddenRoom = getHiddenRoomById(neighbor.hiddenRoomId);
    const isTargetCell = neighbor.c === target.c && neighbor.r === target.r;
    const isAllowedRoom = hiddenRoom?.id && hiddenRoom.id === allowedHiddenRoomId;
    return !(hiddenRoom && !hiddenRoom.cleared && !isTargetCell && !isAllowedRoom);
}

export function computeMazePathBetween({
    grid,
    cols = grid?.[0]?.length || 0,
    rows = grid?.length || 0,
    start,
    target,
    avoidUnclearedHiddenRooms = false,
    allowedHiddenRoomId = null,
    getHiddenRoomById = () => null
} = {}) {
    const startKey = getMazeCellKey(start.c, start.r);
    const targetKey = getMazeCellKey(target.c, target.r);
    if (startKey === targetKey) return [];

    const queue = [{ c: start.c, r: start.r }];
    const visited = new Set([startKey]);
    const prev = new Map();

    while (queue.length > 0) {
        const curr = queue.shift();
        const neighbors = getWalkableMazeNeighbors({ grid, cols, rows, c: curr.c, r: curr.r });
        for (const neighbor of neighbors) {
            if (!canVisitMazeNeighbor({
                neighbor,
                target,
                avoidUnclearedHiddenRooms,
                allowedHiddenRoomId,
                getHiddenRoomById
            })) {
                continue;
            }

            const key = getMazeCellKey(neighbor.c, neighbor.r);
            if (visited.has(key)) continue;
            visited.add(key);
            prev.set(key, getMazeCellKey(curr.c, curr.r));
            if (key === targetKey) {
                const path = [];
                let cursor = key;
                while (cursor !== startKey) {
                    const { c, r } = parseMazeCellKey(cursor);
                    path.unshift({ c, r });
                    cursor = prev.get(cursor);
                    if (!cursor) return [];
                }
                return path;
            }
            queue.push({ c: neighbor.c, r: neighbor.r });
        }
    }

    return [];
}

export function buildMazeDistanceMap({
    grid,
    cols = grid?.[0]?.length || 0,
    rows = grid?.length || 0,
    start
} = {}) {
    const startKey = getMazeCellKey(start.c, start.r);
    const distances = new Map([[startKey, 0]]);
    const queue = [{ c: start.c, r: start.r }];

    while (queue.length > 0) {
        const curr = queue.shift();
        const currentKey = getMazeCellKey(curr.c, curr.r);
        const nextDistance = (distances.get(currentKey) || 0) + 1;
        const neighbors = getWalkableMazeNeighbors({ grid, cols, rows, c: curr.c, r: curr.r });
        for (const neighbor of neighbors) {
            const key = getMazeCellKey(neighbor.c, neighbor.r);
            if (distances.has(key)) continue;
            distances.set(key, nextDistance);
            queue.push({ c: neighbor.c, r: neighbor.r });
        }
    }

    return distances;
}
