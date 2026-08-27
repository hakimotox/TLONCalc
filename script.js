// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const IDS = [
    'cr', 'cdmg', 'br', 'ig', 'brs',
    'en_cr', 'en_cdmg', 'en_br', 'en_ig', 'en_brs',
    'def_cr', 'def_cdmg', 'def_blk', 'def_bdr', 'def_brecov',
    'en_def_cr', 'en_def_cdmg', 'en_def_blk', 'en_def_bdr', 'en_def_brecov'
];

// ============================================================
// DOM-УТИЛИТЫ
// ============================================================
function getVal(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

function setVal(id, val) {
    document.getElementById(id).value = val;
}

// ============================================================
// ЯДРО РАСЧЁТА
// ============================================================
function calcDmg(attacker, defender) {
    const cd = Math.max(150 + attacker.cdmg - defender.cdmg, 100);
    const ig = Math.max(attacker.ig - defender.bdr, 0);
    const brs = Math.min(Math.max(defender.brecov - attacker.brs, 0), 100);
    const nc = Math.max(attacker.cr - defender.cr, 0);
    const nb = Math.max(defender.blk - attacker.br, 0);
    const bd = (1 - (0.5 * (1 - ig / 100))) * (1 - brs / 100);

    let crit, block, normal, blocked;
    if (nc + nb > 100) {
        const r = nc / (nc + nb);
        const b = nb / (nc + nb);
        crit = Math.min(r, 1);
        blocked = Math.min(b, 1);
        normal = (1 - crit) * (1 - blocked);
        blocked = (1 - crit) * blocked;
    } else {
        crit = Math.min(nc / 100, 1);
        blocked = Math.min(nb / 100, 1);
        normal = (1 - crit) * (1 - blocked);
        blocked = (1 - crit) * blocked;
    }

    const avg = crit * (cd / 100) + normal + blocked * bd;
    return { crit: crit * 100, block: blocked * 100, normal: normal * 100, avg: avg * 100 };
}

// ============================================================
// ОСНОВНАЯ ФУНКЦИЯ РАСЧЁТА
// ============================================================
function calc() {
    const a = {
        cr: getVal('cr'),
        cdmg: getVal('cdmg'),
        br: getVal('br'),
        ig: getVal('ig'),
        brs: getVal('brs')
    };
    const ae = {
        cr: getVal('en_cr'),
        cdmg: getVal('en_cdmg'),
        br: getVal('en_br'),
        ig: getVal('en_ig'),
        brs: getVal('en_brs')
    };
    const d = {
        cr: getVal('en_def_cr'),
        cdmg: getVal('en_def_cdmg'),
        blk: getVal('en_def_blk'),
        bdr: getVal('en_def_bdr'),
        brecov: getVal('en_def_brecov')
    };
    const dm = {
        cr: getVal('def_cr'),
        cdmg: getVal('def_cdmg'),
        blk: getVal('def_blk'),
        bdr: getVal('def_bdr'),
        brecov: getVal('def_brecov')
    };

    document.getElementById('total_cdmg').textContent = (150 + a.cdmg).toFixed(2);
    document.getElementById('en_total_cdmg').textContent = (150 + ae.cdmg).toFixed(2);

    const my = calcDmg(a, d);
    const en = calcDmg(ae, dm);

    document.getElementById('myCrit').textContent = my.crit.toFixed(2) + '%';
    document.getElementById('myBlock').textContent = my.block.toFixed(2) + '%';
    document.getElementById('myNormal').textContent = my.normal.toFixed(2) + '%';
    document.getElementById('myAvg').textContent = my.avg.toFixed(2) + '%';

    document.getElementById('enemyCrit').textContent = en.crit.toFixed(2) + '%';
    document.getElementById('enemyBlock').textContent = en.block.toFixed(2) + '%';
    document.getElementById('enemyNormal').textContent = en.normal.toFixed(2) + '%';
    document.getElementById('enemyAvg').textContent = en.avg.toFixed(2) + '%';

    const nc = Math.max(a.cr - d.cr, 0);
    const nb = Math.max(d.blk - a.br, 0);
    document.getElementById('analysis').innerHTML =
        (nc + nb > 100) ?
        `Сумма чистых шансов (${(nc + nb).toFixed(2)}%) > 100% → крит и блок конкурируют.` :
        `Сумма чистых шансов (${(nc + nb).toFixed(2)}%) ≤ 100% → крит и блок не конкурируют.`;

    // Анализ прокачки
    const target = getVal('targetDmg');
    const keys = ['cr', 'cdmg', 'br', 'ig', 'brs'];
    const ids = ['need_cr', 'need_cdmg', 'need_br', 'need_ig', 'need_brs'];

    function dmgFor(c) {
        const cd = Math.max(150 + c.cdmg - d.cdmg, 100);
        const ig = Math.max(c.ig - d.bdr, 0);
        const brs = Math.min(Math.max(d.brecov - c.brs, 0), 100);
        const nc = Math.max(c.cr - d.cr, 0);
        const nb = Math.max(d.blk - c.br, 0);
        const bd = (1 - (0.5 * (1 - ig / 100))) * (1 - brs / 100);

        if (nc + nb > 100) {
            const r = nc / (nc + nb);
            const b = nb / (nc + nb);
            const crit = Math.min(r, 1);
            const blocked = Math.min(b, 1);
            const normal = (1 - crit) * (1 - blocked);
            const blockedFinal = (1 - crit) * blocked;
            return (crit * (cd / 100) + normal + blockedFinal * bd) * 100;
        } else {
            const crit = Math.min(nc / 100, 1);
            const blocked = Math.min(nb / 100, 1);
            const normal = (1 - crit) * (1 - blocked);
            const blockedFinal = (1 - crit) * blocked;
            return (crit * (cd / 100) + normal + blockedFinal * bd) * 100;
        }
    }

    const cur = dmgFor(a);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const c = { ...a };
        let step = 0;
        let dmg = cur;
        while (dmg < target && step < 1000) {
            step += 5;
            c[k] = a[k] + step;
            dmg = dmgFor(c);
        }
        const el = document.getElementById(ids[i]);
        if (target <= 0 || target <= cur) {
            el.textContent = '';
            el.className = 'upgrade-need zero';
        } else if (step >= 1000) {
            el.textContent = '∞';
            el.className = 'upgrade-need';
        } else {
            el.textContent = `+${step.toFixed(0)}%`;
            el.className = 'upgrade-need';
        }
    }
}

