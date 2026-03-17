var stompClient;

function setConnected(connected) {
    document.getElementById('sendMessage').disabled = !connected;
    const banner = document.getElementById('conn-banner');
    const statusLabel = document.getElementById('statusLabel');

    banner.textContent = connected ? 'Connected' : 'Disconnected';
    banner.className = connected
        ? 'form-text mt-2 text-center text-success'
        : 'form-text mt-2 text-center text-danger';

    statusLabel.textContent = connected ? 'Online' : 'Offline';
}

function connect() {
    var socket = new SockJS('/chat');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function () {
        setConnected(true);

        stompClient.subscribe('/topic/messages', function (message) {
            showMessage(JSON.parse(message.body));
        });

    }, function () {
        setConnected(false);
    });
}

function showMessage(message) {
    const chat = document.getElementById('chat');
    const empty = document.getElementById('emptyState');
    if (empty) empty.remove();

    const div = document.createElement('div');
    div.className = 'msg-bubble';
    div.innerHTML = `
        <div class="msg-sender">${message.sender}</div>
        <div class="msg-text">${message.content}</div>
    `;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function sendMessage() {
    const sender = document.getElementById('senderInput').value.trim();
    const content = document.getElementById('messageInput').value.trim();

    if (!sender || !content) return;

    stompClient.send("/app/sendMessage", {}, JSON.stringify({ sender, content }));

    document.getElementById('messageInput').value = '';
    document.getElementById('senderInput').readOnly = true;
}

document.getElementById('sendMessage').onclick = sendMessage;

document.getElementById('messageInput').onkeydown = (e) => {
    if (e.key === 'Enter') sendMessage();
};

window.onload = connect;