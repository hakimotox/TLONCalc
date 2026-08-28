// ============================================================
// TLoN Симулятор эмблем гильдии
// ============================================================

const MAX_PER_COLUMN = 3;
const MAX_TOTAL = 30;

// ===== ДАННЫЕ ЭМБЛЕМ =====
const EMBLEMS = {
    red: [
        { id: 'atk', name: 'АТК', r: 5, g: 2, b: 2, desc: '480' },
        { id: 'holy_shield', name: 'Священный щит', r: 7, g: 2, b: 2, desc: 'Может быть активирован в бою, даёт щит равный 4.09% от HP, 10 секунд (КД: 60с)' },
        { id: 'crit', name: 'Крит', r: 10, g: 2, b: 2, desc: '240' },
        { id: 'destroy', name: 'Уничтожение', r: 8, g: 3, b: 3, desc: '240' },
        { id: 'debuff_master', name: 'Мастер дебаффов', r: 5, g: 5, b: 5, desc: '1.5%' },
        { id: 'pierce_rate', name: 'Шанс Пролома', r: 13, g: 3, b: 5, desc: '1.5%' },
        { id: 'dmg_increase', name: 'Повыш.УРН', r: 13, g: 5, b: 3, desc: '1.5%' },
        { id: 'defense_instinct', name: 'Инстинкт защиты', r: 16, g: 0, b: 6, desc: 'Срабатывает при получении урона, когда HP ниже 50%, Стойкость+4.44%, Блок+4.44%, ЗАЩ+8.88%, 10 секунд. (КД: 20с)' },
        { id: 'crisis_warning', name: 'Тревога кризиса', r: 20, g: 5, b: 5, desc: 'При получении урона, если урон превышает 6% от макс. HP, Блок срабатывает обязательно, эффективность снижения урона Блока увеличена на 15.2%. (КД: 20с)' }
    ],
    blue: [
        { id: 'def', name: 'ЗАЩ', r: 0, g: 5, b: 3, desc: '480' },
        { id: 'wind_shadow', name: 'Неразлучность', r: 2, g: 7, b: 2, desc: 'После использования уклонения, наносимый урон +2.02%, полученный урон -3.03%, 3 секунды' },
        { id: 'block', name: 'Блок', r: 0, g: 10, b: 2, desc: '240' },
        { id: 'one_heart', name: 'Единство', r: 5, g: 5, b: 5, desc: '1.5%' },
        { id: 'abnormal_resist', name: 'Отпор дебаффу', r: 5, g: 5, b: 5, desc: '1.5%' },
        { id: 'protection_rate', name: 'Шанс Покрова', r: 0, g: 13, b: 6, desc: '1.5%' },
        { id: 'good_luck', name: 'Сопутствие удачи', r: 6, g: 16, b: 0, desc: 'Срабатывает каждые 15с в бою, даёт 1 из эффектов: АТК+5.44% на 6с, ЗАЩ+10.88% на 6с, 6% макс. HP лечение.' },
        { id: 'block_dmg_reduction', name: 'Пониж.УРН Блока', r: 5, g: 15, b: 5, desc: '4.5%' },
        { id: 'integrated_offense', name: 'Атака и оборона', r: 5, g: 20, b: 5, desc: 'Когда HP > 50%, полученный урон -8.19%, когда HP >= 50%, наносимый урон +5.46%' }
    ],
    green: [
        { id: 'hp', name: 'ОЗ', r: 0, g: 3, b: 5, desc: '4800' },
        { id: 'flower_barrier', name: 'Стена цветов', r: 2, g: 2, b: 7, desc: 'Урон от Цветочной Феи снижен на 3.03%' },
        { id: 'tenacity', name: 'Прочность', r: 0, g: 2, b: 10, desc: '240' },
        { id: 'break_free', name: 'Разруха', r: 5, g: 5, b: 5, desc: '1.5%' },
        { id: 'dmg_reduction', name: 'Пониж.УРН', r: 0, g: 6, b: 13, desc: '1.5%' },
        { id: 'full_moon', name: 'Идеальная Луна', r: 0, g: 6, b: 16, desc: 'За каждые 10% оставшегося HP получает 0.56% снижения урона; при HP > 80% доп. 3% снижения урона' },
        { id: 'block_recovery', name: 'Лечение Блока', r: 5, g: 5, b: 15, desc: '4.5%' },
        { id: 'impeccable', name: 'Неотразимость', r: 5, g: 5, b: 20, desc: 'Получаемый критический урон снижен на 20.48%' }
    ]
};

