// ============================================================
// ДАННЫЕ ЭМБЛЕМ
// ============================================================
const DATA = [
    { name: 'Предупреждение о кризисе', color: 'Red', colours: [20, 5, 5], desc: 'При получении урона, если урон больше 6% от макс. HP, блок срабатывает гарантированно, а эффективность снижения урона блока увеличивается на 15.2%. (КД: 20с)' },
    { name: 'Щит Святого Духа', color: 'Red', colours: [7, 2, 2], desc: 'Может активироваться в бою, даёт щит равный 4.09% HP на 10 секунд (КД: 60с)' },
    { name: 'Полнолуние', color: 'Green', colours: [0, 6, 16], desc: 'За каждые 10% оставшегося HP получает 0.56% снижения урона; при HP > 80% дополнительно 3% снижения урона' },
    { name: 'Единство атаки и защиты', color: 'Blue', colours: [5, 20, 5], desc: 'При HP > 50% получаемый урон -8.19%, при HP >= 50% наносимый урон +5.46%' },
    { name: 'Следуя за ветром', color: 'Blue', colours: [2, 7, 2], desc: 'После уклонения наносимый урон +2.02%, получаемый урон -3.03% на 3 секунды' },
    { name: 'Инстинкт выживания', color: 'Red', colours: [16, 0, 6], desc: 'Срабатывает при получении урона с HP ниже 50%: стойкость +4.44%, блок +4.44%, защита +8.88% на 10 секунд. (КД: 20с)' },
    { name: 'Безупречность', color: 'Green', colours: [5, 5, 20], desc: 'Получаемый урон от крита снижен на 20.48%' },
    { name: 'Цветочный барьер', color: 'Green', colours: [2, 2, 7], desc: 'Урон от Цветочной феи снижен на 3.03%' },
    { name: 'Удача следует за мной', color: 'Blue', colours: [6, 16, 0], desc: 'Срабатывает каждые 15с в бою: случайный эффект: АТК+5.44% на 6с, ЗАЩ+10.88% на 6с, исцеление 6% макс. HP.' },
    { name: 'Снижение урона блока', color: 'Blue', colours: [5, 15, 5], desc: '4.5%' },
    { name: 'Шанс пробития', color: 'Red', colours: [13, 3, 5], desc: '1.5%' },
    { name: 'Увеличение урона', color: 'Red', colours: [13, 5, 3], desc: '1.5%' },
    { name: 'Единое сердце', color: 'Blue', colours: [5, 5, 5], desc: '1.5%' },
    { name: 'Освобождение', color: 'Green', colours: [5, 5, 5], desc: '1.5%' },
    { name: 'Восстановление блока', color: 'Green', colours: [5, 5, 15], desc: '4.5%' },
    { name: 'Шанс защиты', color: 'Blue', colours: [0, 13, 6], desc: '1.5%' },
    { name: 'Снижение урона', color: 'Green', colours: [0, 6, 13], desc: '1.5%' },
    { name: 'Аномальное мастерство', color: 'Red', colours: [5, 5, 5], desc: '1.5%' },
    { name: 'Аномальное сопротивление', color: 'Blue', colours: [5, 5, 5], desc: '1.5%' },
    { name: 'Крит', color: 'Red', colours: [10, 2, 2], desc: '240' },
    { name: 'АТК', color: 'Red', colours: [5, 2, 2], desc: '480' },
    { name: 'Уничтожение', color: 'Red', colours: [8, 3, 3], desc: '240' },
    { name: 'HP', color: 'Green', colours: [0, 3, 5], desc: '4800' },
    { name: 'Стойкость', color: 'Green', colours: [0, 2, 10], desc: '240' },
    { name: 'Защита', color: 'Blue', colours: [0, 5, 3], desc: '480' },
    { name: 'Блок', color: 'Blue', colours: [0, 10, 2], desc: '240' }
];

// Сортировка по сумме очков
DATA.forEach(line => line.total = line.colours.reduce((a, b) => a + b));
DATA.sort((a, b) => a.total - b.total);

