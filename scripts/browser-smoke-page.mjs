export async function browserSmoke() {
  const waitFor = (predicate, timeoutMs = 12000, label = 'app readiness') => new Promise((resolve, reject) => {
    const started = performance.now();
    const tick = () => {
      try {
        if (predicate()) {
          resolve();
          return;
        }
      } catch {}
      if (performance.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${label}.`));
        return;
      }
      setTimeout(tick, 100);
    };
    tick();
  });

  await waitFor(() => window.gameController && window.engine && window.GameState && document.querySelector('#webgl-canvas'), 12000, 'app readiness');
  await new Promise((resolve) => setTimeout(resolve, 900));

  const overlay = document.getElementById('app-loading-overlay');
  const overlayStyle = overlay ? getComputedStyle(overlay) : null;
  const overlayHidden = !!overlay && (
    overlay.classList.contains('hidden-overlay')
    || overlay.classList.contains('hidden')
    || overlayStyle.pointerEvents === 'none'
    || Number(overlayStyle.opacity) === 0
  );
  const overlayTitle = document.getElementById('app-loading-title');
  const overlayDetail = document.getElementById('app-loading-detail');
  const overlayStage = document.getElementById('app-loading-stage');
  const generationOverlayTitle = 'Delayed generation smoke';
  const generationOverlayDetail = 'Slow generation text appears after delay.';
  const generationOverlayStage = 'Smoke slow path';
  let generationOverlayHiddenBeforeDelay = false;
  let generationOverlayShownAfterDelay = false;
  let generationOverlayText = '';
  let generationOverlayHiddenAfterClear = false;
  if (!overlay || !overlayTitle || !overlayDetail || !overlayStage || !window.gameController?.scheduleGenerationLoading) {
    throw new Error('Generation loading overlay controls are missing.');
  }
  const savedPhase = window.GameState.phase;
  const savedSelfTestActive = window.gameController.selfTestActive;
  const savedGenerationVisible = window.gameController.generationLoadingVisible;
  const savedGenerationProgress = window.gameController.generationProgress;
  const savedGenerationSnapshot = { ...window.gameController.generationLoadingSnapshot };
  try {
    window.gameController.selfTestActive = false;
    window.GameState.phase = 'GENERATING';
    window.gameController.setGenerationLoading(0.37, generationOverlayDetail, generationOverlayStage, generationOverlayTitle);
    window.gameController.scheduleGenerationLoading(120);
    await new Promise((resolve) => setTimeout(resolve, 40));
    generationOverlayHiddenBeforeDelay = overlay.classList.contains('hidden-overlay');
    await waitFor(() => !overlay.classList.contains('hidden-overlay'), 1000, 'delayed generation overlay');
    generationOverlayShownAfterDelay = !overlay.classList.contains('hidden-overlay');
    generationOverlayText = [
      overlayTitle.textContent || overlayTitle.innerText || '',
      overlayDetail.textContent || overlayDetail.innerText || '',
      overlayStage.textContent || overlayStage.innerText || ''
    ].join(' | ');
    window.gameController.clearGenerationLoadingState(0);
    await waitFor(() => overlay.classList.contains('hidden-overlay'), 1000, 'generation overlay cleanup');
    generationOverlayHiddenAfterClear = overlay.classList.contains('hidden-overlay');
  } finally {
    window.gameController.clearGenerationLoadingState?.(0);
    window.GameState.phase = savedPhase;
    window.gameController.selfTestActive = savedSelfTestActive;
    window.gameController.generationLoadingVisible = savedGenerationVisible;
    window.gameController.generationProgress = savedGenerationProgress;
    window.gameController.generationLoadingSnapshot = savedGenerationSnapshot;
  }

  const cloneJson = (value) => JSON.parse(JSON.stringify(value));
  const runEchoEngineEventSmoke = () => {
    if (!window.gameController?.resolveEventRoomV2 || !window.GameState?.meta) {
      throw new Error('Echo Engine event smoke dependencies are missing.');
    }
    const state = window.GameState;
    const controller = window.gameController;
    const saved = {
      score: state.score,
      player: { ...state.player },
      maze: { ...state.maze },
      meta: { ...state.meta },
      items: cloneJson(state.items || {}),
      floorBuff: { ...state.floorBuff },
      floorContent: state.floorContent,
      runRelics: Array.isArray(state.runRelics) ? [...state.runRelics] : [],
      floorPlan: controller.floorPlan
    };
    const echoRoom = {
      displayName: 'Echo Smoke Event',
      rewardTier: 2,
      rewardProfile: { chestBonus: 2, scoreMult: 1.1, repairValue: 0.1 },
      eventSeed: { label: 'Echo Smoke Seed', effect: 'score_now_risk_next_floor', rewardMult: 1 },
      eventCharge: 2
    };
    try {
      state.runRelics = [...new Set([...saved.runRelics, 'echo_engine'])];
      state.meta.nextFloorAttackBonus = 0.04;
      state.floorContent = { themeKey: null, archetypeKey: 'event', hiddenRooms: [] };
      controller.floorPlan = { themeKey: null, theme: null };

      const before = state.meta.nextFloorAttackBonus;
      const message = controller.resolveEventRoomV2(echoRoom);
      const after = state.meta.nextFloorAttackBonus;
      return {
        before,
        after,
        message,
        applied: after > before && message.includes('Echo Engine preheated next-floor attack')
      };
    } finally {
      state.score = saved.score;
      state.player = saved.player;
      state.maze = saved.maze;
      state.meta = saved.meta;
      state.items = saved.items;
      state.floorBuff = saved.floorBuff;
      state.floorContent = saved.floorContent;
      state.runRelics = saved.runRelics;
      controller.floorPlan = saved.floorPlan;
      state.updateUI?.();
    }
  };
  const echoEngineEventSmoke = runEchoEngineEventSmoke();

  const runConsecutiveRunRelicSmoke = () => {
    if (!window.GameState?.rollRelicReward) {
      throw new Error('Run relic smoke dependencies are missing.');
    }
    const state = window.GameState;
    const saved = {
      level: state.level,
      score: state.score,
      relicSlots: state.relicSlots,
      runRelics: Array.isArray(state.runRelics) ? [...state.runRelics] : [],
      collection: cloneJson(state.collection || {}),
      collectionStorage: window.localStorage.getItem(state.collectionStorageKey),
      random: Math.random
    };
    const deterministicRandomValues = [0, 0, 0, 0, 0, 0, 0, 0];
    let randomIndex = 0;
    const nextDeterministicRandom = () => deterministicRandomValues[randomIndex++] ?? 0;
    try {
      Math.random = nextDeterministicRandom;
      state.level = 3;
      state.score = 0;
      state.relicSlots = 3;
      state.runRelics = [];
      const eliteAdded = state.rollRelicReward({
        source: 'elite',
        themeKey: null,
        rewardTier: 3,
        guaranteed: true
      });
      const bossAdded = state.rollRelicReward({
        source: 'boss',
        themeKey: null,
        rewardTier: 3,
        guaranteed: true
      });
      const addedRelics = [...state.runRelics];
      const addedUniqueCount = new Set(addedRelics).size;

      state.score = 0;
      state.relicSlots = 1;
      state.runRelics = [];
      const singleSlotFirst = state.rollRelicReward({
        source: 'elite',
        themeKey: null,
        rewardTier: 3,
        guaranteed: true
      });
      const singleSlotSecond = state.rollRelicReward({
        source: 'boss',
        themeKey: null,
        rewardTier: 3,
        guaranteed: true
      });

      return {
        addedStatuses: [eliteAdded.status, bossAdded.status],
        addedRelics,
        addedUniqueCount,
        singleSlotStatuses: [singleSlotFirst.status, singleSlotSecond.status],
        singleSlotRelics: [...state.runRelics],
        singleSlotBonusScore: singleSlotSecond.bonusScore || 0,
        singleSlotScore: state.score
      };
    } finally {
      Math.random = saved.random;
      state.level = saved.level;
      state.score = saved.score;
      state.relicSlots = saved.relicSlots;
      state.runRelics = saved.runRelics;
      state.collection = saved.collection;
      if (saved.collectionStorage === null) {
        window.localStorage.removeItem(state.collectionStorageKey);
      } else {
        window.localStorage.setItem(state.collectionStorageKey, saved.collectionStorage);
      }
      state.updateUI?.();
    }
  };
  const consecutiveRunRelicSmoke = runConsecutiveRunRelicSmoke();

  const runRoomCompletionSmoke = () => {
    const controller = window.gameController;
    const state = window.GameState;
    if (!controller?.resolveRestRoom || !controller?.resolveMerchantRoom || !controller?.resolveTrialRoomV2 || !controller?.finalizeHiddenRoomRewardResolution) {
      throw new Error('Room completion smoke dependencies are missing.');
    }
    const saved = {
      level: state.level,
      score: state.score,
      player: { ...state.player },
      maze: { ...state.maze },
      meta: { ...state.meta },
      items: cloneJson(state.items || {}),
      floorBuff: { ...state.floorBuff },
      floorRuntime: { ...state.floorRuntime },
      floorContent: state.floorContent,
      autoStrategy: { ...state.autoStrategy },
      floorPlan: controller.floorPlan
    };
    const baseRewardProfile = { chestBonus: 2, scoreMult: 1.1, repairValue: 0.1 };
    const salvageTheme = {
      themeKey: 'salvage_reaches',
      theme: { accentColor: '#facc15', directive: { label: 'Smoke Salvage Theme' } }
    };
    try {
      state.level = 3;
      state.score = 0;
      state.player = {
        ...saved.player,
        baseHp: 120,
        currentHp: 42,
        baseAtk: 18
      };
      state.maze = {
        ...saved.maze,
        lvSize: 1,
        lvChest: 1,
        baseChestRate: 0.05,
        baseMonsterRate: 0.03
      };
      state.meta = { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 };
      state.items = { supplies: { assault: 0, salvage: 0, scout: 0 } };
      state.floorBuff = {
        ...saved.floorBuff,
        supplyActive: false,
        supplyKey: null,
        supplyLabel: null,
        incomingDamageMult: 1,
        chestRewardMult: 1,
        supplyDropBonus: 0,
        attackMult: 1,
        moveSpeedMult: 1,
        bossRewardMult: 1,
        monsterSpawnMult: 1,
        monsterRewardMult: 1,
        hiddenRoomBonus: 0,
        diversionBonus: 0
      };
      state.floorRuntime = { reflexShieldReady: false };
      state.autoStrategy = { risk: 'balanced', rest: 'balanced', merchant: 'power', supply: 'balanced' };
      state.floorContent = { themeKey: null, archetypeKey: 'combat', hiddenRooms: [] };
      controller.floorPlan = { themeKey: null, theme: null };

      const restMessage = controller.resolveRestRoom({
        id: 'smoke-rest',
        displayName: 'Smoke Rest Room',
        rewardTier: 2,
        rewardProfile: baseRewardProfile
      });
      const restRecoveredHp = state.player.currentHp > 42;
      const restAddedSupply = state.items.supplies.salvage > 0;

      state.score = 0;
      state.meta.nextHiddenRoomBonus = 0;
      state.items = { supplies: { assault: 0, salvage: 0, scout: 0 } };
      const merchantMessage = controller.resolveMerchantRoom({
        id: 'smoke-merchant',
        displayName: 'Smoke Merchant Room',
        rewardTier: 2,
        rewardProfile: baseRewardProfile
      });
      const merchantImprovedIntel = state.meta.nextHiddenRoomBonus > 0;

      state.score = 0;
      state.items = { supplies: { assault: 0, salvage: 0, scout: 0 } };
      state.meta.nextFloorAttackBonus = 0;
      state.player.baseAtk = 18;
      const trialRoom = {
        id: 'smoke-trial',
        displayName: 'Smoke Trial Room',
        rewardTier: 3,
        rewardProfile: baseRewardProfile,
        trialSeed: { label: 'Smoke Trial Seed', effect: 'attack_overdrive', rewardMult: 1 },
        trialCharge: 2,
        trialBonusSupply: null
      };
      const trialMessage = controller.resolveTrialRoomV2(trialRoom);
      const trialBoostedAttack = state.player.baseAtk > 18 && state.meta.nextFloorAttackBonus > 0;
      const trialAddedSupply = trialRoom.trialBonusSupply === 'assault' && state.items.supplies.assault > 0;

      state.score = 0;
      state.items = { supplies: { assault: 0, salvage: 0, scout: 0 } };
      state.floorContent = { ...salvageTheme, archetypeKey: 'treasure', hiddenRooms: [] };
      controller.floorPlan = salvageTheme;
      const treasureMessage = controller.finalizeHiddenRoomRewardResolution(
        'treasure',
        {
          id: 'smoke-treasure',
          displayName: 'Smoke Treasure Room',
          rewardTier: 2
        },
        ''
      );
      const treasureThemeApplied = treasureMessage.length > 0
        && state.score > 0
        && state.items.supplies.salvage > 0;

      return {
        restMessage,
        restRecoveredHp,
        restAddedSupply,
        merchantMessage,
        merchantImprovedIntel,
        trialMessage,
        trialBoostedAttack,
        trialAddedSupply,
        treasureMessage,
        treasureThemeApplied
      };
    } finally {
      state.level = saved.level;
      state.score = saved.score;
      state.player = saved.player;
      state.maze = saved.maze;
      state.meta = saved.meta;
      state.items = saved.items;
      state.floorBuff = saved.floorBuff;
      state.floorRuntime = saved.floorRuntime;
      state.floorContent = saved.floorContent;
      state.autoStrategy = saved.autoStrategy;
      controller.floorPlan = saved.floorPlan;
      state.updateUI?.();
    }
  };
  const roomCompletionSmoke = runRoomCompletionSmoke();

  const runEliteRoomClearSmoke = async () => {
    const controller = window.gameController;
    const state = window.GameState;
    if (!controller?.resolveHiddenEliteRoomClear) {
      throw new Error('Elite room clear smoke dependencies are missing.');
    }
    const engine = controller.engine;
    const createSmokeVector = (x = 0, y = 0, z = 0) => ({
      x,
      y,
      z,
      clone() {
        return createSmokeVector(this.x, this.y, this.z);
      },
      add(vector = {}) {
        this.x += vector.x || 0;
        this.y += vector.y || 0;
        this.z += vector.z || 0;
        return this;
      }
    });
    const saved = {
      level: state.level,
      score: state.score,
      player: { ...state.player },
      maze: { ...state.maze },
      meta: { ...state.meta },
      items: cloneJson(state.items || {}),
      floorBuff: { ...state.floorBuff },
      floorRuntime: { ...state.floorRuntime },
      floorContent: state.floorContent,
      floorStats: { ...state.floorStats },
      runRelics: Array.isArray(state.runRelics) ? [...state.runRelics] : [],
      collection: cloneJson(state.collection || {}),
      collectionStorage: window.localStorage.getItem(state.collectionStorageKey),
      grid: controller.grid,
      floorPlan: controller.floorPlan,
      engineEntities: Array.isArray(engine?.entities) ? engine.entities : null,
      random: Math.random,
      sleep: controller.sleep,
      typeText: controller.typeText,
      spawnBurst: engine?.spawnBurst,
      addFloatingText: engine?.addFloatingText,
      sceneRemove: engine?.scene?.remove,
      soundUpgrade: window.soundEngine?.upgrade
    };
    const calls = {
      bursts: 0,
      floatingTexts: [],
      removedMeshes: 0,
      typedText: '',
      upgrades: 0
    };
    const markerMesh = { id: 'smoke-elite-marker-mesh', position: createSmokeVector(1, 0, 1) };
    const enemyMesh = { id: 'smoke-elite-enemy-mesh', position: createSmokeVector(2, 0, 2) };
    const room = {
      id: 'smoke-elite-clear-room',
      displayName: 'Smoke Elite Room',
      typeKey: 'elite',
      rewardTier: 3,
      rewardProfile: { chestBonus: 2, scoreMult: 1.15, repairValue: 0.12 },
      entered: true,
      cleared: false,
      anchor: { r: 0, c: 0 },
      chamberCells: [{ r: 0, c: 0 }, { r: 0, c: 1 }],
      entity: { id: 'smoke-elite-marker', mesh: markerMesh }
    };
    try {
      Math.random = () => 0;
      state.level = 3;
      state.score = 0;
      state.player = {
        ...saved.player,
        baseHp: 120,
        currentHp: 70,
        baseAtk: 18
      };
      state.maze = {
        ...saved.maze,
        lvSize: 1,
        lvChest: 1,
        baseChestRate: 0.05,
        baseMonsterRate: 0.03
      };
      state.meta = { nextHiddenRoomBonus: 0, nextFloorAttackBonus: 0 };
      state.items = { supplies: { assault: 0, salvage: 0, scout: 0 } };
      state.floorBuff = {
        ...saved.floorBuff,
        supplyActive: false,
        supplyKey: null,
        supplyLabel: null,
        incomingDamageMult: 1,
        chestRewardMult: 1,
        supplyDropBonus: 0,
        attackMult: 1,
        moveSpeedMult: 1,
        bossRewardMult: 1,
        monsterSpawnMult: 1,
        monsterRewardMult: 1,
        hiddenRoomBonus: 0,
        diversionBonus: 0
      };
      state.floorRuntime = { reflexShieldReady: false };
      state.floorStats = { kills: 0, chests: 0, hiddenRoomsCleared: 0 };
      state.runRelics = [];
      state.floorContent = {
        themeKey: 'ember_forge',
        theme: { accentColor: '#fb923c', directive: { label: 'Smoke Ember Theme' } },
        archetypeKey: 'elite',
        hiddenRooms: [room]
      };
      controller.floorPlan = {
        themeKey: 'ember_forge',
        theme: { accentColor: '#fb923c', directive: { label: 'Smoke Ember Theme' } }
      };
      controller.grid = [
        [{ hiddenRoomId: room.id }, { hiddenRoomId: room.id }]
      ];
      engine.entities = [room.entity];
      controller.sleep = async () => {};
      controller.typeText = async (text) => {
        calls.typedText = text;
      };
      engine.spawnBurst = () => {
        calls.bursts += 1;
      };
      engine.addFloatingText = (text) => {
        calls.floatingTexts.push(String(text));
      };
      engine.scene.remove = () => {
        calls.removedMeshes += 1;
      };
      if (window.soundEngine?.upgrade) {
        window.soundEngine.upgrade = () => {
          calls.upgrades += 1;
        };
      }

      const summary = await controller.resolveHiddenEliteRoomClear(room, enemyMesh);
      return {
        summary,
        typedText: calls.typedText,
        cleared: room.cleared,
        entered: room.entered,
        hiddenRoomsCleared: state.floorStats.hiddenRoomsCleared,
        markerRemoved: !engine.entities.includes(room.entity),
        gridCleared: controller.grid[0][0].hiddenRoomId === null && controller.grid[0][1].hiddenRoomId === null,
        relicAdded: state.runRelics.length === 1,
        nextFloorAttackBonus: state.meta.nextFloorAttackBonus,
        assaultSupply: state.items.supplies.assault || 0,
        bursts: calls.bursts,
        floatingTexts: calls.floatingTexts,
        removedMeshes: calls.removedMeshes,
        upgrades: calls.upgrades
      };
    } finally {
      Math.random = saved.random;
      state.level = saved.level;
      state.score = saved.score;
      state.player = saved.player;
      state.maze = saved.maze;
      state.meta = saved.meta;
      state.items = saved.items;
      state.floorBuff = saved.floorBuff;
      state.floorRuntime = saved.floorRuntime;
      state.floorContent = saved.floorContent;
      state.floorStats = saved.floorStats;
      state.runRelics = saved.runRelics;
      state.collection = saved.collection;
      if (saved.collectionStorage === null) {
        window.localStorage.removeItem(state.collectionStorageKey);
      } else {
        window.localStorage.setItem(state.collectionStorageKey, saved.collectionStorage);
      }
      controller.grid = saved.grid;
      controller.floorPlan = saved.floorPlan;
      if (engine) {
        engine.entities = saved.engineEntities;
        engine.spawnBurst = saved.spawnBurst;
        engine.addFloatingText = saved.addFloatingText;
        if (engine.scene) engine.scene.remove = saved.sceneRemove;
      }
      controller.sleep = saved.sleep;
      controller.typeText = saved.typeText;
      if (window.soundEngine && saved.soundUpgrade) {
        window.soundEngine.upgrade = saved.soundUpgrade;
      }
      state.updateUI?.();
    }
  };
  const eliteRoomClearSmoke = await runEliteRoomClearSmoke();
  const countFoundBadges = (selector) => Array.from(document.querySelectorAll(`${selector} article span`))
    .filter((element) => element.innerText.trim() === 'Found')
    .length;

  const canvas = document.getElementById('webgl-canvas');
  const collectionButton = document.getElementById('btn-collection');
  const collectionModal = document.getElementById('collection-modal');
  const collectionBadge = document.getElementById('collection-count-badge');
  const pathDebugButton = document.getElementById('btn-path-debug');
  const pathDebugModal = document.getElementById('path-debug-modal');
  const pathDebugSummary = document.getElementById('path-debug-summary');
  const pathDebugContext = document.getElementById('path-debug-context');
  const pathDebugRoomCount = document.getElementById('path-debug-room-count');
  const pathDebugRoomList = document.getElementById('path-debug-room-list');
  const settingsButton = document.getElementById('btn-settings');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsHint = document.getElementById('settings-strategy-hint');
  const riskSelect = document.getElementById('select-strategy-risk');
  const modelEditorButton = document.getElementById('btn-editor');
  const soundEditorButton = document.getElementById('btn-sound-editor');
  const modelEditorModal = document.getElementById('editor-modal');
  const soundEditorModal = document.getElementById('sound-editor-modal');
  const modelEditorPreviewCanvas = document.getElementById('editor-preview-canvas');
  const modelEditorAssetSelect = document.getElementById('editor-asset-select');
  const soundEditorSelect = document.getElementById('sound-asset-select');
  const soundEditorType = document.getElementById('sound-editor-type');
  const soundEditorUsage = document.getElementById('sound-editor-usage');
  const soundEditorDescription = document.getElementById('sound-editor-description');
  const modelEditorUndoButton = document.getElementById('btn-editor-undo');
  const modelEditorReadButton = document.getElementById('btn-editor-read');
  const modelEditorResetButton = document.getElementById('btn-editor-reset');
  const modelEditorSaveButton = document.getElementById('btn-editor-save');
  const modelEditorCloseButton = document.getElementById('btn-editor-close');
  const modelEditorColorPicker = document.getElementById('editor-color-picker');
  const modelEditorPatternSelect = document.getElementById('editor-face-pattern');
  const modelEditorLineStyleSelect = document.getElementById('editor-line-style');
  const soundEditorPreviewButton = document.getElementById('btn-sound-preview');
  const soundEditorStopButton = document.getElementById('btn-sound-stop-preview');
  const soundEditorReadButton = document.getElementById('btn-sound-read');
  const soundEditorResetButton = document.getElementById('btn-sound-reset');
  const soundEditorSaveButton = document.getElementById('btn-sound-save');
  const soundEditorCloseButton = document.getElementById('btn-sound-close');
  const soundEditorWaveformSelect = document.getElementById('snd-oneshot-waveform');
  const soundEditorVolumeSlider = document.getElementById('snd-oneshot-volume');
  const soundEditorVolumeValue = document.getElementById('snd-oneshot-volume-value');
  const hudSupplyMode = document.getElementById('ui-supply-mode');
  const hudRelicCard = document.getElementById('ui-relic-card');
  const hudThemePill = document.getElementById('ui-theme-pill');
  const hudSupplyPill = document.getElementById('ui-supply-pill');
  const speedUpgradeButton = document.getElementById('btn-up-speed');

  if (!collectionButton || !collectionModal) throw new Error('Collection controls are missing.');
  collectionButton.click();
  await waitFor(() => !collectionModal.classList.contains('hidden'), 4000, 'collection modal');
  document.getElementById('btn-collection-close')?.click();

  if (!pathDebugButton || !pathDebugModal || !pathDebugSummary || !pathDebugContext || !pathDebugRoomCount || !pathDebugRoomList) {
    throw new Error('Path debug controls are missing.');
  }
  const pathDebugController = window.gameController;
  const savedPathDebug = {
    hiddenRooms: Array.isArray(pathDebugController?.hiddenRooms) ? pathDebugController.hiddenRooms : null,
    currentPathTarget: pathDebugController?.currentPathTarget,
    lastDirectExitPathLength: pathDebugController?.lastDirectExitPathLength,
    floorStats: { ...window.GameState.floorStats }
  };
  let pathDebugSummaryCards = 0;
  let pathDebugContextText = '';
  let pathDebugRoomCountText = '';
  let pathDebugRoomListText = '';
  let pathDebugRoomCards = 0;
  let pathDebugRoomListHasContent = false;
  let pathDebugMetricsVisible = false;
  let pathDebugGateProgressVisible = false;
  let pathDebugSelectedRoomVisible = false;
  let pathDebugModalWasOpened = false;
  try {
    if (pathDebugController) {
      pathDebugController.currentPathTarget = 'smoke-event-room';
      pathDebugController.lastDirectExitPathLength = 12;
      pathDebugController.hiddenRooms = [
        {
          id: 'smoke-event-room',
          displayName: 'Smoke Event Room',
          typeKey: 'event',
          unlocked: true,
          entered: true,
          cleared: false,
          accessScore: 0.612,
          gateType: 'kills_this_floor',
          gateThreshold: 3,
          eventSeed: { label: 'Smoke Anomaly' },
          routingDebug: {
            state: 'selected',
            threshold: 0.52,
            finalScore: 0.734,
            detourExtra: 4,
            pathToRoomLength: 7,
            pathRoomToExitLength: 9,
            objective: { c: 4, r: 6 }
          }
        },
        {
          id: 'smoke-locked-trial',
          displayName: 'Smoke Locked Trial',
          typeKey: 'trial',
          unlocked: false,
          entered: false,
          cleared: false,
          accessScore: 0.421,
          gateType: 'kills_this_floor',
          gateThreshold: 5,
          trialSeed: { label: 'Smoke Trial' },
          routingDebug: {
            state: 'locked',
            threshold: 0.52
          }
        }
      ];
      window.GameState.floorStats = {
        ...savedPathDebug.floorStats,
        kills: 2,
        hiddenRoomsCleared: 1
      };
    }
    pathDebugButton.click();
    await waitFor(() => !pathDebugModal.classList.contains('hidden'), 4000, 'path debug modal');
    pathDebugModalWasOpened = true;
    pathDebugSummaryCards = pathDebugSummary.children.length;
    pathDebugContextText = pathDebugContext.innerText || '';
    pathDebugRoomCountText = pathDebugRoomCount.innerText || '';
    pathDebugRoomListText = pathDebugRoomList.innerText || '';
    pathDebugRoomCards = pathDebugRoomList.querySelectorAll('article').length;
    pathDebugRoomListHasContent = pathDebugRoomCards > 0 || pathDebugRoomListText.includes('No hidden rooms');
    const pathDebugRoomListSearchText = pathDebugRoomListText.toLowerCase();
    pathDebugMetricsVisible = ['base access', 'final score', 'threshold', 'detour', 'to room', 'to exit']
      .every((label) => pathDebugRoomListSearchText.includes(label));
    pathDebugGateProgressVisible = pathDebugRoomListSearchText.includes('gate: kills 2/3');
    pathDebugSelectedRoomVisible = pathDebugRoomListSearchText.includes('smoke event room')
      && pathDebugRoomListSearchText.includes('current target');
  } finally {
    if (pathDebugModalWasOpened) {
      document.getElementById('btn-path-debug-close')?.click();
      await waitFor(() => pathDebugModal.classList.contains('hidden'), 4000, 'path debug modal close');
    }
    if (pathDebugController) {
      pathDebugController.hiddenRooms = savedPathDebug.hiddenRooms;
      pathDebugController.currentPathTarget = savedPathDebug.currentPathTarget;
      pathDebugController.lastDirectExitPathLength = savedPathDebug.lastDirectExitPathLength;
    }
    window.GameState.floorStats = savedPathDebug.floorStats;
  }

  if (!settingsButton || !settingsPanel || !settingsHint || !riskSelect) throw new Error('Settings controls are missing.');
  let modelEditorOpenedByHeader = false;
  let modelEditorClosedByCloseButton = false;
  let modelEditorPreviewDistanceBeforeWheel = 0;
  let modelEditorPreviewDistanceAfterWheel = 0;
  let modelEditorWheelChangedDistance = false;
  if (modelEditorButton && modelEditorModal && modelEditorCloseButton) {
    modelEditorButton.click();
    await waitFor(() => !modelEditorModal.classList.contains('hidden'), 4000, 'model editor modal open');
    modelEditorOpenedByHeader = true;
    modelEditorPreviewDistanceBeforeWheel = Number(window.modelEditor?.previewDistance || 0);
    modelEditorPreviewCanvas?.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }));
    modelEditorPreviewDistanceAfterWheel = Number(window.modelEditor?.previewDistance || 0);
    modelEditorWheelChangedDistance = Math.abs(modelEditorPreviewDistanceAfterWheel - modelEditorPreviewDistanceBeforeWheel) > 0.001;
    modelEditorCloseButton.click();
    await waitFor(() => modelEditorModal.classList.contains('hidden'), 4000, 'model editor modal close');
    modelEditorClosedByCloseButton = true;
  }
  const modelLogMessage = 'browser-smoke-model-log';
  const soundLogMessage = 'browser-smoke-sound-log';
  window.modelEditor?.log(modelLogMessage);
  window.soundEditor?.log(soundLogMessage);
  const soundEditorVolumeInputValue = '0.31';
  if (soundEditorVolumeSlider) {
    soundEditorVolumeSlider.value = soundEditorVolumeInputValue;
    soundEditorVolumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const soundEditorVolumeValueAfterInput = soundEditorVolumeValue?.innerText || '';
  const soundEditorWorkingVolumeAfterInput = Number(window.soundEditor?.workingConfig?.sounds?.[window.soundEditor?.currentSoundKey]?.volume);
  const soundEditorTrackInputValue = '2';
  if (soundEditorSelect) {
    soundEditorSelect.value = 'footsteps';
    soundEditorSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const soundEditorTrackSelect = document.getElementById('snd-meta-trackIndex');
  if (soundEditorTrackSelect) {
    soundEditorTrackSelect.value = soundEditorTrackInputValue;
    soundEditorTrackSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const result = {
    phase: window.GameState.phase,
    level: window.GameState.level,
    scoreText: document.getElementById('ui-score')?.innerText || '',
    collectionBadge: collectionBadge?.innerText || '',
    collectionSummaryCards: document.querySelectorAll('#collection-summary > *').length,
    eventCards: document.querySelectorAll('#collection-event-list article').length,
    trialCards: document.querySelectorAll('#collection-trial-list article').length,
    relicCards: document.querySelectorAll('#collection-relic-list article').length,
    bossCards: document.querySelectorAll('#collection-boss-list article').length,
    collectionFoundEventBadges: countFoundBadges('#collection-event-list'),
    collectionFoundTrialBadges: countFoundBadges('#collection-trial-list'),
    collectionFoundRelicBadges: countFoundBadges('#collection-relic-list'),
    collectionFoundBossBadges: countFoundBadges('#collection-boss-list'),
    pathDebugModalClosed: pathDebugModal.classList.contains('hidden'),
    pathDebugSummaryCards,
    pathDebugContextText,
    pathDebugRoomCountText,
    pathDebugRoomListText,
    pathDebugRoomCards,
    pathDebugRoomListHasContent,
    pathDebugMetricsVisible,
    pathDebugGateProgressVisible,
    pathDebugSelectedRoomVisible,
    pathDebugHiddenRoomsKnown: Array.isArray(window.gameController?.hiddenRooms),
    settingsPanelHidden: settingsPanel.classList.contains('hidden'),
    settingsRiskValue: riskSelect.value,
    settingsHintText: settingsHint.innerText || '',
    hasModelEditorButton: !!modelEditorButton,
    hasSoundEditorButton: !!soundEditorButton,
    modelEditorClosed: modelEditorModal?.classList.contains('hidden') || false,
    modelEditorOpenedByHeader,
    modelEditorClosedByCloseButton,
    modelEditorPreviewDistanceBeforeWheel,
    modelEditorPreviewDistanceAfterWheel,
    modelEditorWheelChangedDistance,
    soundEditorClosed: soundEditorModal?.classList.contains('hidden') || false,
    modelEditorAssetSelectValue: modelEditorAssetSelect?.value || '',
    modelEditorAssetOptionCount: modelEditorAssetSelect?.options?.length || 0,
    modelEditorAssetOptionValues: Array.from(modelEditorAssetSelect?.options || []).map((option) => option.value).join('|'),
    modelEditorPatternSelectValue: modelEditorPatternSelect?.value || '',
    modelEditorPatternOptionValues: Array.from(modelEditorPatternSelect?.options || []).map((option) => option.value).join('|'),
    modelEditorLineStyleSelectValue: modelEditorLineStyleSelect?.value || '',
    modelEditorLineStyleOptionValues: Array.from(modelEditorLineStyleSelect?.options || []).map((option) => option.value).join('|'),
    soundEditorSelectValue: soundEditorSelect?.value || '',
    soundEditorOptionCount: soundEditorSelect?.options?.length || 0,
    soundEditorTypeText: soundEditorType?.innerText || '',
    soundEditorUsageText: soundEditorUsage?.innerText || '',
    soundEditorDescriptionText: soundEditorDescription?.innerText || '',
    modelEditorCommandLabels: [
      modelEditorUndoButton?.innerText || '',
      modelEditorReadButton?.innerText || '',
      modelEditorResetButton?.innerText || '',
      modelEditorSaveButton?.innerText || ''
    ],
    modelEditorCloseAria: modelEditorCloseButton?.getAttribute('aria-label') || '',
    modelEditorCloseHasIcon: !!modelEditorCloseButton?.querySelector('svg path'),
    modelEditorIdleControlsDisabled: !!modelEditorColorPicker?.disabled
      && !!modelEditorPatternSelect?.disabled
      && !!modelEditorLineStyleSelect?.disabled
      && !!modelEditorUndoButton?.disabled,
    soundEditorCommandLabels: [
      soundEditorReadButton?.innerText || '',
      soundEditorResetButton?.innerText || '',
      soundEditorSaveButton?.innerText || ''
    ],
    soundEditorPreviewAria: soundEditorPreviewButton?.getAttribute('aria-label') || '',
    soundEditorPreviewHasIcon: !!soundEditorPreviewButton?.querySelector('svg path'),
    soundEditorStopAria: soundEditorStopButton?.getAttribute('aria-label') || '',
    soundEditorStopDisabled: !!soundEditorStopButton?.disabled,
    soundEditorStopHasIcon: !!soundEditorStopButton?.querySelector('svg path'),
    soundEditorCloseAria: soundEditorCloseButton?.getAttribute('aria-label') || '',
    soundEditorCloseHasIcon: !!soundEditorCloseButton?.querySelector('svg path'),
    soundEditorControlsRendered: !!soundEditorWaveformSelect
      && !!soundEditorVolumeSlider
      && !!soundEditorVolumeValue?.innerText,
    soundEditorVolumeValueAfterInput,
    soundEditorWorkingVolumeAfterInput,
    soundEditorTrackSelectValueAfterInput: soundEditorTrackSelect?.value || '',
    soundEditorCurrentTrackIndexAfterInput: Number(window.soundEditor?.currentTrackIndex),
    hudSupplyModeText: hudSupplyMode?.innerText || '',
    hasHudRelicCard: !!hudRelicCard,
    hasHudThemePill: !!hudThemePill,
    hasHudSupplyPill: !!hudSupplyPill,
    hasSpeedUpgradeButton: !!speedUpgradeButton,
    overlayHidden,
    generationOverlayHiddenBeforeDelay,
    generationOverlayShownAfterDelay,
    generationOverlayText,
    generationOverlayHiddenAfterClear,
    echoEngineEventMessage: echoEngineEventSmoke.message,
    echoEngineEventBonusBefore: echoEngineEventSmoke.before,
    echoEngineEventBonusAfter: echoEngineEventSmoke.after,
    echoEngineEventBonusApplied: echoEngineEventSmoke.applied,
    runRelicAddedStatuses: consecutiveRunRelicSmoke.addedStatuses,
    runRelicAddedRelics: consecutiveRunRelicSmoke.addedRelics,
    runRelicAddedUniqueCount: consecutiveRunRelicSmoke.addedUniqueCount,
    runRelicSingleSlotStatuses: consecutiveRunRelicSmoke.singleSlotStatuses,
    runRelicSingleSlotRelics: consecutiveRunRelicSmoke.singleSlotRelics,
    runRelicSingleSlotBonusScore: consecutiveRunRelicSmoke.singleSlotBonusScore,
    runRelicSingleSlotScore: consecutiveRunRelicSmoke.singleSlotScore,
    roomCompletionRestMessage: roomCompletionSmoke.restMessage,
    roomCompletionRestRecoveredHp: roomCompletionSmoke.restRecoveredHp,
    roomCompletionRestAddedSupply: roomCompletionSmoke.restAddedSupply,
    roomCompletionMerchantMessage: roomCompletionSmoke.merchantMessage,
    roomCompletionMerchantImprovedIntel: roomCompletionSmoke.merchantImprovedIntel,
    roomCompletionTrialMessage: roomCompletionSmoke.trialMessage,
    roomCompletionTrialBoostedAttack: roomCompletionSmoke.trialBoostedAttack,
    roomCompletionTrialAddedSupply: roomCompletionSmoke.trialAddedSupply,
    roomCompletionTreasureMessage: roomCompletionSmoke.treasureMessage,
    roomCompletionTreasureThemeApplied: roomCompletionSmoke.treasureThemeApplied,
    eliteRoomClearSummary: eliteRoomClearSmoke.summary,
    eliteRoomClearTypedText: eliteRoomClearSmoke.typedText,
    eliteRoomClearCleared: eliteRoomClearSmoke.cleared,
    eliteRoomClearEntered: eliteRoomClearSmoke.entered,
    eliteRoomClearHiddenRoomsCleared: eliteRoomClearSmoke.hiddenRoomsCleared,
    eliteRoomClearMarkerRemoved: eliteRoomClearSmoke.markerRemoved,
    eliteRoomClearGridCleared: eliteRoomClearSmoke.gridCleared,
    eliteRoomClearRelicAdded: eliteRoomClearSmoke.relicAdded,
    eliteRoomClearNextFloorAttackBonus: eliteRoomClearSmoke.nextFloorAttackBonus,
    eliteRoomClearAssaultSupply: eliteRoomClearSmoke.assaultSupply,
    eliteRoomClearBursts: eliteRoomClearSmoke.bursts,
    eliteRoomClearFloatingTexts: eliteRoomClearSmoke.floatingTexts,
    eliteRoomClearRemovedMeshes: eliteRoomClearSmoke.removedMeshes,
    eliteRoomClearUpgrades: eliteRoomClearSmoke.upgrades,
    canvasWidth: canvas?.clientWidth || 0,
    canvasHeight: canvas?.clientHeight || 0,
    hasController: !!window.gameController,
    hasEngine: !!window.engine,
    modelEditorDomRefsReady: [
      'modal',
      'canvas',
      'assetSelect',
      'undoButton',
      'closeButton',
      'logEl'
    ].every((key) => !!window.modelEditor?.[key]),
    soundEditorDomRefsReady: [
      'modal',
      'select',
      'controlsEl',
      'previewButton',
      'stopPreviewButton',
      'closeButton'
    ].every((key) => !!window.soundEditor?.[key]),
    modelEditorLogUpdated: window.modelEditor?.logEl?.innerText?.includes(modelLogMessage) || false,
    soundEditorLogUpdated: window.soundEditor?.logEl?.innerText?.includes(soundLogMessage) || false
  };

  if (!result.overlayHidden) throw new Error('Loading overlay is visible after startup.');
  if (!result.generationOverlayHiddenBeforeDelay) throw new Error('Generation overlay appeared before its delay.');
  if (!result.generationOverlayShownAfterDelay) throw new Error('Generation overlay did not appear after its delay.');
  if (!result.generationOverlayText.includes(generationOverlayTitle) || !result.generationOverlayText.includes(generationOverlayDetail)) {
    throw new Error(`Generation overlay delayed text did not render: ${result.generationOverlayText}`);
  }
  if (!result.generationOverlayHiddenAfterClear) throw new Error('Generation overlay did not hide after cleanup.');
  if (!result.echoEngineEventBonusApplied) throw new Error('Echo Engine event final path did not apply next-floor attack bonus.');
  if (!result.echoEngineEventMessage.includes('Echo Engine preheated next-floor attack')) {
    throw new Error(`Echo Engine event final message did not render: ${result.echoEngineEventMessage}`);
  }
  if (result.runRelicAddedStatuses.join('|') !== 'added|added') {
    throw new Error(`Consecutive elite/boss relic rolls did not both add: ${result.runRelicAddedStatuses.join('|')}`);
  }
  if (result.runRelicAddedRelics.length !== 2 || result.runRelicAddedUniqueCount !== 2) {
    throw new Error(`Consecutive elite/boss relic rolls duplicated or missed relics: ${result.runRelicAddedRelics.join('|')}`);
  }
  if (result.runRelicSingleSlotStatuses.join('|') !== 'added|overflow') {
    throw new Error(`Single-slot elite/boss relic rolls did not overflow correctly: ${result.runRelicSingleSlotStatuses.join('|')}`);
  }
  if (result.runRelicSingleSlotRelics.length !== 1 || result.runRelicSingleSlotBonusScore <= 0 || result.runRelicSingleSlotScore <= 0) {
    throw new Error('Single-slot boss relic overflow did not preserve a bonus-score reward.');
  }
  if (!result.roomCompletionRestRecoveredHp || !result.roomCompletionRestAddedSupply || !result.roomCompletionRestMessage.includes('Smoke Rest Room restored')) {
    throw new Error(`Rest room completion did not apply its runtime rewards: ${result.roomCompletionRestMessage}`);
  }
  if (!result.roomCompletionMerchantImprovedIntel || !result.roomCompletionMerchantMessage.includes('found no good deal')) {
    throw new Error(`Merchant room completion did not apply its runtime intel fallback: ${result.roomCompletionMerchantMessage}`);
  }
  if (!result.roomCompletionTrialBoostedAttack || !result.roomCompletionTrialAddedSupply || !result.roomCompletionTrialMessage.includes('next-floor attack')) {
    throw new Error(`Trial room completion did not apply its runtime attack-overdrive rewards: ${result.roomCompletionTrialMessage}`);
  }
  if (!result.roomCompletionTreasureThemeApplied || !result.roomCompletionTreasureMessage) {
    throw new Error('Treasure room completion did not surface its theme-chain runtime reward.');
  }
  if (!result.eliteRoomClearCleared || !result.eliteRoomClearEntered || result.eliteRoomClearHiddenRoomsCleared !== 1) {
    throw new Error('Elite room clear did not mark the room lifecycle state.');
  }
  if (!result.eliteRoomClearMarkerRemoved || !result.eliteRoomClearGridCleared) {
    throw new Error('Elite room clear did not remove marker references or clear grid links.');
  }
  if (!result.eliteRoomClearRelicAdded || result.eliteRoomClearNextFloorAttackBonus <= 0 || result.eliteRoomClearAssaultSupply < 1) {
    throw new Error('Elite room clear did not apply relic and theme-chain rewards.');
  }
  if (!result.eliteRoomClearSummary.includes('Smoke Elite Room cleared') || !result.eliteRoomClearSummary.includes('Smoke Elite Room 掉出了核心')) {
    throw new Error(`Elite room clear summary did not include score and relic presentation: ${result.eliteRoomClearSummary}`);
  }
  if (result.eliteRoomClearTypedText !== result.eliteRoomClearSummary) {
    throw new Error('Elite room clear did not route the final summary through typeText.');
  }
  if (result.eliteRoomClearBursts < 2 || result.eliteRoomClearRemovedMeshes < 1 || result.eliteRoomClearUpgrades < 2) {
    throw new Error('Elite room clear presentation effects did not run.');
  }
  if (result.canvasWidth <= 0 || result.canvasHeight <= 0) throw new Error('Canvas has no visible size.');
  if (result.collectionSummaryCards < 4) throw new Error('Collection summary cards did not render.');
  if (!result.collectionBadge.includes('/')) throw new Error('Collection badge did not render progress.');
  if (!result.collectionBadge.startsWith('4/')) throw new Error('Collection fixture did not load persisted progress.');
  if (result.collectionFoundEventBadges < 1) throw new Error('Collection event fixture did not render as Found.');
  if (result.collectionFoundTrialBadges < 1) throw new Error('Collection trial fixture did not render as Found.');
  if (result.collectionFoundRelicBadges < 1) throw new Error('Collection relic fixture did not render as Found.');
  if (result.collectionFoundBossBadges < 1) throw new Error('Collection boss fixture did not render as Found.');
  if (!result.pathDebugModalClosed) throw new Error('Path debug modal did not close after smoke.');
  if (result.pathDebugSummaryCards < 4) throw new Error('Path debug summary cards did not render.');
  if (!result.pathDebugContextText.includes('Current target')) throw new Error('Path debug context did not render current target.');
  if (!result.pathDebugRoomCountText.includes('room')) throw new Error('Path debug room count did not render.');
  if (!result.pathDebugRoomListHasContent) throw new Error('Path debug room list did not render content.');
  if (result.pathDebugRoomCards < 2) throw new Error('Path debug fixture room cards did not render.');
  if (!result.pathDebugMetricsVisible) throw new Error('Path debug per-room routing metrics did not render.');
  if (!result.pathDebugGateProgressVisible) throw new Error('Path debug gate progress did not render.');
  if (!result.pathDebugSelectedRoomVisible) throw new Error('Path debug selected room marker did not render.');
  if (result.pathDebugRoomCards > 0) {
    for (const flagLabel of ['Generated', 'Reachable', 'Entered', 'Cleared']) {
      if (!result.pathDebugRoomListText.includes(flagLabel)) {
        throw new Error(`Path debug room flags did not render ${flagLabel}.`);
      }
    }
  }
  if (!result.pathDebugHiddenRoomsKnown) throw new Error('Path debug controller hidden-room list is not available.');
  if (!result.settingsPanelHidden) throw new Error('Settings panel should start hidden.');
  if (result.settingsHintText.length < 8) throw new Error('Settings strategy hint did not render.');
  if (!result.settingsRiskValue) throw new Error('Settings risk select did not sync.');
  if (!result.hasModelEditorButton || !result.hasSoundEditorButton) throw new Error('Header editor buttons did not render.');
  if (!result.modelEditorClosed || !result.soundEditorClosed) throw new Error('Editor modals should start closed.');
  if (!result.modelEditorOpenedByHeader || !result.modelEditorClosedByCloseButton) {
    throw new Error('Model editor header/close bindings did not round-trip the modal.');
  }
  if (!result.modelEditorWheelChangedDistance) throw new Error('Model editor wheel interaction did not update preview distance.');
  if (result.modelEditorAssetSelectValue !== 'player') throw new Error('Model editor asset select did not default to player.');
  if (result.modelEditorAssetOptionCount !== 8) throw new Error('Model editor asset select options did not render.');
  if (result.modelEditorAssetOptionValues !== 'player|scout|brute|spine|warden|boss|chest|exit') {
    throw new Error('Model editor asset select option values changed unexpectedly.');
  }
  if (result.modelEditorPatternSelectValue !== 'none') throw new Error('Model editor pattern select did not default to none.');
  if (result.modelEditorPatternOptionValues !== 'none|halftone|dither|hatch|__mixed') {
    throw new Error('Model editor pattern select option values changed unexpectedly.');
  }
  if (result.modelEditorLineStyleSelectValue !== 'solid') throw new Error('Model editor line style select did not default to solid.');
  if (result.modelEditorLineStyleOptionValues !== 'solid|dashed|__mixed') {
    throw new Error('Model editor line style select option values changed unexpectedly.');
  }
  if (!result.soundEditorSelectValue || result.soundEditorOptionCount < 4) throw new Error('Sound editor select options did not render.');
  if (!result.soundEditorTypeText || !result.soundEditorUsageText || !result.soundEditorDescriptionText) throw new Error('Sound editor metadata did not render.');
  if (result.modelEditorCommandLabels.join('|') !== 'Undo|Load|Reset|Save') throw new Error('Model editor command labels did not initialize.');
  if (result.modelEditorCloseAria !== 'Close' || !result.modelEditorCloseHasIcon) throw new Error('Model editor close button chrome did not initialize.');
  if (!result.modelEditorIdleControlsDisabled) throw new Error('Model editor idle controls did not initialize disabled.');
  if (result.soundEditorCommandLabels.join('|') !== 'Load|Reset|Save') throw new Error('Sound editor command labels did not initialize.');
  if (result.soundEditorPreviewAria !== 'Play' || !result.soundEditorPreviewHasIcon) throw new Error('Sound editor preview button chrome did not initialize.');
  if (result.soundEditorStopAria !== 'Stop' || !result.soundEditorStopDisabled || !result.soundEditorStopHasIcon) throw new Error('Sound editor stop button chrome did not initialize.');
  if (result.soundEditorCloseAria !== 'Close' || !result.soundEditorCloseHasIcon) throw new Error('Sound editor close button chrome did not initialize.');
  if (!result.soundEditorControlsRendered) throw new Error('Sound editor controls did not render.');
  if (result.soundEditorVolumeValueAfterInput !== soundEditorVolumeInputValue) throw new Error('Sound editor range binding did not update the displayed value.');
  if (Math.abs(result.soundEditorWorkingVolumeAfterInput - Number(soundEditorVolumeInputValue)) > 0.001) throw new Error('Sound editor range binding did not update working config.');
  if (result.soundEditorTrackSelectValueAfterInput !== soundEditorTrackInputValue) throw new Error('Sound editor track select did not render after switching to footsteps.');
  if (result.soundEditorCurrentTrackIndexAfterInput !== Number(soundEditorTrackInputValue)) throw new Error('Sound editor track select did not update current track index.');
  if (!result.hudSupplyModeText) throw new Error('HUD supply card did not render.');
  if (!result.hasHudRelicCard) throw new Error('HUD relic card did not render.');
  if (!result.hasHudThemePill || !result.hasHudSupplyPill) throw new Error('HUD status pills did not render.');
  if (!result.hasSpeedUpgradeButton) throw new Error('HUD upgrade strip did not render.');
  if (!result.modelEditorDomRefsReady || !result.soundEditorDomRefsReady) throw new Error('Editor DOM refs did not initialize.');
  if (!result.modelEditorLogUpdated || !result.soundEditorLogUpdated) throw new Error('Editor log helpers did not update DOM logs.');
  return result;
}
