const HIDDEN_ROOM_INTERACTION_ACCENTS = Object.freeze({
    event: Object.freeze({ color: 0xc084fc, textColor: '#c084fc' }),
    elite: Object.freeze({ color: 0x38bdf8, textColor: '#38bdf8' }),
    rest: Object.freeze({ color: 0x34d399, textColor: '#34d399' }),
    merchant: Object.freeze({ color: 0xf59e0b, textColor: '#f59e0b' }),
    trial: Object.freeze({ color: 0xfb7185, textColor: '#fb7185' }),
    treasure: Object.freeze({ color: 0xfacc15, textColor: '#facc15' })
});

export function getHiddenRoomInteractionAccent(typeKey) {
    return HIDDEN_ROOM_INTERACTION_ACCENTS[typeKey] || HIDDEN_ROOM_INTERACTION_ACCENTS.treasure;
}

export function shouldClearHiddenRoomAfterInteraction(room) {
    if (!room) return false;
    return (room.typeKey === 'treasure' && !(room.pendingCacheIds?.length > 0))
        || (room.typeKey === 'event' && !(room.pendingEventNodeIds?.length > 0))
        || (room.typeKey === 'trial' && !(room.pendingTrialNodeIds?.length > 0))
        || room.typeKey === 'rest'
        || room.typeKey === 'merchant';
}

export function removePendingHiddenRoomEntity({
    pendingIds = [],
    entities = [],
    entity
}) {
    return {
        pendingIds: pendingIds.filter((entityId) => entityId !== entity?.id),
        entities: entities.filter((item) => item !== entity)
    };
}

export function removeHiddenRoomEntityReference(entities = [], entity) {
    const entityIndex = entities.findIndex((item) => item === entity);
    if (entityIndex < 0) return false;
    entities.splice(entityIndex, 1);
    return true;
}
