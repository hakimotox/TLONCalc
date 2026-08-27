// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const IDS = [
    'cr', 'cdmg', 'br', 'ig', 'brs',
    'en_cr', 'en_cdmg', 'en_br', 'en_ig', 'en_brs',
    'def_cr', 'def_cdmg', 'def_blk', 'def_bdr', 'def_brecov',
    'en_def_cr', 'en_def_cdmg', 'en_def_blk', 'en_def_bdr', 'en_def_brecov'
];
const DEFAULT_TARGET = 0;
const DEFAULT_VALUES = Object.fromEntries(IDS.map(id => [id, 0]));

const $ = (id) => document.getElementById(id);
const getVal = (id) => parseFloat($(id).value) || 0;
const setVal = (id, val) => { $(id).value = val; };

// ============================================================
// ОРИГИНАЛЬНАЯ ФУНКЦИЯ ИЗ СТАРОГО КАЛЬКУЛЯТОРА (БЕЗ ИЗМЕНЕНИЙ)
// ============================================================
function calculate(cr, cdmg, br, ig, brs, ten, cdmgr, block, brecov, bdr) {
    cr = Number(cr);
    br = Number(br);
    ig = Number(ig);
    brs = Number(brs);
    cdmg = 150 + Number(cdmg);
    ten = Number(ten);
    block = Number(block);
    brecov = Number(brecov);
    bdr = Number(bdr);

    if (cdmgr) cdmg -= cdmgr;
    if (cdmg < 100) cdmg = 100;
    if (bdr) ig -= bdr;
    if (brs) brecov -= brs;
    if (brecov > 100) brecov = 100;

    let net_cr = cr - ten;
    let net_bl = block - br;
    net_cr = net_cr < 0 ? 0 : net_cr;
    net_bl = net_bl < 0 ? 0 : net_bl;

    if (net_cr + net_bl > 100) {
        let crit_rate = net_cr / (net_cr + net_bl);
        let block_rate = net_bl / (net_cr + net_bl);
        let crit_chance = crit_rate > 100 ? 100 : crit_rate;
        let block_rate_final = block_rate > 100 ? 100 : block_rate;

        let white_chance = (1 - crit_chance) * (1 - block_rate_final);
        let block_chance = (1 - crit_chance) * block_rate_final;
        let blocked_damage = (1 - (0.5 * (1 - (ig / 100)))) * (1 - brecov / 100);
        let total_dmg = crit_chance * (cdmg / 100) + white_chance + block_chance * blocked_damage;

        return {
            crit: crit_chance * 100,
            block: block_chance * 100,
            normal: white_chance * 100,
            avg: total_dmg * 100
        };
    } else {
        let crit_chance = net_cr / 100;
        if (crit_chance > 1) crit_chance = 1;
        let block_rate = net_bl / 100;
        if (block_rate > 1) block_rate = 1;

        let white_chance = (1 - crit_chance) * (1 - block_rate);
        let block_chance = (1 - crit_chance) * block_rate;
        let blocked_damage = (1 - (0.5 * (1 - (ig / 100)))) * (1 - brecov / 100);
        let total_dmg = crit_chance * (cdmg / 100) + white_chance + block_chance * blocked_damage;

        return {
            crit: crit_chance * 100,
            block: block_chance * 100,
            normal: white_chance * 100,
            avg: total_dmg * 100
        };
    }
}

// ============================================================
// АНАЛИЗ ПРОКАЧКИ (ЦЕЛЕВОЙ УРОН)
// ============================================================
function upgradeAnalysis() {
    const target = getVal('targetDmg');
    if (target <= 0) {
        document.querySelectorAll('.upgrade-need').forEach(el => {
            el.textContent = '';
            el.className = 'upgrade-need zero';
        });
        return;
    }

    const a = { cr: getVal('cr'), cdmg: getVal('cdmg'), br: getVal('br'), ig: getVal('ig'), brs: getVal('brs') };
    const d = { cr: getVal('en_def_cr'), cdmg: getVal('en_def_cdmg'), blk: getVal('en_def_blk'), bdr: getVal('en_def_bdr'), brecov: getVal('en_def_brecov') };

    function calcDamageForStats(c) {
        let cr = c.cr;
        let cdmg = 150 + c.cdmg - d.cdmg;
        if (cdmg < 100) cdmg = 100;
        let br = c.br;
        let ig = c.ig - d.bdr;
        if (ig < 0) ig = 0;
        let brs = c.brs;
        let ten = d.cr;
        let block = d.blk;
        let brecov = d.brecov - brs;
        if (brecov < 0) brecov = 0;
        if (brecov > 100) brecov = 100;

        let net_cr = cr - ten;
        if (net_cr < 0) net_cr = 0;
        let net_bl = block - br;
        if (net_bl < 0) net_bl = 0;

        if (net_cr + net_bl > 100) {
            let crit_rate = net_cr / (net_cr + net_bl);
            let block_rate = net_bl / (net_cr + net_bl);
            let crit_chance = crit_rate > 100 ? 100 : crit_rate;
            let block_rate_final = block_rate > 100 ? 100 : block_rate;

            let white_chance = (1 - crit_chance) * (1 - block_rate_final);
            let block_chance = (1 - crit_chance) * block_rate_final;
            let blocked_damage = (1 - (0.5 * (1 - (ig / 100)))) * (1 - brecov / 100);
            return (crit_chance * (cdmg / 100) + white_chance + block_chance * blocked_damage) * 100;
        } else {
            let crit_chance = net_cr / 100;
            if (crit_chance > 1) crit_chance = 1;
            let block_rate = net_bl / 100;
            if (block_rate > 1) block_rate = 1;

            let white_chance = (1 - crit_chance) * (1 - block_rate);
            let block_chance = (1 - crit_chance) * block_rate;
            let blocked_damage = (1 - (0.5 * (1 - (ig / 100)))) * (1 - brecov / 100);
            return (crit_chance * (cdmg / 100) + white_chance + block_chance * blocked_damage) * 100;
        }
    }

    const currentDmg = calcDamageForStats(a);
    const keys = ['cr', 'cdmg', 'br', 'ig', 'brs'];
    const ids = ['need_cr', 'need_cdmg', 'need_br', 'need_ig', 'need_brs'];

    keys.forEach((k, i) => {
        const c = { ...a };
        let step = 0;
        let dmg = currentDmg;
        while (dmg < target && step < 1000) {
            step += 5;
            c[k] = a[k] + step;
            dmg = calcDamageForStats(c);
        }
        const el = document.getElementById(ids[i]);
        if (target <= currentDmg) {
            el.textContent = '';
            el.className = 'upgrade-need zero';
        } else if (step >= 1000) {
            el.textContent = '∞';
            el.className = 'upgrade-need';
        } else {
            el.textContent = `+${step.toFixed(0)}%`;
            el.className = 'upgrade-need';
        }
    });
}

