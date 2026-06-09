import {
    EVENT_ROOM_SEEDS,
    FLOOR_THEME_DEFS,
    TRIAL_ROOM_SEEDS
} from '../../data/floor-content.mjs';
import { RELIC_DEFS } from '../../data/relics.mjs';

function getRoomSeedEffectSummary(effect) {
    const summaryMap = {
        heal_or_shield: 'heal and stabilize this floor',
        score_now_risk_next_floor: 'gain score now, add later risk',
        next_floor_hidden_room_bonus: 'raise next-floor hidden room odds',
        power_up_with_penalty: 'trade HP for attack',
        chest_density_boost: 'increase later chest density',
        monster_density_boost: 'increase enemy density for more power',
        repair_and_guard: 'heal and reduce incoming damage',
        supply_stockpile: 'restock the most-needed floor supply',
        assault_cache: 'combat-heavy supply reward',
        salvage_cache: 'resource-heavy supply reward',
        survey: 'improve next-floor scouting',
        repair_loop: 'steady healing trial',
        attack_overdrive: 'preheat next-floor attack',
        guard_cache: 'heal, guard, and resupply'
    };
    return summaryMap[effect] || 'special effect';
}

export class CollectionPanel {
    constructor({ gameState }) {
        this.gameState = gameState;
        this.modal = document.getElementById('collection-modal');
        this.summaryEl = document.getElementById('collection-summary');
        this.eventCountEl = document.getElementById('collection-event-count');
        this.trialCountEl = document.getElementById('collection-trial-count');
        this.metaCountEl = document.getElementById('collection-meta-count');
        this.eventListEl = document.getElementById('collection-event-list');
        this.trialListEl = document.getElementById('collection-trial-list');
        this.relicListEl = document.getElementById('collection-relic-list');
        this.bossListEl = document.getElementById('collection-boss-list');
        this.openButton = document.getElementById('btn-collection');
        this.closeButton = document.getElementById('btn-collection-close');
        this.isOpen = false;
        this.bindUi();
        this.render();
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

    getBossMechanicSummary(mechanicKey) {
        const summaryMap = {
            heat_ramp: 'ramps damage over time',
            salvage_repair: 'slowly repairs itself',
            signal_jam: 'suppresses your output',
            seal_layers: 'starts with layered shields'
        };
        return summaryMap[mechanicKey] || 'finale mechanic';
    }

    renderSummaryCard(label, found, total, accentClass) {
        return `
            <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">${label}</div>
                <div class="mt-2 flex items-end justify-between">
                    <div class="text-2xl font-black ${accentClass}">${found}</div>
                    <div class="text-xs font-bold text-slate-400">/ ${total}</div>
                </div>
            </div>
        `;
    }

    renderDiscoveryItem({ label, subtitle, found, accentClass = 'text-cyan-200' }) {
        return `
            <article class="rounded-xl border ${found ? 'border-slate-700 bg-slate-950/70' : 'border-slate-800 bg-slate-950/35 opacity-70'} p-3">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <div class="text-sm font-bold ${found ? accentClass : 'text-slate-500'}">${label}</div>
                        <div class="mt-1 text-[11px] leading-5 ${found ? 'text-slate-300' : 'text-slate-500'}">${subtitle}</div>
                    </div>
                    <span class="shrink-0 rounded-md border px-2 py-1 text-[10px] font-black ${found ? 'border-emerald-700/70 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900 text-slate-500'}">${found ? 'Found' : 'Hidden'}</span>
                </div>
            </article>
        `;
    }

    renderSeedList(defs, foundIds, accentClass) {
        const sortedDefs = [...defs].sort((a, b) => {
            const aFound = foundIds.includes(a.id) ? 0 : 1;
            const bFound = foundIds.includes(b.id) ? 0 : 1;
            if (aFound !== bFound) return aFound - bFound;
            return (a.minLevel || 0) - (b.minLevel || 0);
        });
        return sortedDefs.map((def) => this.renderDiscoveryItem({
            label: def.label,
            subtitle: `${getRoomSeedEffectSummary(def.effect)} · Lv.${def.minLevel || 1}+`,
            found: foundIds.includes(def.id),
            accentClass
        })).join('');
    }

    renderRelicList() {
        const foundIds = this.gameState.collection.relics;
        const sortedDefs = [...RELIC_DEFS].sort((a, b) => {
            const aFound = foundIds.includes(a.id) ? 0 : 1;
            const bFound = foundIds.includes(b.id) ? 0 : 1;
            if (aFound !== bFound) return aFound - bFound;
            return (a.minLevel || 0) - (b.minLevel || 0);
        });
        return sortedDefs.map((def) => this.renderDiscoveryItem({
            label: def.label,
            subtitle: def.summary || def.shortLabel || 'relic effect',
            found: foundIds.includes(def.id),
            accentClass: 'text-amber-200'
        })).join('');
    }

    renderBossList() {
        const foundIds = this.gameState.collection.finaleBosses;
        const bossDefs = Object.entries(FLOOR_THEME_DEFS)
            .filter(([, theme]) => theme?.finale?.bossMod?.name)
            .map(([themeKey, theme]) => ({
                id: themeKey,
                label: theme.finale.bossMod.name,
                subtitle: `${theme.label} · ${theme.finale.label} · ${this.getBossMechanicSummary(theme.finale.bossMod.bossMechanic?.key)}`
            }))
            .sort((a, b) => {
                const aFound = foundIds.includes(a.id) ? 0 : 1;
                const bFound = foundIds.includes(b.id) ? 0 : 1;
                if (aFound !== bFound) return aFound - bFound;
                return a.label.localeCompare(b.label, 'zh-CN');
            });
        return bossDefs.map((def) => this.renderDiscoveryItem({
            label: def.label,
            subtitle: def.subtitle,
            found: foundIds.includes(def.id),
            accentClass: 'text-fuchsia-200'
        })).join('');
    }

    render() {
        if (!this.summaryEl) return;
        const progress = this.gameState.getCollectionProgress();
        this.summaryEl.innerHTML = [
            this.renderSummaryCard('Event Seeds', progress.eventRoomSeeds.found, progress.eventRoomSeeds.total, 'text-cyan-200'),
            this.renderSummaryCard('Trial Seeds', progress.trialRoomSeeds.found, progress.trialRoomSeeds.total, 'text-rose-200'),
            this.renderSummaryCard('Relics', progress.relics.found, progress.relics.total, 'text-amber-200'),
            this.renderSummaryCard('Finale Bosses', progress.finaleBosses.found, progress.finaleBosses.total, 'text-fuchsia-200')
        ].join('');
        this.eventCountEl.innerText = `${progress.eventRoomSeeds.found}/${progress.eventRoomSeeds.total}`;
        this.trialCountEl.innerText = `${progress.trialRoomSeeds.found}/${progress.trialRoomSeeds.total}`;
        this.metaCountEl.innerText = `${progress.relics.found + progress.finaleBosses.found}/${progress.relics.total + progress.finaleBosses.total}`;
        this.eventListEl.innerHTML = this.renderSeedList(EVENT_ROOM_SEEDS, this.gameState.collection.eventRoomSeeds, 'text-cyan-200');
        this.trialListEl.innerHTML = this.renderSeedList(TRIAL_ROOM_SEEDS, this.gameState.collection.trialRoomSeeds, 'text-rose-200');
        this.relicListEl.innerHTML = this.renderRelicList();
        this.bossListEl.innerHTML = this.renderBossList();
    }
}