const ALL_EMBLEMS = [...EMBLEMS.red, ...EMBLEMS.blue, ...EMBLEMS.green];

// ===== СОСТОЯНИЕ =====
let selected = new Set();
let buildName = '';
let history = [];

// ===== DOM =====
const redEl = document.getElementById('red');
const blueEl = document.getElementById('blue');
const greenEl = document.getElementById('green');
const descBox = document.getElementById('desc');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const historyList = document.getElementById('history-list');

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getMaxForColumn(column) {
    let max = 0;
    selected.forEach(id => {
        const e = ALL_EMBLEMS.find(el => el.id === id);
        if (!e) return;
        let inColumn = false;
        if (column === 'red' && EMBLEMS.red.some(el => el.id === e.id)) inColumn = true;
        else if (column === 'blue' && EMBLEMS.blue.some(el => el.id === e.id)) inColumn = true;
        else if (column === 'green' && EMBLEMS.green.some(el => el.id === e.id)) inColumn = true;
        if (inColumn) {
            const emblemMax = Math.max(e.r, e.g, e.b);
            max = Math.max(max, emblemMax);
        }
    });
    return max;
}

function getColumnMaxes() {
    return {
        red: getMaxForColumn('red'),
        blue: getMaxForColumn('blue'),
        green: getMaxForColumn('green')
    };
}

function getTotal() {
    const maxes = getColumnMaxes();
    return maxes.red + maxes.blue + maxes.green;
}

function getColumnCount(emblem) {
    let target = null;
    if (EMBLEMS.red.some(e => e.id === emblem.id)) target = 'red';
    else if (EMBLEMS.blue.some(e => e.id === emblem.id)) target = 'blue';
    else if (EMBLEMS.green.some(e => e.id === emblem.id)) target = 'green';
    if (!target) return 0;

    let count = 0;
    selected.forEach(id => {
        const e = ALL_EMBLEMS.find(el => el.id === id);
        if (!e) return;
        if (target === 'red' && EMBLEMS.red.some(el => el.id === e.id)) count++;
        else if (target === 'blue' && EMBLEMS.blue.some(el => el.id === e.id)) count++;
        else if (target === 'green' && EMBLEMS.green.some(el => el.id === e.id)) count++;
    });
    return count;
}

function canSelect(emblem) {
    let target = null;
    if (EMBLEMS.red.some(e => e.id === emblem.id)) target = 'red';
    else if (EMBLEMS.blue.some(e => e.id === emblem.id)) target = 'blue';
    else if (EMBLEMS.green.some(e => e.id === emblem.id)) target = 'green';
    if (!target) return false;

    const count = getColumnCount(emblem);
    if (count >= MAX_PER_COLUMN) return false;

    const currentMaxes = getColumnMaxes();
    const currentTotal = getTotal();
    const currentMax = getMaxForColumn(target);
    const newMax = Math.max(currentMax, Math.max(emblem.r, emblem.g, emblem.b));
    const newTotal = currentTotal - currentMax + newMax;
    
    if (newTotal > MAX_TOTAL) return false;

    return true;
}

// ===== ИСТОРИЯ =====
function loadHistory() {
    const saved = localStorage.getItem('tlon_sim_history');
    if (saved) {
        try {
            history = JSON.parse(saved);
        } catch (e) { history = []; }
    }
    renderHistory();
}