// ============================================================
// АВТОСОХРАНЕНИЕ
// ============================================================
function saveState() {
    const data = {};
    IDS.forEach(id => data[id] = getVal(id));
    data.target = getVal('targetDmg');
    try {
        localStorage.setItem('tloncalc_v2', JSON.stringify(data));
        document.getElementById('statusDot').className = 'status-dot saved';
        document.getElementById('statusText').textContent = 'Сохранено';
    } catch (_) {}
}

function loadState() {
    try {
        const raw = localStorage.getItem('tloncalc_v2');
        if (!raw) return false;
        const data = JSON.parse(raw);
        IDS.forEach(id => {
            if (id in data) setVal(id, data[id]);
        });
        if ('target' in data) setVal('targetDmg', data.target);
        return true;
    } catch (_) { return false; }
}

// ============================================================
// СБРОС
// ============================================================
function resetDefault() {
    IDS.forEach(id => setVal(id, 0));
    setVal('targetDmg', 150);
    calc();
    saveState();
    showToast('↺ Сброшено к нулевым значениям');
}

// ============================================================
// ЭКСПОРТ / ИМПОРТ
// ============================================================
function exportJSON() {
    const vals = {};
    IDS.forEach(id => vals[id] = getVal(id));
    vals.target = getVal('targetDmg');
    const blob = new Blob([JSON.stringify(vals, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tlon_calc_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 Данные сохранены в файл');
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            IDS.forEach(id => { if (id in data) setVal(id, data[id]); });
            if ('target' in data) setVal('targetDmg', data.target);
            calc();
            saveState();
            showToast('📥 Данные загружены и сохранены');
        } catch (_) { showToast('❌ Ошибка импорта'); }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ============================================================
// ТЕМА
// ============================================================
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('tlon_theme', next);
}

// ============================================================
// TOAST (ВСПЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ)
// ============================================================
let toastTimeout;

function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show';
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        el.className = 'toast';
    }, 2500);
}

// ============================================================
// ПРИВЯЗКА СОБЫТИЙ
// ============================================================
function bindEvents() {
    // Все поля ввода
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            calc();
            // Автосохранение с задержкой
            clearTimeout(window.saveTimeout);
            window.saveTimeout = setTimeout(saveState, 300);
        });
    });

    // Кнопка импорта
    const importBtn = document.getElementById('importFile');
    if (importBtn) {
        importBtn.addEventListener('change', importJSON);
    }

    // Кнопка сброса уже привязана через onclick в HTML
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
function init() {
    // Загрузка темы
    const savedTheme = localStorage.getItem('tlon_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Загрузка состояния
    const hasSaved = loadState();

    // Первый расчёт
    calc();

    // Обновление индикатора
    if (hasSaved) {
        document.getElementById('statusDot').className = 'status-dot saved';
        document.getElementById('statusText').textContent = 'Загружено';
    }

    // Привязка событий
    bindEvents();

    console.log('⚔️ TLoN Калькулятор v1.32 — автосохранение активно');
}

// Запуск после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
