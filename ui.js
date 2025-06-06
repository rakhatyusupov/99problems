window.AppState = {
  params: {
    userText: "Hello", // текст для отображения в p5
    grainAmp: 0.1, // амплитуда зерна (будет передаваться в шейдер)
    showImage: true, // флаг: рисовать ли картинку
    imageSize: 100, // размер картинки в пикселях
    fontSize: 24, // размер текста
  },
  setParam(key, value) {
    this.params[key] = value;
  },
};

// 2) Дожидаемся, когда DOM загрузится, и создаём саму панель UI.
document.addEventListener("DOMContentLoaded", () => {
  // --- Кнопка показа/скрытия панели ---
  const btn = document.createElement("button");
  btn.id = "toggleButton";
  btn.innerText = "⚙️";
  document.body.appendChild(btn);

  // --- Overlay с настройками ---
  const overlay = document.createElement("div");
  overlay.id = "settingsOverlay";

  // Заголовок
  const title = document.createElement("h2");
  title.innerText = "Настройки";
  overlay.appendChild(title);

  // 3) Поле ввода текста
  {
    const label = document.createElement("label");
    label.innerText = "Text to draw:";
    const input = document.createElement("input");
    input.type = "text";
    input.value = window.AppState.params.userText;
    input.addEventListener("input", (e) => {
      window.AppState.setParam("userText", e.target.value);
    });
    label.appendChild(input);
    overlay.appendChild(label);
  }

  // 4) Слайдер grainAmp (от 0 до 1)
  {
    const label = document.createElement("label");
    label.innerText = "Grain amplitude:";
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "1";
    input.step = "0.01";
    input.value = window.AppState.params.grainAmp;
    input.addEventListener("input", (e) => {
      window.AppState.setParam("grainAmp", parseFloat(e.target.value));
    });
    label.appendChild(input);
    overlay.appendChild(label);
  }

  // 5) Поле для размера картинки (число)
  {
    const label = document.createElement("label");
    label.innerText = "Image size:";
    const input = document.createElement("input");
    input.type = "number";
    input.min = "10";
    input.max = "500";
    input.step = "1";
    input.value = window.AppState.params.imageSize;
    input.addEventListener("input", (e) => {
      window.AppState.setParam("imageSize", parseInt(e.target.value));
    });
    label.appendChild(input);
    overlay.appendChild(label);
  }

  // 6) Слайдер размера шрифта для текста
  {
    const label = document.createElement("label");
    label.innerText = "Font size:";
    const input = document.createElement("input");
    input.type = "range";
    input.min = "12";
    input.max = "200";
    input.step = "1";
    input.value = window.AppState.params.fontSize;
    input.addEventListener("input", (e) => {
      window.AppState.setParam("fontSize", parseInt(e.target.value));
    });
    label.appendChild(input);
    overlay.appendChild(label);
  }

  // 7) Чекбокс "Show image"
  {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = window.AppState.params.showImage;
    input.addEventListener("change", (e) => {
      window.AppState.setParam("showImage", e.target.checked);
    });
    label.appendChild(input);
    label.insertAdjacentText("beforeend", " Show image");
    overlay.appendChild(label);
  }

  document.body.appendChild(overlay);

  // 8) Логика показа/скрытия overlay
  btn.addEventListener("click", () => {
    const visible = overlay.style.display === "block";
    overlay.style.display = visible ? "none" : "block";
  });
});
