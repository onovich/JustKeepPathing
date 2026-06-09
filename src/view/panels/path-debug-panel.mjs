export function countPathDebugRoutingStates(rooms = []) {
    return rooms.reduce((acc, room) => {
        const state = room.routingDebug?.state || 'pending';
        acc[state] = (acc[state] || 0) + 1;
        return acc;
    }, {});
}

export function countReachablePathDebugRooms(rooms = []) {
    return rooms.filter((room) => {
        const state = room.routingDebug?.state;
        return state === 'eligible' || state === 'selected';
    }).length;
}

export function countBlockedPathDebugRooms(rooms = []) {
    return rooms.filter((room) => {
        const state = room.routingDebug?.state;
        return state === 'path-missing' || state === 'room-unreachable' || state === 'exit-unreachable';
    }).length;
}

export class PathDebugPanel {
    constructor({ gameState, getController = () => null }) {
        this.gameState = gameState;
        this.getControllerRef = getController;
        this.modal = document.getElementById('path-debug-modal');
        this.summaryEl = document.getElementById('path-debug-summary');
        this.contextEl = document.getElementById('path-debug-context');
        this.roomCountEl = document.getElementById('path-debug-room-count');
        this.roomListEl = document.getElementById('path-debug-room-list');
        this.openButton = document.getElementById('btn-path-debug');
        this.closeButton = document.getElementById('btn-path-debug-close');
        this.isOpen = false;
        this.bindUi();
    }

    bindUi() {
        this.openButton?.addEventListener('click', (event) => {
            event.stopPropagation();
            this.open();
        });
        this.closeButton?.addEventListener('click', () => this.close());
        this.modal?.addEventListener('click', (event) => {
            if (event.target === this.modal || event.target.classList.contains('bg-black/55')) this.close();
        });
    }

    open() {
        this.isOpen = true;
        this.modal.classList.remove('hidden');
        this.render();
    }

    close() {
        this.isOpen = false;
        this.modal.classList.add('hidden');
    }

    getController() {
        return this.getControllerRef() || null;
    }

    getRooms() {
        const controller = this.getController();
        return Array.isArray(controller?.hiddenRooms) ? controller.hiddenRooms : [];
    }

    getTypeLabel(typeKey) {
        const labels = {
            treasure: 'Treasure',
            event: 'Event',
            trial: 'Trial',
            elite: 'Elite',
            rest: 'Rest',
            merchant: 'Merchant'
        };
        return labels[typeKey] || (typeKey ? typeKey[0].toUpperCase() + typeKey.slice(1) : 'Unknown');
    }

    getRoutingStateMeta(state) {
        const meta = {
            selected: { label: 'Selected', className: 'border-violet-700/70 bg-violet-500/10 text-violet-200' },
            eligible: { label: 'Eligible', className: 'border-emerald-700/70 bg-emerald-500/10 text-emerald-200' },
            'below-threshold': { label: 'Below Threshold', className: 'border-amber-700/70 bg-amber-500/10 text-amber-200' },
            locked: { label: 'Locked', className: 'border-slate-700 bg-slate-900 text-slate-400' },
            cleared: { label: 'Cleared', className: 'border-cyan-700/70 bg-cyan-500/10 text-cyan-200' },
            'path-missing': { label: 'Path Missing', className: 'border-rose-700/70 bg-rose-500/10 text-rose-200' },
            'room-unreachable': { label: 'Room Unreachable', className: 'border-rose-700/70 bg-rose-500/10 text-rose-200' },
            'exit-unreachable': { label: 'Exit Unreachable', className: 'border-rose-700/70 bg-rose-500/10 text-rose-200' },
            pending: { label: 'Pending', className: 'border-slate-700 bg-slate-900 text-slate-300' }
        };
        return meta[state] || meta.pending;
    }

    getGateSummary(room) {
        if (!room?.gateType) return 'Open';
        if (room.gateType === 'kills_this_floor') {
            const current = this.gameState.floorStats?.kills || 0;
            return `Kills ${current}/${room.gateThreshold}`;
        }
        return room.gateType;
    }

