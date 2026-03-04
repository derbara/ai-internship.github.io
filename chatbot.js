// ==========================================
// 🔑 OpenRouter API KEY — загружается из localStorage
// ==========================================
let OPENROUTER_API_KEY = localStorage.getItem("OPENROUTER_API_KEY");

function ensureApiKey() {
  if (OPENROUTER_API_KEY) return true;
  return false;
}

// options.showCancel — показать кнопку «Отмена» (при смене ключа)
// options.oldKey — предыдущий ключ для восстановления при отмене
function showApiKeyScreen(options) {
  options = options || {};
  var chatWrapper = document.querySelector('.chat-wrapper');
  if (!chatWrapper) return;

  var chatWindow = chatWrapper.querySelector('.chat-window');
  if (chatWindow) chatWindow.style.display = 'none';

  var screen = document.createElement('div');
  screen.className = 'apikey-screen';
  screen.id = 'apikeyScreen';

  var cancelBtnHtml = options.showCancel
    ? '<button class="apikey-cancel" id="apikeyCancel">Отмена</button>'
    : '';

  screen.innerHTML =
    '<div class="apikey-card">' +
      '<div class="apikey-icon">🔑</div>' +
      '<h2 class="apikey-title">Подключи ИИ-ассистента</h2>' +
      '<p class="apikey-desc">Для работы чат-бота нужен API-ключ OpenRouter. Это бесплатно и занимает 2 минуты.</p>' +

      '<div class="apikey-steps">' +
        '<div class="apikey-step">' +
          '<span class="apikey-step-num">1</span>' +
          '<div class="apikey-step-text">' +
            '<strong>Зарегистрируйся</strong> на <a href="https://openrouter.ai/" target="_blank" rel="noopener">openrouter.ai</a> (вход через Google)' +
          '</div>' +
        '</div>' +
        '<div class="apikey-step">' +
          '<span class="apikey-step-num">2</span>' +
          '<div class="apikey-step-text">' +
            '<strong>Создай ключ</strong> в разделе <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">Keys</a> — нажми «Create Key»' +
          '</div>' +
        '</div>' +
        '<div class="apikey-step">' +
          '<span class="apikey-step-num">3</span>' +
          '<div class="apikey-step-text">' +
            '<strong>Скопируй ключ</strong> (начинается с <code>sk-or-...</code>) и вставь ниже' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="apikey-input-group">' +
        '<input type="password" class="apikey-input" id="apikeyInput" placeholder="sk-or-v1-..." autocomplete="off" spellcheck="false" />' +
        '<button class="apikey-toggle-vis" id="apikeyToggle" type="button" title="Показать/скрыть">👁</button>' +
      '</div>' +
      '<div class="apikey-error" id="apikeyError"></div>' +
      '<div class="apikey-buttons">' +
        '<button class="apikey-submit" id="apikeySubmit">Подключить чат-бот</button>' +
        cancelBtnHtml +
      '</div>' +

      '<p class="apikey-hint">Ключ хранится только в твоём браузере и не передаётся на наш сервер.</p>' +
    '</div>';

  chatWrapper.appendChild(screen);

  var input = document.getElementById('apikeyInput');
  var submit = document.getElementById('apikeySubmit');
  var toggle = document.getElementById('apikeyToggle');
  var error = document.getElementById('apikeyError');

  toggle.addEventListener('click', function() {
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  function trySubmitKey() {
    var key = input.value.trim();
    if (!key) {
      error.textContent = 'Введи API-ключ';
      error.style.display = 'block';
      return;
    }
    if (!key.startsWith('sk-')) {
      error.textContent = 'Ключ должен начинаться с sk-';
      error.style.display = 'block';
      return;
    }
    error.style.display = 'none';
    OPENROUTER_API_KEY = key;
    localStorage.setItem('OPENROUTER_API_KEY', key);

    screen.remove();
    if (chatWindow) chatWindow.style.display = 'flex';
    if (!chatInitialized) {
      chatInitialized = true;
      initChat();
    }
  }

  submit.addEventListener('click', trySubmitKey);
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') trySubmitKey();
  });

  // Кнопка «Отмена» — восстановить предыдущий ключ и вернуться в чат
  if (options.showCancel) {
    var cancelBtn = document.getElementById('apikeyCancel');
    cancelBtn.addEventListener('click', function() {
      if (options.oldKey) {
        OPENROUTER_API_KEY = options.oldKey;
        localStorage.setItem('OPENROUTER_API_KEY', options.oldKey);
        chatInitialized = true;
      }
      screen.remove();
      if (chatWindow) chatWindow.style.display = 'flex';
    });
  }

  input.focus();
}

