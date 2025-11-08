// ==========================================
// TEXEL AI Chat Bot with DeepSeek R1
// Безопасная версия с загрузкой конфига
// ==========================================

if (!OPENROUTER_API_KEY) {
  OPENROUTER_API_KEY = prompt(
    "Вставь сюда API ключ [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]"
  );
  if (OPENROUTER_API_KEY) {
    localStorage.setItem("OPENROUTER_API_KEY", OPENROUTER_API_KEY);
    alert("✅ Ключ сохранён! Теперь чат готов к работе.");
  } else {
    alert("❌ Ключ не введён — чат не сможет работать.");
  }
}

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-r1'; // DeepSeek R1

let chatMessages, chatInput, sendButton, chatHint, stopButton;
let conversationHistory = [];
let currentAbortController = null; // Контроллер для отмены запроса

// ==========================================
// УПРАВЛЕНИЕ ИСТОРИЕЙ ЧАТОВ
// ==========================================

let chats = []; // Массив всех чатов
let currentChatId = null; // ID текущего чата

// Загрузка чатов из localStorage при запуске
function loadChatsFromStorage() {
  const savedChats = localStorage.getItem('texel_chats');
  if (savedChats) {
    chats = JSON.parse(savedChats);
  }
  
  // Если нет чатов, создаем первый
  if (chats.length === 0) {
    createNewChat();
  } else {
    // Загружаем последний чат
    currentChatId = chats[0].id;
    loadChat(currentChatId);
  }
  
  renderChatList();
}

// Сохранение чатов в localStorage
function saveChatsToStorage() {
  localStorage.setItem('texel_chats', JSON.stringify(chats));
}

// Создание нового чата
function createNewChat() {
  const newChat = {
    id: Date.now().toString(),
    title: 'Новый чат',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  chats.unshift(newChat); // Добавляем в начало
  currentChatId = newChat.id;
  
  // Очищаем окно чата
  chatMessages.innerHTML = '';
  conversationHistory = [];
  
  // Добавляем приветствие
  addBotMessage(`Привет! 👋 Я TEXEL ИИ-ассистент на базе DeepSeek R1.

Я могу помочь тебе:
• Объяснить термины из ИИ простыми словами
• Посоветовать подходящие методички
• Помочь с промт-дизайном
• Решить сложные задачи и дать подробные объяснения

Задавай любые вопросы! 😊`, false);
  
  saveChatsToStorage();
  renderChatList();
}

// Загрузка чата
function loadChat(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  
  currentChatId = chatId;
  chatMessages.innerHTML = '';
  conversationHistory = [];
  
  // Загружаем сообщения
  chat.messages.forEach((msg, index) => {
    if (msg.role === 'user') {
      addUserMessage(msg.content, false); // false = не сохранять
    } else {
      addBotMessage(msg.content, false);
    }
    
    // Восстанавливаем историю для контекста
    if (msg.role === 'user') {
      const nextMsg = chat.messages[index + 1];
      if (nextMsg && nextMsg.role === 'assistant') {
        conversationHistory.push({
          user: msg.content,
          bot: nextMsg.content
        });
      }
    }
  });
  
  renderChatList();
}

// Удаление чата
function deleteChat(chatId, event) {
  event.stopPropagation(); // Не переключаться на чат при удалении
  
  if (!confirm('Удалить этот чат?')) return;
  
  chats = chats.filter(c => c.id !== chatId);
  
  // Если удалили текущий чат
  if (currentChatId === chatId) {
    if (chats.length > 0) {
      loadChat(chats[0].id);
    } else {
      createNewChat();
    }
  }
  
  saveChatsToStorage();
  renderChatList();
}

// Обновление заголовка чата
function updateChatTitle(chatId, firstMessage) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  
  // Используем первое сообщение как заголовок (обрезаем до 40 символов)
  if (chat.title === 'Новый чат' && firstMessage) {
    chat.title = firstMessage.length > 40 
      ? firstMessage.substring(0, 40) + '...' 
      : firstMessage;
    
    saveChatsToStorage();
    renderChatList();
  }
}