    formatNumber(value, digits = 2) {
        return Number.isFinite(value) ? value.toFixed(digits) : '--';
    }

    formatPercent(value) {
        return Number.isFinite(value) ? `${Math.round(value * 100)}%` : '--';
    }

    formatObjective(objective) {
        if (!objective || !Number.isFinite(objective.c) || !Number.isFinite(objective.r)) return '--';
        return `${objective.c}, ${objective.r}`;
    }

    renderSummaryCard(label, value, hint, accentClass = 'text-slate-100') {
        return `
            <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">${label}</div>
                <div class="mt-2 text-2xl font-black ${accentClass}">${value}</div>
                <div class="mt-1 text-[11px] leading-5 text-slate-400">${hint}</div>
            </div>
        `;
    }

    renderMetric(label, value, accentClass = 'text-slate-100') {
        return `
            <div class="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
                <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">${label}</div>
                <div class="mt-1 text-sm font-black ${accentClass}">${value}</div>
            </div>
        `;
    }

    renderFlag(label, active, trueClass, falseClass = 'border-slate-700 bg-slate-950 text-slate-500') {
        return `<span class="rounded-md border px-2 py-1 text-[10px] font-black ${active ? trueClass : falseClass}">${label}</span>`;
    }

    renderContext(controller, rooms, threshold, selectedRoom) {
        const hpRatio = this.gameState.player.currentHp / Math.max(1, this.gameState.player.baseHp);
        const selectedLabel = controller?.currentPathTarget === 'end'
            ? 'Exit'
            : selectedRoom?.displayName || controller?.currentPathTarget || 'None';
        const supplyLabel = this.gameState.floorBuff?.supplyActive
            ? this.gameState.floorBuff?.supplyLabel || this.getTypeLabel(this.gameState.floorBuff?.supplyKey)
            : 'None';
        const strategy = [
            `risk=${this.gameState.autoStrategy.risk}`,
            `rest=${this.gameState.autoStrategy.rest}`,
            `merchant=${this.gameState.autoStrategy.merchant}`,
            `supply=${this.gameState.autoStrategy.supply}`
        ].join(' | ');
        const roomStates = countPathDebugRoutingStates(rooms);
        const stateLine = Object.entries(roomStates)
            .map(([state, count]) => `${this.getRoutingStateMeta(state).label}: ${count}`)
            .join(' | ') || 'No routing data yet';

        this.contextEl.innerHTML = `
            <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div class="min-w-0">
                    <div class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Run Context</div>
                    <div class="mt-2 text-sm font-bold text-slate-100">Current target: <span class="text-violet-200">${selectedLabel}</span></div>
                    <div class="mt-2 text-[11px] leading-5 text-slate-400">${strategy}</div>
                    <div class="mt-1 text-[11px] leading-5 text-slate-500">${stateLine}</div>
                </div>
                <div class="grid grid-cols-2 gap-2 xl:w-[360px]">
                    ${this.renderMetric('HP Ratio', this.formatPercent(hpRatio), 'text-emerald-200')}
                    ${this.renderMetric('Supply', supplyLabel, 'text-cyan-200')}
                    ${this.renderMetric('Kills', String(this.gameState.floorStats?.kills || 0), 'text-rose-200')}
                    ${this.renderMetric('Cleared Rooms', `${this.gameState.floorStats?.hiddenRoomsCleared || 0}/${rooms.length}`, 'text-amber-200')}
                </div>
            </div>
        `;
    }

