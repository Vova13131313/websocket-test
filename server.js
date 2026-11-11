const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const messages = []

console.log('WebSocket-сервер запущено на ws://localhost:8080');

wss.on('connection', (ws) => {
    console.log('Клієнт підключився');

    ws.on('message', (rawData) => {
        try {
            const data = JSON.parse(rawData);
            console.log('Отримано операцію: ', data);

            switch(data.action) {
                case 'send_message':
                    if (data.username && data.text) {
                        const newMessage = {
                            username: data.username.trim(),
                            text: data.text.trim(),
                            time: new Date().toLocaleDateString('uk-UA', { hour: '2-digit', minute: '2-digit' })
                        };

                        messages.push(newMessage);

                        const response = JSON.stringify({
                           type: 'messages_list',
                           messages: messages
                        });

                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(response);
                            }
                        });
                    }
                    break;
                
                case 'get_messages':
                    ws.send(JSON.stringify({
                        type: 'messages_list',
                        messages: messages
                    }));
                    break;

                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Невідома операція'
                    }));
            }
        } catch (error) {
            console.error('Помилка обробки JSON: ', error.message);
        }
    });

    ws.on('close', () => {
        console.log('Клієнт відключився');
    });
});