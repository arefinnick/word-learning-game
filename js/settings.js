// settings.js

// Глобальный объект для хранения настроек
let settings = {
    soundEnabled: true,
    soundVolume: 0.5,
    voiceEnabled: true,
    voiceVolume: 0.5,
    bgImage: 'london03.png'
};

let isSaving = false; //flag

// Создаем глобальную переменную (доступна везде)
window.gameSettings = settings;

// Загрузка сохраненных настроек при загрузке страницы
// Обработчики вешаем ОДИН РАЗ при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    loadSettings() // Загружаем старые настройки
    .then(() => {
            setupEventListeners(); // Вешаем события ТОЛЬКО после того, как обновили UI
        });
});

// --- ФУНКЦИИ ---

async function loadSettings() {
    // Ждём, пока завершится сохранение (если идёт)
    while (isSaving) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Загружаем настройки
    const data = await localforage.getItem('gameSettings');
    if (data) {
        settings = data;
        updateUI();
    }

    // Затем загружаем статистику
    const progress = await localforage.getItem('completedLevels');
    if (progress) {
        const passed = progress.filter(level => level === 1).length;
        document.getElementById('levels-passed').textContent = passed;
    }
}
console.log('Начинаем обновлять UI...');
function updateUI() {
    document.getElementById('soundVolume').value = settings.soundVolume;
    document.getElementById('voiceVolume').value = settings.voiceVolume;    
    console.log('Громкость обновлена');

    // Берем значение из настроек, если его нет — ставим первый вариант по умолчанию
    const bgValue = settings.bgImage || 'london03.png'; // 'london03.png' — ваш дефолтный фон

    // Ищем элемент
    const radioEl = document.querySelector(`[name="bg-image"][value="${bgValue}"]`);

    if (radioEl) {
        radioEl.checked = true;
        // Добавляем смену фона
        document.getElementById('game-container').style.backgroundImage = `url('${getBackgroundImage(bgValue)}')`;
    } else {
        console.error('Ошибка: не найдена радиокнопка с value=', bgValue);
    }
}


function getBackgroundImage(imageName) {
    return `assets/bg-img/${imageName}`; // Путь от корня сайта
}
console.log('Начинаем вешать события...');
function setupEventListeners() {
    // Собираем все ползунки
    const sliders = document.querySelectorAll('input[type="range"]');
    const radio = document.querySelector('input[name="bg-image"]:checked');

    // Мгновенное обновление при изменении
    sliders.forEach(el => {
        el.addEventListener('input', async () => {
            settings[el.id] = parseFloat(el.value);

            // Включаем флаг сохранения
            isSaving = true;

            try {
                await localforage.setItem('gameSettings', settings);
                console.log('Громкость сохранена:', el.id, settings[el.id]);
            } catch (err) {
                console.error('Ошибка сохранения громкости:', err);
            } finally {
                // Всегда выключаем флаг после попытки сохранения
                isSaving = false;
            }
        });
    });

    // Для радио (картинка фона)
    document.querySelectorAll('input[name="bg-image"]').forEach(radio => {
        radio.addEventListener('change', async () => {
            settings.bgImage = radio.value;
        
            // Сразу применяем новый фон
            document.getElementById('game-container').style.backgroundImage = `url('${getBackgroundImage(settings.bgImage)}')`;

            // Включаем флаг сохранения
            isSaving = true;

            try {
                await localforage.setItem('gameSettings', settings);
                console.log('Фон сохранён:', settings.bgImage);
            } catch (err) {
                console.error('Ошибка сохранения фона:', err);
            } finally {
                // Всегда выключаем флаг
                isSaving = false;
            }
            
        });
    });

    // Кнопка сохранения (просто записывает в localforage)
    document.getElementById('save-settings').addEventListener('click', () => {
        localforage.setItem('gameSettings', settings).then(() => {
            alert('Настройки сохранены!');
            console.log('Настройки сохранены');
            window.location.href = 'index.html?';
        });
    });

    // Кнопка сброса настроек
    document.getElementById('reset-settings').addEventListener('click', () => {
        const confirmReset = confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?');
        if (confirmReset) {
            resetSettings();
        }
    });

    // Функция сброса настроек: очистка localforage и восстановление значений по умолчанию
    async function resetSettings() {
        // Ждём, пока завершится сохранение (если идёт)
        while (isSaving) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        try {
            // Очищаем всё хранилище localforage
            await localforage.clear();
            console.log('Хранилище очищено');

            // Восстанавливаем настройки по умолчанию
            settings = {
                soundEnabled: true,
                soundVolume: 0.5,
                voiceEnabled: true,
                voiceVolume: 0.5,
                bgImage: 'london03.png'
            };

            // Обновляем UI под новые настройки
            updateUI();

            // Сохраняем дефолтные настройки в localforage
            isSaving = true;
            await localforage.setItem('gameSettings', settings);
            console.log('Дефолтные настройки сохранены');

            alert('Настройки сброшены к значениям по умолчанию!');
        } catch (err) {
            console.error('Ошибка при сбросе настроек:', err);
            alert('Произошла ошибка при сбросе настроек. Проверьте консоль.');
        } finally {
            isSaving = false;
        }
    }
}