(function() {
    'use strict';

    // ---------- DOM elements ----------
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const operationSelect = document.getElementById('operation');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // ---------- Dark mode ----------
    const DARK_KEY = 'calculatorDarkMode';

    function loadDarkMode() {
        try {
            const saved = localStorage.getItem(DARK_KEY);
            return saved === 'true';
        } catch {
            return false;
        }
    }

    function saveDarkMode(isDark) {
        localStorage.setItem(DARK_KEY, String(isDark));
    }

    function applyDarkMode(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        darkModeToggle.checked = isDark;
    }

    function toggleDarkMode() {
        const isDark = darkModeToggle.checked;
        applyDarkMode(isDark);
        saveDarkMode(isDark);
    }

    // Initialize dark mode
    applyDarkMode(loadDarkMode());
    darkModeToggle.addEventListener('change', toggleDarkMode);

    // ---------- History Management ----------
    const STORAGE_KEY = 'calcHistory';
    const MAX_HISTORY = 20;

    function loadHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    function saveHistory(history) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    function addHistoryEntry(entry) {
        let history = loadHistory();
        history.unshift(entry);
        if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
        saveHistory(history);
        renderHistory();
    }

    function clearHistory() {
        saveHistory([]);
        renderHistory();
    }

    function renderHistory() {
        const history = loadHistory();
        historyList.innerHTML = '';
        if (history.length === 0) {
            const li = document.createElement('li');
            li.className = 'history-empty';
            li.textContent = 'No calculations yet';
            historyList.appendChild(li);
            return;
        }
        history.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.expression}</span><span>= ${item.result}</span>`;
            historyList.appendChild(li);
        });
    }

    // ---------- Calculation Logic ----------
    function calculate(num1, num2, operation) {
        switch (operation) {
            case 'add':      return num1 + num2;
            case 'subtract': return num1 - num2;
            case 'multiply': return num1 * num2;
            case 'divide':
                if (num2 === 0) throw new Error('Cannot divide by zero');
                return num1 / num2;
            case 'power':
                return Math.pow(num1, num2);
            case 'sqrt':
                if (num1 < 0) throw new Error('Cannot take square root of negative number');
                return Math.sqrt(num1);
            default:
                throw new Error('Invalid operation');
        }
    }

    function formatResult(value) {
        if (Number.isInteger(value)) return value.toString();
        const rounded = Number(value.toPrecision(12));
        return rounded.toString();
    }

    function handleCalculate() {
        const num1Val = num1Input.value.trim();
        const num2Val = num2Input.value.trim();
        const operation = operationSelect.value;

        if (num1Val === '') {
            resultDiv.textContent = 'Please enter first number';
            return;
        }
        const num1 = parseFloat(num1Val);
        if (isNaN(num1)) {
            resultDiv.textContent = 'Invalid first number';
            return;
        }

        let num2 = 0;
        let expression = '';
        if (operation === 'sqrt') {
            expression = `√${num1}`;
        } else {
            if (num2Val === '') {
                resultDiv.textContent = 'Please enter second number';
                return;
            }
            num2 = parseFloat(num2Val);
            if (isNaN(num2)) {
                resultDiv.textContent = 'Invalid second number';
                return;
            }
            const opSymbol = {
                'add': '+',
                'subtract': '−',
                'multiply': '×',
                'divide': '÷',
                'power': '^'
            }[operation] || operation;
            expression = `${num1} ${opSymbol} ${num2}`;
        }

        try {
            const result = calculate(num1, num2, operation);
            const formatted = formatResult(result);
            resultDiv.textContent = `= ${formatted}`;

            addHistoryEntry({
                expression: expression,
                result: formatted
            });
        } catch (err) {
            resultDiv.textContent = 'Error: ' + err.message;
        }
    }

    // ---------- Event Listeners ----------
    calculateBtn.addEventListener('click', handleCalculate);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT')) {
                handleCalculate();
            }
        }
    });

    clearHistoryBtn.addEventListener('click', clearHistory);

    // Initial render
    renderHistory();
    resultDiv.textContent = 'Enter numbers and press Calculate';
})();