// index.js
const totalLevels = 3; // общее количество уровней

// Массив прогресса (хранит состояние: пройден/не пройден)
// 0 — не пройден (с замком), 1 — пройден (без замка)
let levelProgress = Array(totalLevels).fill(0);
levelProgress[0] = 1; // Явно указываем, что 1-й уровень пройден (индекс 0)



// Функция загрузки и сохранения прогресса 
async function saveProgress() {
    try {
        await localforage.setItem('completedLevels', levelProgress);
        console.log('Прогресс сохранен:', levelProgress);
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
}

async function loadProgress() {
    try {
        // Пытаемся загрузить сохраненный прогресс
        const savedProgress = await localforage.getItem('completedLevels');
        console.log('Загруженный прогресс:', savedProgress);

        if (savedProgress) {
            levelProgress = savedProgress;
            levelProgress[0] = 1;
        } else {
            // Если нет сохраненного прогресса, создаем новый
            levelProgress = Array(totalLevels).fill(0);
            levelProgress[0] = 1; // Первый уровень всегда открыт
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        // levelProgress = Array(totalLevels).fill(0);
        // levelProgress[0] = 1;
    }
}

// Генерация доски
function createBoard() {
    const board = document.getElementById('board');
    if (!board) {
        console.error('Элемент #board не найден!');
        return;
    }
    board.innerHTML = '';

    // Создаём ячейки
    for (let row = 0; row < totalLevels; row++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.level = row + 1; // сохраняем номер уровня

        // 1. Добавляем номер уровня
        const levelNumber = document.createElement('span');
        levelNumber.className = 'level-number';
        levelNumber.textContent = row + 1;
        cell.appendChild(levelNumber);

        // 2. Добавляем иконку замка, если уровень не пройден
        if (levelProgress[row] === 0) {
            const lockIcon = document.createElement('img');
            lockIcon.className = 'lock-icon';
            lockIcon.src = './assets/images/lock.png'; // путь к картинке замка
            lockIcon.alt = 'Заблокировано';
            lockIcon.title = 'Заблокировано';
            cell.appendChild(lockIcon);
        }

        // 3. Добавляем обработчик клика
        cell.addEventListener('click', handleCellClick);

        board.appendChild(cell);
    }
}

// Функция обработки клика по кнопке
function handleCellClick(event) {
    const cell = event.target.closest('.cell');
    const levelId = parseInt(cell.dataset.level);

    // Проверяем, пройден ли уровень (нет ли замка)
    if (levelProgress[levelId - 1] === 0) {
        alert('Уровень заблокирован. Пройдите предыдущие уровни!');
        return; // останавливаем выполнение
    } else {
        // Если уровень пройден — переходим на страницу уровня
        window.location.href = `level.html?id=${levelId}`;
    }
}

// Функция отметки уровня как пройденного
function markLevelAsCompleted(levelId) {
    levelProgress[levelId - 1] = 1;
    
    // Сохраняем изменения
    saveProgress();
    
    // Перерисовываем доску, чтобы убрать замок
    createBoard();
}

// Инициализация игры
async function initGame() {
    try {
        await loadProgress();
        console.log('Прогресс после загрузки:', levelProgress);
        createBoard();
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }

    // localforage.clear().then(() => {
    //     console.log('Хранилище очищено');
    // });
    
}

// Добавляем обработчик сообщений
window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'levelCompleted') {
        const levelId = event.data.levelId;

        console.log(`Получено уведомление о завершении уровня ${levelId}`);
        
        // Обновляем прогресс
        if (levelId > 0 && levelId <= totalLevels) {
            levelProgress[levelId ] = 1;
        
            // Сохраняем изменения
            saveProgress();
            
            // Перерисовываем доску уровней
            createBoard();

            console.log('Получено сообщение о завершении уровня:', levelId);

        } else {
            console.error('Неверный ID уровня:', levelId);
        }

        // Отправляем данные в level.js
        levelWindow.postMessage({
            action: 'updateLevelProgress',
            levelId: event.data.levelId,
            totalLevels: totalLevels  // <--- Добавляем сюда
        }, '*');
    }
    
});


// Запускаем игру при загрузке страницы
window.addEventListener('DOMContentLoaded', initGame);