let socket;

const statusEl = document.getElementById('status');
const chatBox = document.getElementById('chat-box');
const usernameInput = document.getElementById('username-input');
const textInput = document.getElementById('message-text');
const sendBtn = document.getElementById('send-btn');
const getBtn = document.getElementById('get-btn');
const closeBtn = document.getElementById('close-btn');
const reconnectBtn = document.getElementById('reconnect-btn');

function connect() {
    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
        statusEl.textContent = 'Статус: Підключено до ws://localhost:8080';
        statusEl.style.color = 'green';
        toggleButtons(true);

        requestMessages();
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'messages_list') {
            renderMessages(data.messages);
        }
    };

    socket.onclose = () => {
        statusEl.textContent = 'Статус: З\'єднання закрито';
        statusEl.style.color = 'red';
        toggleButtons(false);
    };

    socket.onerror = (error) => {
        console.error('Помилка WebSocket: ', error);
    };
}

function requestMessages() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        const payload = {
            action: 'get_messages'
        };
        socket.send(JSON.stringify(payload));
    }
}

function sendMessage() {
    const username = usernameInput.value.trim();
    const text = textInput.value.trim();

    if (!username || !text) {
        alert('Введіть ім\'я та текст повідомлення');
        return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
        const payload = {
            action: 'send_message',
            username: username,
            text: text
        };
        socket.send(JSON.stringify(payload));
        textInput.value = '';
    }
}

function renderMessages(messages) {
    chatBox.innerHTML = '';
    messages.forEach((msg) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>[${msg.time}] ${msg.username}:</strong> ${msg.text}`;
        chatBox.appendChild(li);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

function toggleButtons(isConnected) {
    sendBtn.disabled = !isConnected;
    getBtn.disabled = !isConnected;
    closeBtn.disabled = !isConnected;
    reconnectBtn.disabled = isConnected;
}

sendBtn.addEventListener('click', sendMessage);
getBtn.addEventListener('click', requestMessages);

closeBtn.addEventListener('click', () => {
    if (socket) {
        socket.close();
    }
});

reconnectBtn.addEventListener('click', connect);

textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
})

connect();