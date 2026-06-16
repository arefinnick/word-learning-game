// level.js
class WordLearningGame {
  constructor(levelId) {
    // Базовая проверка существования levelsData
    if (!levelsData) {
      console.error('Ошибка: данные уровней не загружены');
      levelId = 1; // Переходим на первый уровень
      this.levelData = levelsData[0];
    }

    // Проверка существования конкретного уровня
    const levelIndex = levelId - 1;
    if (!levelsData[levelIndex]) {
      console.warn(`Уровень ${levelId} не существует. Переход на первый уровень`);
      levelId = 1;
      levelIndex = 0;
    }

    this.levelId = levelId;
    this.totalLevels = 171; // Получаем значение из глобальной переменной
    this.levelData = levelsData[levelIndex];    

    // Инициализация DOM‑элементов
    try {
      this.yesBtn = document.getElementById('yes');
      this.noBtn = document.getElementById('no');
      this.engWordElement = document.getElementById('eng-word');
      this.rusWordElement = document.getElementById('rus-word');
      this.wordCounterElement = document.getElementById('word-counter');
      this.progressElements = document.querySelectorAll('#progres span');
      this.correctAnswer = '';

      // Простая проверка существования основных элементов
      if (!this.yesBtn || !this.noBtn) {
        console.error('Ошибка: не найдены кнопки управления');
        return;
      }

    } catch (error) {
      console.error('Ошибка при инициализации:', error);
      return;
    }

    this.currentWordIndex = 0; // Текущий индекс слова
    this.totalWords = this.levelData.words.length; // Общее количество слов    
    this.errors = 0;
    this.maxErrors = 3;
    this.previousWord = null; // Добавляем свойство для хранения предыдущего слова
    this.isPlaying = true;

    // Массив путей к изображениям
        this.livesImages = [
            './assets/images/3-lives.png',  // 0 ошибок (3 жёлтых)
            './assets/images/2-lives.png',  // 1 ошибка (2 жёлтых, 1 красный)
            './assets/images/1-live.png',  // 2 ошибки (1 жёлтый, 2 красных)
            './assets/images/0-lives.png'   // 3 ошибки (3 красных)
        ];
        
        // Получаем элемент для отображения жизней
        this.livesElement = document.getElementById('progres');
        
        // Устанавливаем начальное изображение
        this.updateLivesImage();

        // Загружаем настройки перед стартом уровня
      localforage.getItem('gameSettings').then(data => {
        // Сохраняем в свойство класса
        this.settings = data || {
            soundEnabled: true,
            soundVolume: 0.5,
            voiceEnabled: true,
            voiceVolume: 0.5
        };
    
        this.init(); // Инициализируем игру уже с настройками   

   });
   
   // Инициализируем отображение счетчика
    this.updateWordCounter();
    
  }

  init() {
    this.updateUI();
    this.showCurrentWord();
    this.setupEventListeners();
  }
  
  
  updateUI() {
    document.getElementById('level').textContent = `Уровень ${this.levelData.id}`;
    document.getElementById('thema').textContent = `Тема: ${this.levelData.theme}`;
  }

  // Обновление счётчика рус слов
  updateWordCounter() {
    // Проверяем, не вышли ли за пределы массива
    if (this.currentWordIndex > this.totalWords) {
      this.currentWordIndex = this.totalWords;
    }
    
    // Форматируем текст отображения
    const counterText = `${this.currentWordIndex + 1}/${this.totalWords} слов`;
    this.wordCounterElement.textContent = counterText;
  }

  resetCounter() {
    this.currentWordIndex = 0;
    this.updateWordCounter();
  }

  
  showCurrentWord() {
    if (this.currentWordIndex >= this.levelData.words.length) {
      this.endLevel(true);
      return;
    }

    const word = this.levelData.words[this.currentWordIndex];
    document.getElementById('rus-word').textContent = word.ru;
    this.playAudio(word.audioRu);
    setTimeout(() => {        
        this.generateRandomEnglishWord();
      }, 800);
    // this.generateRandomEnglishWord();
    this.correctAnswer = word.en;
    this.updateWordCounter(); // Обновляем счетчик при показе нового слова
  }