// ============================================================
// ОСНОВНАЯ ФУНКЦИЯ
// ============================================================
function calc() {
    const my = calculate(
        getVal('cr'),
        getVal('cdmg'),
        getVal('br'),
        getVal('ig'),
        getVal('brs'),
        getVal('en_def_cr'),
        getVal('en_def_cdmg'),
        getVal('en_def_blk'),
        getVal('en_def_brecov'),
        getVal('en_def_bdr')
    );

    const en = calculate(
        getVal('en_cr'),
        getVal('en_cdmg'),
        getVal('en_br'),
        getVal('en_ig'),
        getVal('en_brs'),
        getVal('def_cr'),
        getVal('def_cdmg'),
        getVal('def_blk'),
        getVal('def_brecov'),
        getVal('def_bdr')
    );

    $('myCrit').textContent = my.crit.toFixed(2) + '%';
    $('myBlock').textContent = my.block.toFixed(2) + '%';
    $('myNormal').textContent = my.normal.toFixed(2) + '%';
    $('myAvg').textContent = my.avg.toFixed(2) + '%';

    $('enemyCrit').textContent = en.crit.toFixed(2) + '%';
    $('enemyBlock').textContent = en.block.toFixed(2) + '%';
    $('enemyNormal').textContent = en.normal.toFixed(2) + '%';
    $('enemyAvg').textContent = en.avg.toFixed(2) + '%';

    const nc = Math.max(getVal('cr') - getVal('en_def_cr'), 0);
    const nb = Math.max(getVal('en_def_blk') - getVal('br'), 0);
    const total = nc + nb;

    $('netCritDisplay').textContent = nc.toFixed(2) + '%';
    $('netBlockDisplay').textContent = nb.toFixed(2) + '%';

    const conclusion = $('analysisConclusion');
    if (total > 100) {
        conclusion.className = 'analysis-conclusion warning';
        conclusion.innerHTML = `⚠️ Сумма чистых шансов (${total.toFixed(2)}%) превышает 100%. Крит и блок конкурируют. Увеличение одного параметра снижает эффективность другого.`;
    } else {
        conclusion.className = 'analysis-conclusion good';
        conclusion.innerHTML = `✅ Сумма чистых шансов (${total.toFixed(2)}%) ≤ 100%. Крит и блок не конкурируют. Вы можете свободно увеличивать оба параметра.`;
    }

    upgradeAnalysis();
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
        $('statusDot').className = 'status-dot saved';
        $('statusText').textContent = 'Сохранено';
    } catch (_) {}
}

function loadState() {
    try {
        const raw = localStorage.getItem('tloncalc_v2');
        if (!raw) return false;
        const data = JSON.parse(raw);
        IDS.forEach(id => { if (id in data) setVal(id, data[id]); });
        if ('target' in data) setVal('targetDmg', data.target);
        return true;
    } catch (_) { return false; }
}

// ============================================================
// СБРОС
// ============================================================
function resetDefault() {
    IDS.forEach(id => setVal(id, DEFAULT_VALUES[id] || 0));
    setVal('targetDmg', DEFAULT_TARGET);
    calc();
    saveState();
    showToast('↺ Сброшено к базовым значениям');
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
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
function init() {
    const savedTheme = localStorage.getItem('tlon_theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    const hasSaved = loadState();
    calc();
    if (hasSaved) {
        $('statusDot').className = 'status-dot saved';
        $('statusText').textContent = 'Загружено';
    }
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            calc();
            clearTimeout(window.saveTimeout);
            window.saveTimeout = setTimeout(saveState, 300);
        });
    });
    $('themeBtn').addEventListener('click', toggleTheme);
    $('resetBtn').addEventListener('click', resetDefault);
    $('exportBtn').addEventListener('click', exportJSON);
    $('importBtn').addEventListener('click', () => $('importFile').click());
    $('importFile').addEventListener('change', importJSON);
    console.log('⚔️ TLoN Калькулятор v1.32 — готов к работе');
}

document.addEventListener('DOMContentLoaded', init);