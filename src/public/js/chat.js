// Initialize socket connection
const socket = io();

// DOM Elements
const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const usernameInput = document.getElementById('username');
const messages = document.getElementById('messages');

// Load saved username if available
if (localStorage.getItem('username')) {
    usernameInput.value = localStorage.getItem('username');
}

// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        // Save username if provided
        if (usernameInput.value) {
            localStorage.setItem('username', usernameInput.value);
        }
        
        socket.emit('chat message', {
            text: input.value,
            username: usernameInput.value
        });
        input.value = '';
    }
});

// Handle incoming messages
socket.on('chat message', (data) => {
    appendMessage(data);
});

// Handle user status updates
socket.on('user status', (message) => {
    appendStatusMessage(message);
});

// Helper function to append a new message
function appendMessage(data) {
    const item = document.createElement('div');
    item.className = 'message';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const userDisplay = data.username || data.ip;
    header.innerHTML = `
        <span class="user-ip">${userDisplay}</span>
        <span class="message-time">${data.time}</span>
    `;
    
    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = data.text;
    
    item.appendChild(header);
    item.appendChild(text);
    messages.appendChild(item);
    autoScroll();
}

// Helper function to append status messages
function appendStatusMessage(message) {
    const item = document.createElement('div');
    item.className = 'status-message';
    item.textContent = message;
    messages.appendChild(item);
    autoScroll();
}

// Auto-scroll to bottom when new messages arrive
function autoScroll() {
    messages.scrollTop = messages.scrollHeight;
} 