// Сохранение сообщения в текущий чат
function saveMessageToChat(role, content) {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  chat.messages.push({
    role: role,
    content: content,
    timestamp: new Date().toISOString()
  });
  
  chat.updatedAt = new Date().toISOString();
  
  // Обновляем заголовок чата первым сообщением пользователя
  if (role === 'user' && chat.messages.filter(m => m.role === 'user').length === 1) {
    updateChatTitle(currentChatId, content);
  }
  
  saveChatsToStorage();
}

// Отрисовка списка чатов
function renderChatList() {
  const chatList = document.getElementById('chatList');
  if (!chatList) return;
  
  if (chats.length === 0) {
    chatList.innerHTML = `
      <div class="chat-list-empty">
        <div class="chat-list-empty-icon">💬</div>
        <p>Нет чатов.<br>Создай новый!</p>
      </div>
    `;
    return;
  }
  
  chatList.innerHTML = chats.map(chat => {
    const lastUserMessage = chat.messages.find(m => m.role === 'user');
    const preview = lastUserMessage 
      ? lastUserMessage.content.substring(0, 50) + (lastUserMessage.content.length > 50 ? '...' : '')
      : 'Пустой чат';
    
    const date = new Date(chat.updatedAt);
    const dateStr = formatChatDate(date);
    
    return `
      <div class="chat-item ${chat.id === currentChatId ? 'active' : ''}" 
           onclick="loadChat('${chat.id}')">
        <h4 class="chat-item-title">${escapeHtml(chat.title)}</h4>
        <p class="chat-item-preview">${escapeHtml(preview)}</p>
        <p class="chat-item-date">${dateStr}</p>
        <button class="chat-item-delete" onclick="deleteChat('${chat.id}', event)" title="Удалить чат">
          ✕
        </button>
      </div>
    `;
  }).join('');
}

// Форматирование даты для чата
function formatChatDate(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } else if (days > 0) {
    return days === 1 ? 'Вчера' : `${days} дн. назад`;
  } else if (hours > 0) {
    return `${hours} ч. назад`;
  } else if (minutes > 0) {
    return `${minutes} мин. назад`;
  } else {
    return 'Только что';
  }
}

// Очистка всей истории
function clearAllHistory() {
  if (!confirm('Удалить ВСЕ чаты? Это действие нельзя отменить!')) return;
  
  chats = [];
  localStorage.removeItem('texel_chats');
  createNewChat();
}

// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================

async function initChat() {
  // ВАЖНО: Загружаем конфиг ПЕРВЫМ ДЕЛОМ
  await loadConfig();
  
  chatMessages = document.querySelector('.chat-messages');
  chatInput = document.querySelector('.chat-input');
  sendButton = document.querySelector('.chat-send-btn');
  chatHint = document.querySelector('.chat-hint');
  stopButton = document.getElementById('stopBtn');
  
  const newChatBtn = document.getElementById('newChatBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  
  if (!chatMessages || !chatInput || !sendButton) {
    console.error('Элементы чата не найдены');
    return;
  }
  
  // Загружаем чаты из localStorage
  loadChatsFromStorage();
  
  // Включаем интерфейс
  chatInput.disabled = false;
  sendButton.disabled = false;
  chatInput.placeholder = 'Спроси про ИИ, методички или промт-дизайн…';
  
  if (chatHint) {
    chatHint.textContent = '✨ Чат с DeepSeek R1 работает!';
    chatHint.style.color = '#10b981';
  }
  
  // События
  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Кнопка остановки
  if (stopButton) {
    stopButton.addEventListener('click', stopGeneration);
  }
  
  // Кнопка нового чата
  if (newChatBtn) {
    newChatBtn.addEventListener('click', createNewChat);
  }
  
  // Кнопка очистки истории
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearAllHistory);
  }
  
  // Горячая клавиша Escape для остановки
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentAbortController) {
      stopGeneration();
    }
  });
}

