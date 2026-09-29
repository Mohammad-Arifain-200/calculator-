document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const calcDisplay = document.getElementById('calc-display');
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const keypadView = document.getElementById('keypad-view');
    const converterView = document.getElementById('converter-view');
    const scientificPad = document.getElementById('scientific-pad');
    const historyPanel = document.getElementById('history-panel');
    const historyList = document.getElementById('history-list');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const historyToggleBtn = document.getElementById('history-toggle-btn');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Converter Elements
    const convCategory = document.getElementById('conv-category');
    const convInputVal = document.getElementById('conv-input-val');
    const convOutputVal = document.getElementById('conv-output-val');
    const convFromUnit = document.getElementById('conv-from-unit');
    const convToUnit = document.getElementById('conv-to-unit');
    const swapUnitsBtn = document.getElementById('swap-units');

    // State Variables
    let currentExpression = '';
    let currentResult = '0';
    let history = [];

    // --- Mode Switcher ---
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.dataset.mode;

            if (mode === 'converter') {
                // Hide main calculator display and keypad
                calcDisplay.classList.add('hidden');
                keypadView.classList.add('hidden');
                converterView.classList.remove('hidden');
            } else {
                // Show main calculator display
                calcDisplay.classList.remove('hidden');
                converterView.classList.add('hidden');
                keypadView.classList.remove('hidden');

                if (mode === 'scientific') {
                    scientificPad.classList.remove('hidden');
                } else {
                    scientificPad.classList.add('hidden');
                }
            }
        });
    });

    // --- Theme Switcher ---
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeToggleBtn.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    });

    // --- History Drawer Handlers ---
    historyToggleBtn.addEventListener('click', () => {
        historyPanel.classList.add('open');
    });

    closeHistoryBtn.addEventListener('click', () => {
        historyPanel.classList.remove('open');
    });

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        renderHistory();
    });

    function renderHistory() {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<li style="color: var(--text-secondary); padding: 10px 0;">কোনো হিস্ট্রি পাওয়া যায়নি</li>';
            return;
        }

        history.slice().reverse().forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="hist-expr">${item.expr}</div>
                <div class="hist-res">${item.res}</div>
            `;
            li.addEventListener('click', () => {
                currentResult = item.res;
                currentExpression = item.res;
                updateDisplay();
                historyPanel.classList.remove('open');
            });
            historyList.appendChild(li);
        });
    }

    // --- Keypad Input Handling ---
    document.querySelectorAll('.keypad .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.value;
            const action = btn.dataset.action;

            if (val !== undefined) {
                appendValue(val);
            } else if (action) {
                handleAction(action);
            }
        });
    });

    function appendValue(val) {
        if (currentResult === 'Error') currentResult = '0';
        currentExpression += val;
        updateDisplay();
    }

    function handleAction(action) {
        switch (action) {
            case 'clear':
                currentExpression = '';
                currentResult = '0';
                break;

            case 'delete':
                currentExpression = currentExpression.slice(0, -1);
                break;

            case 'percent':
                currentExpression += '%';
                break;

            case 'calculate':
                calculateResult();
                break;

            case 'sin': currentExpression += 'sin('; break;
            case 'cos': currentExpression += 'cos('; break;
            case 'tan': currentExpression += 'tan('; break;
            case 'log': currentExpression += 'log('; break;
            case 'ln':  currentExpression += 'ln('; break;
            case 'sqrt': currentExpression += '√('; break;
            case 'fact': currentExpression += '!'; break;
        }
        updateDisplay();
    }

    function calculateResult() {
        if (!currentExpression) return;

        try {
            let parsedExpr = currentExpression
                .replace(/÷/g, '/')
                .replace(/×/g, '*')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/√\(/g, 'Math.sqrt(')
                .replace(/\^/g, '**')
                .replace(/(\d+)%/g, '($1/100)');

            parsedExpr = parsedExpr.replace(/(\d+)!/g, (match, number) => factorial(parseInt(number)));

            const res = eval(parsedExpr);
            currentResult = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(8)).toString();

            history.push({ expr: currentExpression, res: currentResult });
            renderHistory();

            currentExpression = currentResult;
        } catch (e) {
            currentResult = 'Error';
        }
        updateDisplay();
    }

    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }

    function updateDisplay() {
        expressionEl.textContent = currentExpression;
        resultEl.textContent = currentResult || '0';
    }

    // --- Keyboard Shortcuts ---
    document.addEventListener('keydown', (e) => {
        if (!converterView.classList.contains('hidden')) return;

        if ((e.key >= '0' && e.key <= '9') || ['.', '+', '-', '*', '/', '(', ')', '^'].includes(e.key)) {
            let val = e.key;
            if (val === '*') val = '×';
            if (val === '/') val = '÷';
            appendValue(val);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculateResult();
        } else if (e.key === 'Backspace') {
            handleAction('delete');
        } else if (e.key === 'Escape') {
            handleAction('clear');
        }
    });

    // --- Unit Converter Logic ---
    const unitData = {
        length: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Mile: 1609.34, Foot: 0.3048, Inch: 0.0254 },
        weight: { Kilogram: 1, Gram: 0.001, Pound: 0.453592, Ounce: 0.0283495 },
        temp: ['Celsius', 'Fahrenheit', 'Kelvin']
    };

    function populateConverterUnits() {
        const cat = convCategory.value;
        convFromUnit.innerHTML = '';
        convToUnit.innerHTML = '';

        if (cat === 'temp') {
            unitData.temp.forEach(unit => {
                convFromUnit.add(new Option(unit, unit));
                convToUnit.add(new Option(unit, unit));
            });
            convToUnit.value = 'Fahrenheit';
        } else {
            const units = Object.keys(unitData[cat]);
            units.forEach(unit => {
                convFromUnit.add(new Option(unit, unit));
                convToUnit.add(new Option(unit, unit));
            });
            convToUnit.value = units[1] || units[0];
        }
        convertUnits();
    }

    function convertUnits() {
        const cat = convCategory.value;
        const val = parseFloat(convInputVal.value) || 0;
        const from = convFromUnit.value;
        const to = convToUnit.value;

        if (cat === 'temp') {
            let result = val;
            if (from === 'Celsius' && to === 'Fahrenheit') result = (val * 9/5) + 32;
            else if (from === 'Celsius' && to === 'Kelvin') result = val + 273.15;
            else if (from === 'Fahrenheit' && to === 'Celsius') result = (val - 32) * 5/9;
            else if (from === 'Fahrenheit' && to === 'Kelvin') result = (val - 32) * 5/9 + 273.15;
            else if (from === 'Kelvin' && to === 'Celsius') result = val - 273.15;
            else if (from === 'Kelvin' && to === 'Fahrenheit') result = (val - 273.15) * 9/5 + 32;
            convOutputVal.value = result.toFixed(2);
        } else {
            const baseValue = val * unitData[cat][from];
            const result = baseValue / unitData[cat][to];
            convOutputVal.value = parseFloat(result.toFixed(6));
        }
    }

    convCategory.addEventListener('change', populateConverterUnits);
    convInputVal.addEventListener('input', convertUnits);
    convFromUnit.addEventListener('change', convertUnits);
    convToUnit.addEventListener('change', convertUnits);

    swapUnitsBtn.addEventListener('click', () => {
        const temp = convFromUnit.value;
        convFromUnit.value = convToUnit.value;
        convToUnit.value = temp;
        convertUnits();
    });

    populateConverterUnits();
});