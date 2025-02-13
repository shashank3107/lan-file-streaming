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

    #file-sharing-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .upload-section {
        margin-bottom: 30px;
        padding: 20px;
        background: #f5f5f5;
        border-radius: 5px;
    }

    .shared-files {
        background: #fff;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;
    }

    .download-link {
        background: #0066cc;
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        text-decoration: none;
    }

    .download-link:hover {
        background: #0052a3;
    }

    .file-actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .delete-link {
        background: #dc3545;
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        border: none;
        cursor: pointer;
        font-size: 14px;
    }

    .delete-link:hover {
        background: #c82333;
    }

    #devices-container {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
    }

    .device-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        margin: 10px 0;
        background: #f5f5f5;
        border-radius: 5px;
        border: 1px solid #ddd;
    }

    .device-hostname {
        font-weight: bold;
        color: #333;
    }

    .device-ip {
        color: #666;
    }

    .device-link {
        background: #0066cc;
        color: white;
        padding: 8px 15px;
        border-radius: 4px;
        text-decoration: none;
    }

    .device-link:hover {
        background: #0052a3;
    }

    .refresh-button {
        margin-top: 20px;
        padding: 10px 20px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }

    .refresh-button:hover {
        background: #218838;
    }

    .device-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .current-device {
        background: #e8f5e9;
        border-color: #81c784;
    }

    .current-device-label {
        color: #2e7d32;
        font-size: 0.8em;
        font-style: italic;
    }

    .scan-status {
        margin-top: 20px;
        color: #666;
        font-style: italic;
        text-align: center;
    }

    .device-time {
        color: #666;
        font-size: 0.8em;
        font-style: italic;
    }

    #ping-button {
        margin-bottom: 20px;
        background: #0066cc;
    }

    #ping-button:hover {
        background: #0052a3;
    }

    .device-settings {
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    .device-name-input {
        padding: 8px 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;
        width: 250px;
    }

    .save-name-button {
        padding: 8px 15px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }

    .save-name-button:hover {
        background: #218838;
    }

    .device-name {
        font-size: 1.2em;
        font-weight: bold;
        color: #0066cc;
        display: block;
        margin-bottom: 5px;
    }

    .call-button {
        background: #28a745;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
    }

    .call-button:hover {
        background: #218838;
    }

    .hidden {
        display: none;
    }

    #call-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
    }

    .video-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 20px;
    }

    .video-container {
        position: relative;
    }

    .video-container video {
        width: 300px;
        height: 225px;
        background: #000;
        border-radius: 8px;
    }

    .video-label {
        position: absolute;
        bottom: 10px;
        left: 10px;
        color: white;
        background: rgba(0, 0, 0, 0.5);
        padding: 4px 8px;
        border-radius: 4px;
    }

    .call-controls {
        text-align: center;
    }

    .end-call-button {
        background: #dc3545;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }

    .end-call-button:hover {
        background: #c82333;
    }

    .incoming-call-box {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 20px;
        z-index: 1000;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .incoming-call-content h3 {
        margin: 0 0 10px 0;
        color: #333;
    }

    .incoming-call-content p {
        margin: 0 0 15px 0;
        color: #666;
    }

    .incoming-call-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }

    .accept-call-button {
        background: #28a745;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }

    .accept-call-button:hover {
        background: #218838;
    }

    .reject-call-button {
        background: #dc3545;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }

    .reject-call-button:hover {
        background: #c82333;
    }

    .calling-status-box {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    }

    .calling-status-box p {
        margin: 0;
        font-size: 16px;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
`;

module.exports = styles; 