  generateRandomEnglishWord() {
    let randomWord;
    let randomIndex;
    
    do {
      randomIndex = Math.floor(Math.random() * this.levelData.words.length);
      randomWord = this.levelData.words[randomIndex];
    } while (randomWord.en === this.previousWord);

    // Добавляем задержку перед обновлением интерфейса
    setTimeout(() => {
        // Обновляем предыдущее слово
        this.previousWord = randomWord.en;
        
        // Отображаем новое слово
        this.engWordElement.textContent = randomWord.en;
        this.playAudio(randomWord.audioEn);
    }, 300);  // Задержка 1.5 секунды (можно настроить под свои нужды)
  }

  playAudio(audioPath) {
  // Создаем аудио-элемент
  const audio = new Audio(audioPath);

  // 1. Проверяем, разрешены ли звуки в настройках
  if (!this.settings.voiceEnabled) {
      console.log('Звуки отключены в настройках');
      return; // Выходим из функции, не воспроизводя звук
    }

    // 2. Устанавливаем громкость из настроек (значение от 0 до 1)
    audio.volume = this.settings.voiceVolume;

    // 3. Воспроизводим звук
    audio.play();
  }

      // Метод для обновления изображения жизней
    updateLivesImage() {
        // Проверяем границы
        const index = Math.min(this.errors, this.livesImages.length - 1);
        this.livesElement.src = this.livesImages[index];
    }

    
    playErrorSound() {
      // Создаем аудио-элемент
        const audio = new Audio('./assets/sounds/tr-dan.mp3');
        // 1. Проверяем, разрешены ли звуки в настройках
        if (!this.settings.soundEnabled) {
          console.log('Звуки отключены в настройках');
          return; // Выходим из функции, не воспроизводя звук
        }

          // 2. Устанавливаем громкость из настроек (значение от 0 до 1)
          audio.volume = this.settings.soundVolume;

          // 3. Воспроизводим звук
          audio.play();
    }
    

    playLevelVictory() {
        const audio = new Audio('./assets/sounds/level-victory.mp3');
        // 1. Проверяем, разрешены ли звуки в настройках
        if (!this.settings.soundEnabled) {
          console.log('Звуки отключены в настройках');
          return; // Выходим из функции, не воспроизводя звук
        }

          // 2. Устанавливаем громкость из настроек (значение от 0 до 1)
          audio.volume = this.settings.soundVolume;

          // 3. Воспроизводим звук
          audio.play();
    }
    

    playFunSound() {
        const audio = new Audio('./assets/sounds/porajenie--padayuschie-zvuki.mp3');
        // 1. Проверяем, разрешены ли звуки в настройках
        if (!this.settings.soundEnabled) {
          console.log('Звуки отключены в настройках');
          return; // Выходим из функции, не воспроизводя звук
        }

          // 2. Устанавливаем громкость из настроек (значение от 0 до 1)
          audio.volume = this.settings.soundVolume;

          // 3. Воспроизводим звук
          audio.play();
    }

    playSwitchButton() {
        const audio = new Audio('./assets/sounds/hluh.mp3');
        // 1. Проверяем, разрешены ли звуки в настройках
        if (!this.settings.soundEnabled) {
          console.log('Звуки отключены в настройках');
          return; // Выходим из функции, не воспроизводя звук
        }

          // 2. Устанавливаем громкость из настроек (значение от 0 до 1)
          audio.volume = this.settings.soundVolume;

          // 3. Воспроизводим звук
          audio.play();
    }

    playOffButton() {
        const audio = new Audio('./assets/sounds/hla.mp3');
        // 1. Проверяем, разрешены ли звуки в настройках
        if (!this.settings.soundEnabled) {
          console.log('Звуки отключены в настройках');
          return; // Выходим из функции, не воспроизводя звук
        }

          // 2. Устанавливаем громкость из настроек (значение от 0 до 1)
          audio.volume = this.settings.soundVolume;

          // 3. Воспроизводим звук
          audio.play();
    }