// ==========================================
// ОСТАНОВКА ГЕНЕРАЦИИ
// ==========================================

function stopGeneration() {
  if (currentAbortController) {
    console.log('🛑 Остановка генерации...');
    currentAbortController.abort();
    currentAbortController = null;
    
    // Убираем индикатор печати
    const typingIndicators = document.querySelectorAll('.typing-indicator');
    typingIndicators.forEach(indicator => indicator.remove());
    
    // Разблокируем UI
    setLoading(false);
    
    // Показываем сообщение об остановке
    addBotMessage('⏸️ Генерация остановлена.');
  }
}

// ==========================================
// ОТПРАВКА СООБЩЕНИЯ
// ==========================================

async function sendMessage() {
  const userMessage = chatInput.value.trim();
  
  if (!userMessage) return;
  
  // Проверка API ключа
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === '') {
    addBotMessage('⚠️ Ошибка: OpenRouter API ключ не загружен.\n\n1. Создай файл config.js\n2. Добавь туда: export const OPENROUTER_API_KEY = "твой-ключ";\n3. Получи ключ на openrouter.ai/settings/keys\n4. Добавь config.js в .gitignore');
    return;
  }
  
  addUserMessage(userMessage);
  chatInput.value = '';
  
  // Создаём контроллер для возможности отмены запроса
  currentAbortController = new AbortController();
  
  setLoading(true);
  const typingId = showTypingIndicator();
  
  try {
    // Строим сообщения с контекстом
    const messages = [
      {
        role: 'system',
        content: `Ты — TEXEL, дружелюбный русскоязычный ИИ-ассистент образовательного центра "Центр ИИ-инноваций".

Твоя задача:
- Объяснять термины из искусственного интеллекта простыми словами
- Помогать с промт-инженерингом и методичками
- Отвечать ПОНЯТНО и КРАТКО (3-6 предложений), по-русски
- Использовать эмодзи для наглядности
- Быть дружелюбным и поддерживающим

Правила:
- Если не знаешь — честно признайся
- Объясняй сложное через аналогии и примеры
- Не используй сложные термины без объяснения
- Отвечай по существу, без лишних слов`
      }
    ];
    
    // Добавляем последние 3 сообщения из истории для контекста
    conversationHistory.slice(-3).forEach(msg => {
      messages.push({
        role: 'user',
        content: msg.user
      });
      messages.push({
        role: 'assistant',
        content: msg.bot
      });
    });
    
    // Добавляем текущий вопрос
    messages.push({
      role: 'user',
      content: userMessage
    });
    
    console.log('📤 Отправка запроса к DeepSeek R1...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'TEXEL Chat Bot'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      }),
      signal: currentAbortController.signal // Добавляем сигнал для отмены
    });
    
    console.log('📥 Статус ответа:', response.status);
    
    // Проверка на ошибки
    if (!response.ok) {
      removeTypingIndicator(typingId);
      setLoading(false);
      currentAbortController = null;
      
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Ошибка API:', errorData);
      
      if (response.status === 429) {
        addBotMessage('⏰ Превышен лимит запросов. Подожди 30-60 секунд и попробуй снова.\n\n💡 Совет: DeepSeek R1 - популярная модель, иногда бывает перегружена.');
      } else if (response.status === 402) {
        addBotMessage('💳 Недостаточно кредитов. DeepSeek R1 - платная модель.\n\nПополни баланс на openrouter.ai/credits или используй бесплатные модели.');
      } else if (response.status === 400) {
        addBotMessage('😔 Ошибка запроса. Проверь, что API ключ правильный.');
      } else if (response.status === 401 || response.status === 403) {
        addBotMessage('🔑 API ключ неверный или истёк. Проверь ключ на openrouter.ai/settings/keys');
      } else {
        addBotMessage(`😔 Ошибка ${response.status}. Смотри консоль (F12) для деталей.\n\n${errorData.error?.message || ''}`);
      }
      return;
    }
    
    // Парсим успешный ответ
    const data = await response.json();
    console.log('✅ Ответ получен:', data);
    
    // Убираем индикатор и разблокируем UI
    removeTypingIndicator(typingId);
    setLoading(false);
    currentAbortController = null;
    
    if (data.choices && data.choices[0]?.message?.content) {
      let botReply = data.choices[0].message.content.trim();
      
      // DeepSeek R1 иногда добавляет теги <think>, убираем их
      botReply = botReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      
      addBotMessage(botReply);
      
      conversationHistory.push({
        user: userMessage,
        bot: botReply
      });
      
      // Ограничиваем историю 10 сообщениями
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }
      
    } else {
      addBotMessage('Извини, не смог сформулировать ответ. Попробуй переформулировать вопрос.');
      console.error('⚠️ Неожиданный формат ответа:', data);
    }
    
  } catch (error) {
    // Проверяем, была ли это отмена пользователем
    if (error.name === 'AbortError') {
      console.log('🛑 Запрос отменён пользователем');
      // Индикатор и UI уже обработаны в stopGeneration()
      return;
    }
    
    // Обычная ошибка сети
    removeTypingIndicator(typingId);
    setLoading(false);
    currentAbortController = null;
    
    console.error('❌ Ошибка сети:', error);
    addBotMessage('😔 Ошибка соединения. Проверь:\n• Интернет подключен\n• API ключ правильный\n• Консоль браузера (F12) для деталей');
  }
}

