const display = document.getElementById('display');

function appendToDisplay(input) {
    if (display.value === "Error ❄️") display.value = "";
    if (display.value.length < 12) {
        display.value += input;
    }
}

function clearDisplay() {
    display.value = "";
}

function calculate() {
    try {
        if (display.value) {
            // Evaluasi matematika
            const result = eval(display.value.replace(/×/g, '*').replace(/÷/g, '/'));
            display.value = Number.isInteger(result) ? result : result.toFixed(2);
        }
    } catch (e) {
        display.value = "Error ❄️";
        setTimeout(clearDisplay, 1500);
    }
}

// Fungsi animasi tombol saat diklik atau diketik
function btnClick(element, val) {
    if (element) {
        element.classList.add('active-key');
        setTimeout(() => element.classList.remove('active-key'), 100);
    }
    if (val !== null) appendToDisplay(val);
}

// EVENT LISTENER KEYBOARD
document.addEventListener('keydown', (e) => {
    let key = e.key;

    // Mapping tombol keyboard ke ID elemen
    if (key === "0") btnClick(document.getElementById('key-0'), '0');
    else if (/[1-9.]/.test(key)) btnClick(document.getElementById('key-' + key), key);
    else if (key === "+") btnClick(document.getElementById('key-+'), '+');
    else if (key === "-") btnClick(document.getElementById('key--'), '-');
    else if (key === "*" || key.toLowerCase() === "x") btnClick(document.getElementById('key-*'), '*');
    else if (key === "/" || key === ":") btnClick(document.getElementById('key-/'), '/');
    else if (key === "Enter") {
        e.preventDefault();
        btnClick(document.getElementById('key-Enter'), null);
        calculate();
    }
    else if (key === "Escape") {
        btnClick(document.getElementById('key-Escape'), null);
        clearDisplay();
    }
    else if (key === "Backspace") {
        display.value = display.value.slice(0, -1);
    }
});