    // Обновляем метод обработки ошибок
    handleError() {
        if (this.errors < this.maxErrors) {
            this.errors++;
            this.updateLivesImage();
            this.updateProgress();
            this.playErrorSound();
        }
    }

  setupEventListeners() {

    // Обработчик для Yes___________________________________________________
    this.yesBtn.addEventListener('mousedown', () => {
      this.playSwitchButton();
      // Блокируем кнопку No
      this.noBtn.enabled = false;

      // Меняем картинку кнопки Yes
      if (this.correctAnswer === this.engWordElement.textContent) {
        this.yesBtn.querySelector('img').src = './assets/images/img_green.png';
      } else {
        this.yesBtn.querySelector('img').src = './assets/images/img_red.png';
        document.getElementById('tr-eng-word').textContent = this.correctAnswer; //подсказка
      }
    });
    // Обработчик для Yes тап
    this.yesBtn.addEventListener('touchstart', (e) => {
      e.preventDefault(); // предотвращаем стандартные действия браузера
      this.playSwitchButton();
      this.noBtn.enabled = false;

      // Меняем картинку кнопки Yes
      if (this.correctAnswer === this.engWordElement.textContent) {
        this.yesBtn.querySelector('img').src = './assets/images/img_green.png';
      } else {
        this.yesBtn.querySelector('img').src = './assets/images/img_red.png';
        document.getElementById('tr-eng-word').textContent = this.correctAnswer; // подсказка
      }
    });

    this.yesBtn.addEventListener('mouseup', () => {
      this.playOffButton();
      this.noBtn.enabled = true;
      // Возвращаем исходную картинку
      this.yesBtn.querySelector('img').src = './assets/images/img_yes.png';
      document.getElementById('tr-eng-word').textContent = ''; //скрываем подсазку

      // Логика обработки ответа
      if (this.correctAnswer !== this.engWordElement.textContent) {
        this.handleError();  // Обрабатываем ошибку
      }

      // Проверка завершения уровня
      if (this.currentWordIndex === this.levelData.words.length - 1 && this.errors === 0)
        {
          this.playLevelVictory();
          setTimeout(() => {        
        this.endLevel(true);
      }, 1200);
        } else if (this.currentWordIndex === this.levelData.words.length - 1 || this.errors >= 3)
        {
          this.playFunSound();
          setTimeout(() => {        
        this.endLevel(false);
      }, 1200);
        } else {
          if (this.correctAnswer !== this.engWordElement.textContent) {
            this.generateRandomEnglishWord();
          } else {
          this.currentWordIndex++;          
          this.showCurrentWord();
          }
        this.yesBtn.enabled = true;
        this.noBtn.enabled = true;
      }
    });
    this.yesBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.playOffButton();
      this.noBtn.enabled = true;
      // Возвращаем исходную картинку
      this.yesBtn.querySelector('img').src = './assets/images/img_yes.png';
      document.getElementById('tr-eng-word').textContent = ''; // скрываем подсказку

      // Логика обработки ответа
      if (this.correctAnswer !== this.engWordElement.textContent) {
        this.handleError(); // Обрабатываем ошибку
      }

      // Проверка завершения уровня
      if (this.currentWordIndex === this.levelData.words.length - 1 && this.errors === 0) {
        this.playLevelVictory();
        setTimeout(() => {
          this.endLevel(true);
        }, 1200);
      } else if (this.currentWordIndex === this.levelData.words.length - 1 || this.errors >= 3) {
        this.playFunSound();
        setTimeout(() => {
          this.endLevel(false);
        }, 1200);
      } else {
        if (this.correctAnswer !== this.engWordElement.textContent) {
          this.generateRandomEnglishWord();
        } else {
          this.currentWordIndex++;
          this.showCurrentWord();
        }
        this.yesBtn.enabled = true;
        this.noBtn.enabled = true;
      }
    });
    this.yesBtn.addEventListener('touchcancel', () => {
      // Восстанавливаем исходное состояние при прерывании касания
      this.yesBtn.querySelector('img').src = './assets/images/img_yes.png';
      this.noBtn.enabled = true;
    });

    // Обработчик для No__________________________________________________________
    this.noBtn.addEventListener('mousedown', () => {
      this.playSwitchButton();
      // Блокируем кнопку Yes
      this.yesBtn.enabled = false;

      // Меняем картинку кнопки No
      if (this.correctAnswer !== this.engWordElement.textContent) {
        this.noBtn.querySelector('img').src = './assets/images/img_green.png';
        
      } else {
        this.noBtn.querySelector('img').src = './assets/images/img_red.png';        
        document.getElementById('tr-eng-word').textContent = this.correctAnswer; //подсказка
      }
    });
    this.noBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.playSwitchButton();
      this.yesBtn.enabled = false;

      // Меняем картинку кнопки No
      if (this.correctAnswer !== this.engWordElement.textContent) {
        this.noBtn.querySelector('img').src = './assets/images/img_green.png';
      } else {
        this.noBtn.querySelector('img').src = './assets/images/img_red.png';
        document.getElementById('tr-eng-word').textContent = this.correctAnswer; // подсказка
      }
    });

    this.noBtn.addEventListener('mouseup', () => {
      this.playOffButton();
      this.yesBtn.enabled = true;
      // Возвращаем исходную картинку
      this.noBtn.querySelector('img').src = './assets/images/img_no.png';
      document.getElementById('tr-eng-word').textContent = ''; //скрываем подсазку

      // Логика обработки
      if (this.correctAnswer === this.engWordElement.textContent) {
        this.handleError();  // Обрабатываем ошибку
      }
      if (this.errors >= this.maxErrors) {
        this.playFunSound();
        // this.endLevel(false);
        setTimeout(() => {        
        this.endLevel(false);
      }, 1200);
      } else {
        if (this.correctAnswer !== this.engWordElement.textContent) {
          this.generateRandomEnglishWord();
          // this.playAudio(this.levelData.words[this.currentWordIndex].audio);
          } else {
            this.generateRandomEnglishWord();
            // this.playAudio(this.levelData.words[this.currentWordIndex].audio);
          }
        this.yesBtn.enabled = true;
        this.noBtn.enabled = true;
      }
    });
    this.noBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.playOffButton();
      this.yesBtn.enabled = true;
      // Возвращаем исходную картинку
      this.noBtn.querySelector('img').src = './assets/images/img_no.png';
      document.getElementById('tr-eng-word').textContent = ''; // скрываем подсказку

      // Логика обработки
      if (this.correctAnswer === this.engWordElement.textContent) {
        this.handleError(); // Обрабатываем ошибку
      }
      if (this.errors >= this.maxErrors) {
        this.playFunSound();
        setTimeout(() => {
          this.endLevel(false);
        }, 1200);
      } else {
        if (this.correctAnswer !== this.engWordElement.textContent) {
          this.generateRandomEnglishWord();
        } else {
          this.generateRandomEnglishWord();
        }
        this.yesBtn.enabled = true;
        this.noBtn.enabled = true;
      }
    });
    this.noBtn.addEventListener('touchcancel', () => {
      // Восстанавливаем исходное состояние при прерывании касания
      this.noBtn.querySelector('img').src = './assets/images/img_no.png';
      this.yesBtn.enabled = true;
    });
  }

  updateProgress() {
    this.progressElements.forEach((elem, index) => {
      if (index < this.errors) {
        elem.classList.add('error');
      }
    });
  }  

  restartLevel() {
    this.errors = 0;
    this.updateLivesImage();
    this.currentWordIndex = 0;
    this.previousWord = null;
    this.init();
  }
  

  // Сохранение прогресса через localForage
  async saveProgress() {
    try {
      // Получаем текущий прогресс
      const currentProgress = await localforage.getItem('completedLevels') || Array(this.totalLevels).fill(0);

        // Проверяем, что уровень существует
        if (this.levelId > 0 && this.levelId <= this.totalLevels) {
            currentProgress[this.levelId] = 1;
            
            await localforage.setItem('completedLevels', currentProgress);

            // Проверяем, пройден ли последний уровень.Переходим на следующий уровень
            this.transition();
            
        } else {
            console.error('Ошибка: попытка сохранить прогресс для несуществующего уровня');
        }

        console.log(`Сохранен прогресс для уровня ${this.levelId}:`, currentProgress);

        // Уведомляем родительское окно
        this.notifyParentAboutCompletion();        
  
        // Проверка сохраненных данных
        console.log('Сохранение прогресса:', currentProgress);
    } catch (error) {
        console.error('Ошибка сохранения прогресса:', error);
    }
  }

  // Метод для показа модального окна
  showCompletionModal() {
      const modal = document.createElement('div');
      modal.classList.add('completion-modal');
      
      modal.innerHTML = `
          <div class="modal-content">
              <h2>Поздравляем!</h2>
              <p>Вы прошли все уровни!</p>
              <button class="reset-btn">Начать заново</button>
              <button class="keep-btn">Сохранить прогресс</button>
          </div>
      `;
      
      document.body.appendChild(modal);
      
      // Обработчики кнопок
      const resetBtn = modal.querySelector('.reset-btn');
      const keepBtn = modal.querySelector('.keep-btn');
      
      resetBtn.addEventListener('click', () => {
          this.resetProgress();
          modal.remove();
      });
      
      keepBtn.addEventListener('click', () => {
          window.location.href = 'index.html';
          modal.remove();
      });
  }

  // Метод для сброса прогресса
  async resetProgress() {
      try {
          await localforage.clear();
          window.location.href = 'index.html'; // или другой URL вашей главной страницы
      } catch (error) {
          console.error('Ошибка сброса прогресса:', error);
      }
  }

    // Уведомление родительского окна о завершении уровня
    notifyParentAboutCompletion() {
        try {
            if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({
                    action: 'levelCompleted',
                    levelId: this.levelId
                }, '*');
                console.log('Отправлено уведомление о завершении уровня:', this.levelId);
                
            } else {
                console.warn('Родительское окно не найдено');
            }
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
        }
    }

    // Проверяем, пройден ли последний уровень
    transition() {
      if (this.levelId === this.totalLevels) {
                this.showCompletionModal();
            }else{         

              // Переходим на следующий уровень
            // window.location.href = `level.html?id=${this.levelId + 1}`;
            window.location.href = 'index.html';
            }
    }
             

    endLevel(isSuccess) {       
        this.isPlaying = false;
        
        if (isSuccess) {
          
            alert('Уровень пройден! Вы можете перейти на следующий уровень или пройти этот уровень ущё раз.');
            
            // Сохраняем прогресс
            this.saveProgress();
            
            // Уведомляем родительское окно
            this.notifyParentAboutCompletion();
            
        } else {
          
            alert('Уровень не пройден. Попробуйте ещё раз!');
            
            // this.restartLevel();
            window.location.href = `level.html?id=${this.levelId}`;
        }
        
    }
}

// Инициализация игры с обработкой ошибок
document.addEventListener('DOMContentLoaded', () => {
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let levelId = parseInt(urlParams.get('id')) || 1;

    console.log('Загружаем уровень:', levelId);

    // Проверка перед созданием экземпляра
    if (typeof levelsData === 'undefined' || !levelsData.length) {
      console.warn('Данные уровней отсутствуют. Переход на первый уровень');
      levelId = 1;
    }

    new WordLearningGame(levelId);
  } catch (error) {
    console.error('Ошибка при запуске игры:', error);
    // Переходим на первый уровень при любой критической ошибке
    window.location.href = 'level.html?id=1';
  }
});

// Добавляем отдельный обработчик сообщений
window.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'updateLevelProgress') {
    // Получаем данные из сообщения
    const levelId = event.data.levelId;
    const totalLevels = event.data.totalLevels;    
    
  }
});