function changeApiKey() {
  var oldKey = OPENROUTER_API_KEY;

  var chatWindow = document.querySelector('.chat-window');
  if (chatWindow) chatWindow.style.display = 'none';

  var oldScreen = document.getElementById('apikeyScreen');
  if (oldScreen) oldScreen.remove();

  showApiKeyScreen({ showCancel: true, oldKey: oldKey });
}

// ==========================================
// НАСТРОЙКИ API
// ==========================================
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-r1"; // DeepSeek R1

let chatMessages, chatInput, sendButton, chatHint, stopButton;
let conversationHistory = [];
let currentAbortController = null;

// ==========================================
// УПРАВЛЕНИЕ ЧАТАМИ
// ==========================================
let chats = [];
let currentChatId = null;

function loadChatsFromStorage() {
  const savedChats = localStorage.getItem("texel_chats");
  if (savedChats) chats = JSON.parse(savedChats);

  if (chats.length === 0) createNewChat();
  else {
    currentChatId = chats[0].id;
    loadChat(currentChatId);
  }
  renderChatList();
}

function saveChatsToStorage() {
  localStorage.setItem("texel_chats", JSON.stringify(chats));
}

function createNewChat() {
  const newChat = {
    id: Date.now().toString(),
    title: "Новый чат",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  chats.unshift(newChat);
  currentChatId = newChat.id;
  
  if (chatMessages) {
    chatMessages.innerHTML = "";
  }
  
  conversationHistory = [];

  addBotMessage(
    `Привет! 👋 Я TEXEL — ИИ-ассистент на базе DeepSeek R1.

Я могу помочь тебе:
• Объяснить термины из ИИ простыми словами  
• Посоветовать подходящие методички  
• Помочь с промт-дизайном  
• Решить сложные задачи и дать объяснения

Задавай любые вопросы! 😊`,
    false
  );

  saveChatsToStorage();
  renderChatList();
}

function loadChat(chatId) {
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return;

  currentChatId = chatId;
  
  if (chatMessages) {
    chatMessages.innerHTML = "";
  }
  
  conversationHistory = [];

  chat.messages.forEach((msg, index) => {
    if (msg.role === "user") addUserMessage(msg.content, false);
    else addBotMessage(msg.content, false);

    if (msg.role === "user") {
      const nextMsg = chat.messages[index + 1];
      if (nextMsg && nextMsg.role === "assistant") {
        conversationHistory.push({ user: msg.content, bot: nextMsg.content });
      }
    }
  });

  renderChatList();
}

function deleteChat(chatId, event) {
  event.stopPropagation();
  if (!confirm("Удалить этот чат?")) return;

  chats = chats.filter((c) => c.id !== chatId);
  if (currentChatId === chatId) {
    if (chats.length > 0) loadChat(chats[0].id);
    else createNewChat();
  }
  saveChatsToStorage();
  renderChatList();
}

function updateChatTitle(chatId, firstMessage) {
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return;

  if (chat.title === "Новый чат" && firstMessage) {
    chat.title =
      firstMessage.length > 40
        ? firstMessage.substring(0, 40) + "..."
        : firstMessage;
    saveChatsToStorage();
    renderChatList();
  }
}

function saveMessageToChat(role, content) {
  const chat = chats.find((c) => c.id === currentChatId);
  if (!chat) return;

  chat.messages.push({
    role,
    content,
    timestamp: new Date().toISOString(),
  });
  chat.updatedAt = new Date().toISOString();

  if (
    role === "user" &&
    chat.messages.filter((m) => m.role === "user").length === 1
  )
    updateChatTitle(currentChatId, content);

  saveChatsToStorage();
}

function renderChatList() {
  const chatList = document.getElementById("chatList");
  if (!chatList) return;

  if (chats.length === 0) {
    chatList.innerHTML = `
      <div class="chat-list-empty">
        <div class="chat-list-empty-icon">💬</div>
        <p>Нет чатов.<br>Создай новый!</p>
      </div>`;
    return;
  }

  chatList.innerHTML = chats
    .map((chat) => {
      const lastUserMessage = chat.messages.find((m) => m.role === "user");
      const preview = lastUserMessage
        ? lastUserMessage.content.substring(0, 50) +
          (lastUserMessage.content.length > 50 ? "..." : "")
        : "Пустой чат";
      const dateStr = formatChatDate(new Date(chat.updatedAt));

      return `
        <div class="chat-item ${
          chat.id === currentChatId ? "active" : ""
        }" onclick="loadChat('${chat.id}')">
          <h4 class="chat-item-title">${escapeHtml(chat.title)}</h4>
          <p class="chat-item-preview">${escapeHtml(preview)}</p>
          <p class="chat-item-date">${dateStr}</p>
          <button class="chat-item-delete" onclick="deleteChat('${chat.id}', event)" title="Удалить чат">✕</button>
        </div>`;
    })
    .join("");
}

function formatChatDate(date) {
  const diff = Date.now() - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 7)
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  if (days > 0) return days === 1 ? "Вчера" : `${days} дн. назад`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} ч. назад`;
  const minutes = Math.floor(diff / (1000 * 60));
  return minutes > 0 ? `${minutes} мин. назад` : "Только что";
}

function clearAllHistory() {
  if (!confirm("Удалить ВСЕ чаты? Это действие нельзя отменить!")) return;
  chats = [];
  localStorage.removeItem("texel_chats");
  createNewChat();
}

function stopGeneration() {
  if (currentAbortController) {
    console.log('🛑 Остановка генерации...');
    currentAbortController.abort();
    currentAbortController = null;
    
    const typingIndicators = document.querySelectorAll('.typing-indicator');
    typingIndicators.forEach(indicator => indicator.remove());
    
    setLoading(false);
    addBotMessage('⏸️ Генерация остановлена.');
  }
}

// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================
async function initChat() {
  chatMessages = document.querySelector(".chat-messages");
  chatInput = document.querySelector(".chat-input");
  sendButton = document.querySelector(".chat-send-btn");
  chatHint = document.querySelector(".chat-hint");
  stopButton = document.getElementById("stopBtn");

  // 🔹 ИСПРАВЛЕНО: Ищем кнопки по всем возможным вариантам
  const newChatBtn = document.getElementById("newChatBtn") || 
                     document.querySelector(".chat-add-btn") ||
                     document.querySelector('[onclick*="createNewChat"]');
                     
  const clearHistoryBtn = document.getElementById("clearHistoryBtn") || 
                          document.querySelector(".chat-clear-btn") ||
                          document.querySelector('[onclick*="clearAllHistory"]');

  if (!chatMessages || !chatInput || !sendButton) {
    console.error("Элементы чата не найдены");
    return;
  }

  loadChatsFromStorage();
  chatInput.disabled = false;
  sendButton.disabled = false;
  chatInput.placeholder = "Спроси про ИИ, методички или промт-дизайн…";

  if (chatHint) {
    chatHint.textContent = "";
    chatHint.style.display = "none";
  }

  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  if (stopButton) {
    stopButton.addEventListener("click", stopGeneration);
  }
  
  // 🔹 ИСПРАВЛЕНО: Проверяем существование кнопок перед добавлением listeners
  if (newChatBtn) {
    console.log('✅ Кнопка "Новый чат" найдена');
    newChatBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🆕 Создаём новый чат...');
      createNewChat();
    });
  } else {
    console.warn('⚠️ Кнопка "Новый чат" не найдена');
  }
  
  if (clearHistoryBtn) {
    console.log('✅ Кнопка "Очистить историю" найдена');
    clearHistoryBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🗑️ Очищаем историю...');
      clearAllHistory();
    });
  } else {
    console.warn('⚠️ Кнопка "Очистить историю" не найдена');
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && currentAbortController) stopGeneration();
  });
  
  console.log('✅ Инициализация завершена');
}

// ==========================================
// ОТПРАВКА СООБЩЕНИЯ
// ==========================================
async function sendMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  if (!OPENROUTER_API_KEY) {
    addBotMessage("⚠️ OpenRouter API ключ не найден. Перезагрузи страницу и введи свой ключ.");
    return;
  }

  addUserMessage(userMessage);
  chatInput.value = "";

  currentAbortController = new AbortController();
  setLoading(true);
  const typingId = showTypingIndicator();

  try {
    const messages = [
      {
        role: "system",
        content: `Ты — TEXEL, дружелюбный ИИ-ассистент образовательного центра "Центр ИИ-инноваций". Объясняй просто, кратко и по-русски.`,
      },
      ...conversationHistory.slice(-3).flatMap((msg) => [
        { role: "user", content: msg.user },
        { role: "assistant", content: msg.bot },
      ]),
      { role: "user", content: userMessage },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.href,
        "X-Title": "TEXEL Chat Bot",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      }),
      signal: currentAbortController.signal,
    });

    if (!response.ok) {
      removeTypingIndicator(typingId);
      setLoading(false);
      currentAbortController = null;
      addBotMessage(`😔 Ошибка ${response.status}. Проверь консоль (F12).`);
      return;
    }

    const data = await response.json();
    removeTypingIndicator(typingId);
    setLoading(false);
    currentAbortController = null;

    const botReply = (data.choices?.[0]?.message?.content || "")
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();

    if (botReply) {
      addBotMessage(botReply);
      conversationHistory.push({ user: userMessage, bot: botReply });
      if (conversationHistory.length > 10)
        conversationHistory = conversationHistory.slice(-10);
    } else {
      addBotMessage("Извини, не смог сформулировать ответ. Попробуй иначе.");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      removeTypingIndicator(typingId);
      setLoading(false);
      currentAbortController = null;
      addBotMessage("⚠️ Ошибка соединения. Проверь ключ и интернет.");
    }
  }
}

// ==========================================
// UI ФУНКЦИИ
// ==========================================
function addUserMessage(text, shouldSave = true) {
  if (!chatMessages) return;
  
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg msg-user";
  msgDiv.innerHTML = `
    <div class="msg-meta">
      <span class="msg-role-user">Ты</span>
      <span class="msg-time">${getCurrentTime()}</span>
    </div>
    <div class="msg-bubble">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(msgDiv);
  scrollToBottom();
  if (shouldSave) saveMessageToChat("user", text);
}