    renderRoomCard(room, isSelected) {
        const debug = room.routingDebug || {};
        const stateMeta = this.getRoutingStateMeta(debug.state || 'pending');
        const roomAccent = {
            treasure: 'text-amber-200',
            event: 'text-cyan-200',
            trial: 'text-rose-200',
            elite: 'text-violet-200',
            rest: 'text-emerald-200',
            merchant: 'text-sky-200'
        }[room.typeKey] || 'text-slate-100';
        const seedLabel = room.eventSeed?.label || room.trialSeed?.label || room.rewardProfile?.label || '';
        const selectionBadge = isSelected
            ? '<span class="rounded-md border border-violet-700/70 bg-violet-500/15 px-2 py-1 text-[10px] font-black text-violet-200">Current Target</span>'
            : '';

        return `
            <article class="rounded-2xl border ${isSelected ? 'border-violet-700/80 bg-violet-950/15' : 'border-slate-800 bg-slate-950/60'} p-4">
                <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <h4 class="text-sm font-black ${roomAccent}">${room.displayName}</h4>
                            <span class="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-black text-slate-300">${this.getTypeLabel(room.typeKey)}</span>
                            <span class="rounded-md border px-2 py-1 text-[10px] font-black ${stateMeta.className}">${stateMeta.label}</span>
                            ${selectionBadge}
                        </div>
                        <div class="mt-2 text-[11px] leading-5 text-slate-400">
                            Gate: ${this.getGateSummary(room)} | Objective: ${this.formatObjective(debug.objective)}
                            ${seedLabel ? ` | Variant: ${seedLabel}` : ''}
                        </div>
                        <div class="mt-3 flex flex-wrap gap-2">
                            ${this.renderFlag('Generated', true, 'border-emerald-700/70 bg-emerald-500/10 text-emerald-200')}
                            ${this.renderFlag('Unlocked', !!room.unlocked, 'border-cyan-700/70 bg-cyan-500/10 text-cyan-200')}
                            ${this.renderFlag('Entered', !!room.entered, 'border-amber-700/70 bg-amber-500/10 text-amber-200')}
                            ${this.renderFlag('Cleared', !!room.cleared, 'border-violet-700/70 bg-violet-500/10 text-violet-200')}
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 xl:w-[360px]">
                        ${this.renderMetric('Base Access', this.formatNumber(room.accessScore, 3), 'text-slate-100')}
                        ${this.renderMetric('Final Score', this.formatNumber(debug.finalScore, 3), isSelected ? 'text-violet-200' : 'text-slate-100')}
                        ${this.renderMetric('Threshold', this.formatNumber(debug.threshold, 3), 'text-amber-200')}
                        ${this.renderMetric('Detour', this.formatNumber(debug.detourExtra, 2), 'text-rose-200')}
                        ${this.renderMetric('To Room', this.formatNumber(debug.pathToRoomLength, 0), 'text-cyan-200')}
                        ${this.renderMetric('To Exit', this.formatNumber(debug.pathRoomToExitLength, 0), 'text-cyan-200')}
                    </div>
                </div>
            </article>
        `;
    }

    render() {
        if (!this.summaryEl || !this.contextEl || !this.roomListEl || !this.roomCountEl) return;
        const controller = this.getController();
        const rooms = this.getRooms();
        const threshold = this.gameState.getDiversionThreshold();
        const selectedRoom = rooms.find((room) => room.id === controller?.currentPathTarget) || null;
        const reachableRooms = countReachablePathDebugRooms(rooms);
        const blockedRooms = countBlockedPathDebugRooms(rooms);

        this.summaryEl.innerHTML = [
            this.renderSummaryCard('Diversion Threshold', this.formatNumber(threshold, 3), 'Current minimum score to take a detour.', 'text-amber-200'),
            this.renderSummaryCard('Direct Exit Path', controller ? String(controller.lastDirectExitPathLength || 0) : '--', 'Path length when ignoring hidden-room detours.', 'text-cyan-200'),
            this.renderSummaryCard('Reachable Candidates', `${reachableRooms}/${rooms.length}`, 'Rooms that passed current routing checks.', 'text-emerald-200'),
            this.renderSummaryCard('Blocked Rooms', `${blockedRooms}`, 'Rooms missing a valid in-and-out route.', 'text-rose-200')
        ].join('');

        this.renderContext(controller, rooms, threshold, selectedRoom);
        this.roomCountEl.innerText = `${rooms.length} room${rooms.length === 1 ? '' : 's'}`;
        this.roomListEl.innerHTML = rooms.length > 0
            ? rooms.map((room) => this.renderRoomCard(room, room.id === controller?.currentPathTarget)).join('')
            : '<div class="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-6 text-center text-sm font-bold text-slate-500">No hidden rooms were generated on this floor yet.</div>';
    }
}