// ============================================================
// DOM-УТИЛИТЫ
// ============================================================
const $ = (id) => document.getElementById(id);
const getChecked = (name) => $(name)?.checked || false;
const setChecked = (name, val) => { if ($(name)) $(name).checked = val; };

// ============================================================
// ОСНОВНАЯ ЛОГИКА
// ============================================================
function update(reset = false) {
    let rbgTotal = [0, 0, 0];
    const desc = [];

    if (!reset) {
        for (const line of DATA) {
            if (getChecked(line.name)) {
                rbgTotal[0] = Math.max(rbgTotal[0], line.colours[0]);
                rbgTotal[1] = Math.max(rbgTotal[1], line.colours[1]);
                rbgTotal[2] = Math.max(rbgTotal[2], line.colours[2]);
                desc.push(`<strong>${line.name}</strong>: ${line.desc}`);
            }
        }
    }

    const total = rbgTotal.reduce((a, b) => a + b);
    const colorbox = $('colorbox');
    if (colorbox) {
        colorbox.style.backgroundColor = total > 30 ? '#ffc9c9' : '#a2fcba';
    }

    $('red').textContent = rbgTotal[0];
    $('blue').textContent = rbgTotal[1];
    $('green').textContent = rbgTotal[2];
    $('desc').innerHTML = desc.length ? desc.join('<br>') : '...';

    // Сохраняем состояние
    saveState();
    updateStatus(true);
}

// ============================================================
// СБРОС
// ============================================================
function resetSelection() {
    DATA.forEach(line => setChecked(line.name, false));
    update(true);
    showToast('↺ Все эмблемы сброшены');
}

// ============================================================
// АВТОСОХРАНЕНИЕ
// ============================================================
function saveState() {
    const data = {};
    DATA.forEach(line => data[line.name] = getChecked(line.name));
    try {
        localStorage.setItem('emblem_simulator', JSON.stringify(data));
        updateStatus(true);
    } catch (_) {}
}

function loadState() {
    try {
        const raw = localStorage.getItem('emblem_simulator');
        if (!raw) return false;
        const data = JSON.parse(raw);
        DATA.forEach(line => {
            if (line.name in data) setChecked(line.name, data[line.name]);
        });
        return true;
    } catch (_) { return false; }
}

// ============================================================
// СТАТУС
// ============================================================
function updateStatus(saved = true) {
    const dot = $('statusDot');
    const text = $('statusText');
    if (dot && text) {
        dot.className = saved ? 'status-dot saved' : 'status-dot';
        text.textContent = saved ? 'Сохранено' : 'Автосохранение';
    }
}

// ============================================================
// ТЕМА
// ============================================================
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('emblem_theme', next);
}

// ============================================================
// TOAST
// ============================================================
let toastTimeout;

function showToast(msg) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show';
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.className = 'toast', 2500);
}

// ============================================================
// ПОСТРОЕНИЕ ИНТЕРФЕЙСА
// ============================================================
function buildUI() {
    const categories = { Red: [], Blue: [], Green: [] };

    for (const line of DATA) {
        const checked = getChecked(line.name) ? 'checked' : '';
        const style = line.total <= 30 ? 'font-weight: bold; color: var(--good);' : 'font-style: italic; color: #dc2626;';
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" id="${line.name}" name="${line.name}" onchange="update()" ${checked}>
            <span class="emblem-name" style="${style}">${line.name}</span>
            <span class="emblem-desc">${line.total} очков</span>
        `;
        categories[line.color].push(label);
    }

    const containers = {
        Red: $('red-selector'),
        Blue: $('blue-selector'),
        Green: $('green-selector')
    };

    for (const [color, container] of Object.entries(containers)) {
        if (container) {
            container.innerHTML = '';
            categories[color].forEach(el => container.appendChild(el));
        }
    }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
function init() {
    // Тема
    const savedTheme = localStorage.getItem('emblem_theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

    // Загрузка состояния
    const hasSaved = loadState();

    // Построение UI
    buildUI();

    // Обновление
    update(!hasSaved);

    if (hasSaved) {
        updateStatus(true);
        showToast('📂 Сохранение загружено');
    }

    // События
    $('themeBtn').addEventListener('click', toggleTheme);
}

document.addEventListener('DOMContentLoaded', init);