function addBotMessage(text, shouldSave = true) {
  if (!chatMessages) return;
  
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg msg-bot";
  msgDiv.innerHTML = `
    <div class="msg-meta">
      <span class="msg-role-bot">TEXEL · ИИ-ассистент</span>
      <span class="msg-time">${getCurrentTime()}</span>
    </div>
    <div class="msg-bubble">${formatMessage(text)}</div>`;
  chatMessages.appendChild(msgDiv);
  scrollToBottom();
  if (shouldSave) saveMessageToChat("assistant", text);
}

function showTypingIndicator() {
  if (!chatMessages) return null;
  
  const id = "typing-" + Date.now();
  const typingDiv = document.createElement("div");
  typingDiv.id = id;
  typingDiv.className = "msg msg-bot typing-indicator";
  typingDiv.innerHTML = `
    <div class="msg-meta"><span class="msg-role-bot">TEXEL печатает...</span></div>
    <div class="msg-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
  chatMessages.appendChild(typingDiv);
  scrollToBottom();
  return id;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const indicator = document.getElementById(id);
  if (indicator) indicator.remove();
}

function setLoading(isLoading) {
  if (sendButton) {
    sendButton.disabled = isLoading;
    sendButton.textContent = isLoading ? "⏳ Думаю..." : "Отправить";
    sendButton.style.display = isLoading ? "none" : "block";
  }
  
  if (chatInput) {
    chatInput.disabled = isLoading;
    chatInput.style.opacity = isLoading ? "0.6" : "1";
  }
  
  if (stopButton) {
    stopButton.style.display = isLoading ? "block" : "none";
  }
}

function formatMessage(text) {
  return escapeHtml(text)
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function scrollToBottom() {
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// ==========================================
// ЭКСПОРТ ФУНКЦИЙ ДЛЯ ГЛОБАЛЬНОГО ДОСТУПА
// ==========================================
window.createNewChat = createNewChat;
window.clearAllHistory = clearAllHistory;
window.loadChat = loadChat;
window.deleteChat = deleteChat;
window.stopGeneration = stopGeneration;
window.changeApiKey = changeApiKey;

// ==========================================
// ЗАПУСК (с проверкой авторизации)
// ==========================================
let chatInitialized = false;

function initChatWithoutKey() {
  // Инициализируем чат, но показываем сообщение о необходимости ключа
  chatMessages = document.querySelector('.chat-messages');
  chatInput = document.querySelector('.chat-input');
  sendButton = document.querySelector('.chat-send-btn');
  chatHint = document.querySelector('.chat-hint');
  stopButton = document.getElementById('stopBtn');

  if (!chatMessages || !chatInput || !sendButton) return;

  chatMessages.innerHTML = '';

  // Приветственное сообщение с инструкцией
  var msgDiv = document.createElement('div');
  msgDiv.className = 'msg msg-bot';
  msgDiv.innerHTML =
    '<div class="msg-meta">' +
      '<span class="msg-role-bot">TEXEL · ИИ-ассистент</span>' +
    '</div>' +
    '<div class="msg-bubble">' +
      '👋 Привет! Я TEXEL — ИИ-ассистент на базе DeepSeek R1.<br><br>' +
      '⚠️ <strong>Для работы чата нужен API-ключ OpenRouter.</strong><br><br>' +
      'Нажми кнопку <strong>🔑 Сменить API-ключ</strong> в левой панели, чтобы настроить подключение. Это бесплатно и займёт 2 минуты!' +
    '</div>';
  chatMessages.appendChild(msgDiv);

  // Блокируем ввод
  chatInput.disabled = true;
  chatInput.placeholder = 'Сначала установи API-ключ →';
  sendButton.disabled = true;

  if (chatHint) {
    chatHint.textContent = '🔑 Установи API-ключ, чтобы начать общение';
    chatHint.style.color = 'rgba(255,107,53,0.8)';
  }
}

function startChatWhenAuthed() {
  if (window.TexelAuth && window.TexelGuard) {
    window.TexelGuard.guardPage('.chat-area', {
      title: 'Войдите, чтобы использовать чат',
      desc: 'Авторизуйтесь для доступа к ИИ-ассистенту TEXEL',
      icon: '🤖'
    });

    window.TexelAuth.onReady(function(user) {
      if (user && !chatInitialized) {
        if (ensureApiKey()) {
          chatInitialized = true;
          initChat();
        } else {
          initChatWithoutKey();
        }
      }
    });
  } else {
    if (ensureApiKey()) {
      initChat();
    } else {
      initChatWithoutKey();
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startChatWhenAuthed);
} else {
  startChatWhenAuthed();
}

console.log("✅ TEXEL Chat Bot загружен. Используется DeepSeek R1.");