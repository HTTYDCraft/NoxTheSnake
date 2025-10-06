import * as skinview3d from 'https://cdn.jsdelivr.net/npm/skinview3d@3.4.1/+esm';
import { config } from '../config.js';

const DOM = {
    contentGrid: document.getElementById('content-grid'),
    avatar: document.getElementById('avatar'),
    profileName: document.getElementById('profile-name'),
    profileDescription: document.getElementById('profile-description'),
    linksSection: document.getElementById('links-section'),
    minecraftBlock: document.getElementById('minecraft-block'),
    minecraftTitle: document.getElementById('minecraft-title'),
    skinViewerContainer: document.getElementById('skin-viewer-container'),
    skinCanvas: document.getElementById('skin-canvas'),
    downloadSkinButton: document.getElementById('download-skin-button'),
    downloadSkinText: document.getElementById('download-skin-text'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
};

// Функция для определения начальной темы
const getInitialTheme = () => {
    // 1. Проверяем, сохранил ли пользователь свой выбор ранее
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        return storedTheme;
    }
    // 2. Если выбора нет, проверяем системные настройки
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    // 3. По умолчанию, если ничего не найдено, ставим тёмную тему
    return 'dark';
};

const state = {
    theme: getInitialTheme(), // Используем новую функцию
    skinViewerInstance: null,
    skinControlsEl: null,
    currentAnimKey: 'idle',
};

function applyTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
    if (DOM.themeIcon) DOM.themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
}

function renderContent() {
    const t = config.strings;
    // Profile
    DOM.profileName.textContent = t.profileName;
    DOM.profileDescription.textContent = t.profileDescription;
    DOM.avatar.src = config.profile.avatar;
    DOM.avatar.alt = t.avatarAlt;

    // Links
    DOM.linksSection.innerHTML = '';
    config.links.filter(l => l.active).sort((a, b) => a.order - b.order).forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'card flex items-center p-4 rounded-2xl m3-shadow-md cursor-pointer';
        a.innerHTML = `
            <div class="flex items-center select-none w-full">
                <span class="material-symbols-outlined icon-large">${link.icon || 'link'}</span>
                <span class="text-lg font-medium">${link.label}</span>
            </div>`;
        DOM.linksSection.appendChild(a);
    });

    // Skin
    DOM.minecraftTitle.textContent = t.minecraftTitle;
    DOM.downloadSkinText.textContent = t.downloadSkin;
}

function buildSkinControls() {
    if (state.skinControlsEl && state.skinControlsEl.parentElement) state.skinControlsEl.parentElement.removeChild(state.skinControlsEl);
    const controls = document.createElement('div');
    controls.className = 'skin-controls';
    const options = [
        { key: 'idle', icon: 'accessibility' },
        { key: 'walk', icon: 'directions_walk' },
        { key: 'run', icon: 'directions_run' },
        { key: 'rotate', icon: 'autorenew' },
    ];
    for (const opt of options) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mini-button';
        btn.setAttribute('data-anim', opt.key);
        btn.innerHTML = `<span class="material-symbols-outlined mini-icon">${opt.icon}</span>`;
        btn.addEventListener('click', () => setSkinAnimation(opt.key));
        controls.appendChild(btn);
    }
    const downloadWrapper = DOM.downloadSkinButton?.parentElement;
    if (downloadWrapper) {
        downloadWrapper.before(controls);
    }
    state.skinControlsEl = controls;
    updateActiveAnimationButtons();
}

function setSkinAnimation(key) {
    if (!state.skinViewerInstance) return;
    let anim = null;
    if (key === 'idle') anim = new skinview3d.IdleAnimation();
    else if (key === 'walk') anim = new skinview3d.WalkingAnimation();
    else if (key === 'run') anim = new skinview3d.RunningAnimation();
    else if (key === 'rotate') anim = new skinview3d.RotatingAnimation();

    state.skinViewerInstance.animation = anim;
    state.currentAnimKey = key;
    updateActiveAnimationButtons();
}

function updateActiveAnimationButtons() {
    if (!state.skinControlsEl) return;
    state.skinControlsEl.querySelectorAll('.mini-button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-anim') === state.currentAnimKey);
    });
}

async function initMinecraftSkinViewer() {
    if (!DOM.skinCanvas || !DOM.skinViewerContainer) return;
    try {
        const width = Math.max(1, DOM.skinViewerContainer.offsetWidth || 320);
        const height = Math.max(1, DOM.skinViewerContainer.offsetHeight || 320);
        if (state.skinViewerInstance) state.skinViewerInstance.dispose();

        const viewer = new skinview3d.SkinViewer({ canvas: DOM.skinCanvas, width, height });
        await viewer.loadSkin(config.profile.minecraftSkinUrl);

        state.skinViewerInstance = viewer;
        buildSkinControls();
        setSkinAnimation('idle');

        const controls = skinview3d.createOrbitControls(viewer);
        controls.enablePan = false;

        new ResizeObserver(() => {
            if (!state.skinViewerInstance) return;
            const w = Math.max(1, DOM.skinViewerContainer.offsetWidth || 320);
            const h = Math.max(1, DOM.skinViewerContainer.offsetHeight || 320);
            state.skinViewerInstance.setSize(w, h);
        }).observe(DOM.skinViewerContainer);
    } catch (e) { console.error('Skin viewer failed', e); }
}


document.addEventListener('DOMContentLoaded', async () => {
    applyTheme(state.theme);
    renderContent();
    await initMinecraftSkinViewer();

    DOM.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(state.theme);
    });
    DOM.downloadSkinButton.addEventListener('click', () => window.open(config.profile.minecraftSkinUrl, '_blank'));
});