// ==========================================
// UI ФУНКЦИИ
// ==========================================

function addUserMessage(text, shouldSave = true) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg msg-user';
  msgDiv.innerHTML = `
    <div class="msg-meta">
      <span class="msg-role-user">Ты</span>
      <span class="msg-time">${getCurrentTime()}</span>
    </div>
    <div class="msg-bubble">${escapeHtml(text)}</div>
  `;
  chatMessages.appendChild(msgDiv);
  scrollToBottom();
  
  // Сохраняем в историю чата
  if (shouldSave) {
    saveMessageToChat('user', text);
  }
}

function addBotMessage(text, shouldSave = true) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg msg-bot';
  msgDiv.innerHTML = `
    <div class="msg-meta">
      <span class="msg-role-bot">TEXEL · ИИ-ассистент</span>
      <span class="msg-time">${getCurrentTime()}</span>
    </div>
    <div class="msg-bubble">${formatMessage(text)}</div>
  `;
  chatMessages.appendChild(msgDiv);
  scrollToBottom();
  
  // Сохраняем в историю чата
  if (shouldSave) {
    saveMessageToChat('assistant', text);
  }
}

function showTypingIndicator() {
  const id = 'typing-' + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.id = id;
  typingDiv.className = 'msg msg-bot typing-indicator';
  typingDiv.innerHTML = `
    <div class="msg-meta">
      <span class="msg-role-bot">TEXEL печатает</span>
    </div>
    <div class="msg-bubble">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  scrollToBottom();
  return id;
}

function removeTypingIndicator(id) {
  const indicator = document.getElementById(id);
  if (indicator) {
    indicator.remove();
    console.log('✅ Индикатор печати удалён:', id);
  }
}

function setLoading(isLoading) {
  sendButton.disabled = isLoading;
  chatInput.disabled = isLoading;
  sendButton.textContent = isLoading ? '⏳ Думаю...' : 'Отправить';
  
  // Управление видимостью кнопок
  if (stopButton) {
    stopButton.style.display = isLoading ? 'block' : 'none';
  }
  
  if (isLoading) {
    sendButton.style.display = 'none'; // Прячем кнопку отправить
  } else {
    sendButton.style.display = 'block'; // Показываем кнопку отправить
  }
  
  // Визуальное состояние
  if (isLoading) {
    chatInput.style.opacity = '0.6';
  } else {
    chatInput.style.opacity = '1';
  }
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

function formatMessage(text) {
  return escapeHtml(text)
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==========================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ
// ==========================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}

console.log('✅ TEXEL Chat Bot загружен. Используется DeepSeek R1.');
console.log('💡 Нажми Escape для остановки генерации');