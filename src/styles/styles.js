const styles = `
    body { 
        font-family: Arial, sans-serif; 
        margin: 20px;
        text-align: center;
        padding-top: 50px;
    }
    .menu-item {
        display: block;
        font-size: 24px;
        margin: 20px;
        text-decoration: none;
        color: #333;
    }
    .menu-item:hover { color: #0066cc; }
    .file-link {
        display: block;
        margin: 10px 0;
        text-decoration: none;
        color: #333;
    }
    .file-link:hover { color: #0066cc; }
    .back-link {
        display: block;
        margin-bottom: 20px;
    }
    #chat-container {
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
    
    #messages {
        height: 400px;
        overflow-y: auto;
        padding: 20px;
        background: #f9f9f9;
    }
    
    .message {
        margin: 10px 0;
        padding: 10px;
        background: white;
        border-radius: 5px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 0.85em;
        color: #666;
    }
    
    .user-ip {
        font-weight: bold;
        color: #0066cc;
    }
    
    .message-time {
        color: #999;
    }
    
    .message-text {
        word-break: break-word;
    }
    
    #chat-form {
        display: flex;
        padding: 20px;
        border-top: 1px solid #ccc;
    }
    
    #message-input {
        flex-grow: 1;
        padding: 10px;
        margin-right: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    
    #chat-form button {
        padding: 10px 20px;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    #chat-form button:hover {
        background: #0052a3;
    }
    
    #username {
        padding: 10px;
        margin-right: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 150px;
    }
    
    .status-message {
        text-align: center;
        color: #666;
        font-style: italic;
        margin: 10px 0;
        padding: 5px;
    }
`;

module.exports = styles; 