function saveHistory() {
    localStorage.setItem('tlon_sim_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (!historyList) return;
    if (history.length === 0) {
        historyList.innerHTML = '<div style="color:var(--text3);font-style:italic;padding:8px;">Нет сохранённых билдов</div>';
        return;
    }
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="loadBuild(${index})">
            <span class="history-name">${item.name || 'Без названия'}</span>
            <span class="history-summary">${item.summary || ''}</span>
            <button class="history-delete" onclick="event.stopPropagation();deleteBuild(${index})">✕</button>
        </div>
    `).join('');
}

function saveCurrentBuild() {
    if (selected.size === 0) {
        showToast('❌ Сначала выберите эмблемы!');
        return;
    }
    
    const name = prompt('Введите название билда:', buildName || 'Мой билд');
    if (name === null) return;
    if (!name.trim()) {
        showToast('❌ Название не может быть пустым');
        return;
    }
    
    const data = Array.from(selected);
    const maxes = getColumnMaxes();
    const total = getTotal();
    const summary = `🔴${maxes.red} 🔵${maxes.blue} 🟢${maxes.green} = ${total}`;
    
    history.push({
        name: name.trim(),
        data: data,
        summary: summary,
        timestamp: Date.now()
    });
    
    saveHistory();
    buildName = name.trim();
    showToast(`✅ Билд "${buildName}" сохранён!`);
}

function loadBuild(index) {
    const item = history[index];
    if (!item) return;
    
    selected = new Set(item.data);
    buildName = item.name;
    updateUI();
    saveState();
    
    document.querySelectorAll('#red-selector input, #blue-selector input, #green-selector input')
        .forEach(c => {
            c.checked = selected.has(c.value);
            updateCheckboxState(c);
        });
    
    showToast(`📂 Загружен билд "${buildName}"`);
}

function deleteBuild(index) {
    if (!confirm(`Удалить билд "${history[index].name}"?`)) return;
    history.splice(index, 1);
    saveHistory();
    showToast('🗑️ Билд удалён');
}

function clearHistory() {
    if (!confirm('Очистить всю историю билдов?')) return;
    history = [];
    saveHistory();
    showToast('🗑️ История очищена');
}

// ===== РЕНДЕР =====
function renderEmblems() {
    const containers = {
        red: document.getElementById('red-selector'),
        blue: document.getElementById('blue-selector'),
        green: document.getElementById('green-selector')
    };

    Object.keys(containers).forEach(color => {
        const container = containers[color];
        if (!container) return;
        container.innerHTML = '';
        EMBLEMS[color].forEach(e => {
            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = `cb_${e.id}`;
            cb.value = e.id;
            cb.checked = selected.has(e.id);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'emblem-name';
            nameSpan.textContent = e.name;

            const descSpan = document.createElement('span');
            descSpan.className = 'emblem-desc';
            descSpan.textContent = `${e.r}/${e.g}/${e.b}`;

            label.appendChild(cb);
            label.appendChild(nameSpan);
            label.appendChild(descSpan);
            container.appendChild(label);
            updateCheckboxState(cb);
        });
    });
}

function updateCheckboxState(cb) {
    if (!cb) return;
    const emblem = ALL_EMBLEMS.find(e => e.id === cb.value);
    if (!emblem) return;

    const isSelected = selected.has(emblem.id);
    const canSelectNow = canSelect(emblem) || isSelected;

    cb.disabled = !canSelectNow;
    const label = cb.closest('label');
    if (label) {
        label.style.opacity = canSelectNow ? '1' : '0.4';
        label.style.cursor = canSelectNow ? 'pointer' : 'not-allowed';
    }
}

// ===== ОБНОВЛЕНИЕ UI =====
function updateUI() {
    const maxes = getColumnMaxes();
    const total = getTotal();

    redEl.textContent = maxes.red;
    blueEl.textContent = maxes.blue;
    greenEl.textContent = maxes.green;

    let redCount = 0, blueCount = 0, greenCount = 0;
    selected.forEach(id => {
        const e = ALL_EMBLEMS.find(el => el.id === id);
        if (!e) return;
        if (EMBLEMS.red.some(el => el.id === e.id)) redCount++;
        else if (EMBLEMS.blue.some(el => el.id === e.id)) blueCount++;
        else if (EMBLEMS.green.some(el => el.id === e.id)) greenCount++;
    });

    let html = '';
    if (selected.size === 0) {
        html = '💡 Выберите эмблемы. Максимум 3 в каждом гербе.';
    } else {
        const names = [];
        selected.forEach(id => {
            const e = ALL_EMBLEMS.find(el => el.id === id);
            if (e) names.push(`<strong>${e.name}</strong>`);
        });
        html = `✅ Выбрано: ${names.join(', ')}<br><br>`;
        html += `<strong>Максимумы гербов:</strong> 🔴${maxes.red} 🔵${maxes.blue} 🟢${maxes.green}<br>`;
        html += `<strong>Сумма максимумов:</strong> ${total} / 30<br>`;
        html += `<strong>В гербах:</strong> 🔴${redCount} 🔵${blueCount} 🟢${greenCount} (макс. 3)`;

        if (total >= MAX_TOTAL) {
            html += `<br><span style="color:#16a34a;">✅ Лимит 30 достигнут!</span>`;
        } else {
            html += `<br><span style="color:#4d6bfe;">📊 Осталось ${MAX_TOTAL - total} очков</span>`;
        }

        html += '<br><br><strong>📋 Описания эффектов:</strong><br>';
        selected.forEach(id => {
            const e = ALL_EMBLEMS.find(el => el.id === id);
            if (e) {
                html += `<span style="font-weight:600;color:#4d6bfe;">${e.name}</span>: ${e.desc}<br>`;
            }
        });

        if (redCount >= MAX_PER_COLUMN) html += `<br><span style="color:#dc2626;">⚠️ Красный герб заполнен!</span>`;
        if (blueCount >= MAX_PER_COLUMN) html += `<br><span style="color:#dc2626;">⚠️ Синий герб заполнен!</span>`;
        if (greenCount >= MAX_PER_COLUMN) html += `<br><span style="color:#dc2626;">⚠️ Зелёный герб заполнен!</span>`;
    }
    descBox.innerHTML = html;

    statusDot.className = 'status-dot saved';
    statusText.textContent = 'Сохранено';
}

// ===== ОБРАБОТКА ВЫБОРА =====
function handleCheckbox(cb) {
    const emblem = ALL_EMBLEMS.find(e => e.id === cb.value);
    if (!emblem) return;

    if (cb.checked) {
        if (!canSelect(emblem)) {
            cb.checked = false;
            showToast('❌ Нельзя выбрать — превышение лимита 30!');
            return;
        }
        selected.add(emblem.id);
    } else {
        selected.delete(emblem.id);
    }

    updateUI();
    saveState();

    document.querySelectorAll('#red-selector input, #blue-selector input, #green-selector input')
        .forEach(c => updateCheckboxState(c));
}

// ===== СОХРАНЕНИЕ =====
function saveState() {
    localStorage.setItem('tlon_sim_selected', JSON.stringify(Array.from(selected)));
    localStorage.setItem('tlon_sim_buildname', buildName);
}

function loadState() {
    const saved = localStorage.getItem('tlon_sim_selected');
    if (saved) {
        try {
            const arr = JSON.parse(saved);
            arr.forEach(id => selected.add(id));
        } catch (e) {}
    }
    const name = localStorage.getItem('tlon_sim_buildname');
    if (name) buildName = name;
}

// ===== СБРОС =====
function resetSelection() {
    selected.clear();
    buildName = '';
    updateUI();
    saveState();
    document.querySelectorAll('#red-selector input, #blue-selector input, #green-selector input')
        .forEach(cb => {
            cb.checked = false;
            updateCheckboxState(cb);
        });
    showToast('↺ Все эмблемы сброшены');
}

// ===== ТОСТ =====
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.className = 'toast';
    }, 2500);
}

// ===== ТЕМА =====
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('tlon_sim_theme', next);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('tlon_sim_theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);

    document.querySelector('.reset-btn').addEventListener('click', resetSelection);
    document.getElementById('save-build-btn').addEventListener('click', saveCurrentBuild);
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);

    loadState();
    loadHistory();
    renderEmblems();
    updateUI();

    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            handleCheckbox(e.target);
        }
    });

    setTimeout(() => {
        statusDot.className = 'status-dot saved';
        statusText.textContent = 'Сохранено';
    }, 300);
});

// Глобальные функции для onclick
window.resetSelection = resetSelection;
window.loadBuild = loadBuild;
window.deleteBuild = deleteBuild;
window.saveCurrentBuild = saveCurrentBuild;
window.clearHistory = clearHistory;
