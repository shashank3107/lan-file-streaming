// Initialize socket connection
const socket = io();

// DOM Elements
const devicesList = document.getElementById('devices-list');
const pingButton = document.getElementById('ping-button');
const deviceNameInput = document.getElementById('device-name');
const saveNameButton = document.getElementById('save-name');
const callContainer = document.getElementById('call-container');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const endCallButton = document.getElementById('end-call');
const incomingCallBox = document.getElementById('incoming-call-box');
const incomingCallText = document.getElementById('incoming-call-text');
const acceptCallBtn = document.getElementById('accept-call');
const rejectCallBtn = document.getElementById('reject-call');

// State management
let localStream = null;
let peer = null;
let currentCall = null;
const devices = new Map();
let myDeviceId = null;

// Load saved device name from localStorage
const savedName = localStorage.getItem('deviceName');
if (savedName) {
    deviceNameInput.value = savedName;
}

// Save device name and update presence
saveNameButton.addEventListener('click', () => {
    const deviceName = deviceNameInput.value.trim();
    if (deviceName) {
        localStorage.setItem('deviceName', deviceName);
        // Update the device name in the devices map if we have our device
        if (myDeviceId && devices.has(myDeviceId)) {
            const myDevice = devices.get(myDeviceId);
            myDevice.deviceName = deviceName;
            devices.set(myDeviceId, myDevice);
            renderDevicesList();
        }
        emitPing();
    }
});

// Handle Enter key for device name
deviceNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveNameButton.click();
    }
});

// Ping device
pingButton.addEventListener('click', emitPing);

// Socket event handlers
socket.on('connect', () => {
    myDeviceId = socket.id;
    // Initial ping on connection
    setTimeout(emitPing, 1000);
});

socket.on('device found', (data) => {
    if (data.ip === socket.id) {
        myDeviceId = data.ip;
    }
    updateDevicesList(data);
});

// Function to emit ping with device info
function emitPing() {
    const hostname = window.location.hostname;
    const deviceName = deviceNameInput.value.trim() || 'Unnamed Device';
    socket.emit('ping device', {
        hostname,
        deviceName
    });
}

// Function to update devices list
function updateDevicesList(data) {
    // Update timestamp for device
    data.lastSeen = new Date();
    devices.set(data.ip, data);
    renderDevicesList();
    // Clean up old devices
    cleanupOldDevices();
}

// Function to cleanup devices not seen in the last minute
function cleanupOldDevices() {
    const now = new Date();
    for (const [id, device] of devices.entries()) {
        if (now - device.lastSeen > 60000) { // 60 seconds
            devices.delete(id);
        }
    }
    renderDevicesList();
}

// Function to render devices list
function renderDevicesList() {
    devicesList.innerHTML = '';
    if (devices.size === 0) {
        devicesList.innerHTML = '<p>No devices found. Click "Ping My Device" to announce your presence.</p>';
        return;
    }

    devices.forEach((device) => {
        const deviceElement = document.createElement('div');
        deviceElement.className = 'device-item';
        if (device.ip === socket.id) {
            deviceElement.classList.add('current-device');
        }

        deviceElement.innerHTML = `
            <div class="device-info">
                <span class="device-hostname">${device.deviceName || 'Unnamed Device'}</span>
                <span class="device-ip">${device.ip}</span>
                ${device.ip === socket.id ? '<span class="current-device-label">(This Device)</span>' : ''}
            </div>
            ${device.ip !== socket.id ? `
                <button class="device-link" onclick="startCall('${device.ip}', '${device.deviceName || 'Unknown Device'}')">
                    Call Device
                </button>
            ` : ''}
        `;
        devicesList.appendChild(deviceElement);
    });
}

// Simplified video call functions
async function startCall(targetIp, targetName) {
    try {
        // Request both audio and video with preferred settings
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        localVideo.srcObject = localStream;
        await localVideo.play().catch(e => console.log('Play error:', e));

        peer = new SimplePeer({
            initiator: true,
            stream: localStream,
            trickle: true, // Enable trickle ICE
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' },
                    { urls: 'stun:stun4.l.google.com:19302' }
                ]
            }
        });

        setupPeerEvents(peer, targetIp);
        callContainer.classList.remove('hidden');
    } catch (err) {
        console.error('Error starting call:', err);
        alert('Could not access camera/microphone');
        endCall();
    }
}

function setupPeerEvents(peer, targetIp) {
    peer.on('signal', (data) => {
        console.log('Sending signal:', data);
        socket.emit('call device', {
            signal: data,
            toIp: targetIp,
            fromName: deviceNameInput.value.trim() || 'Unknown Device'
        });
    });

    peer.on('stream', (stream) => {
        console.log('Received remote stream:', stream.getTracks());
        remoteVideo.srcObject = stream;
        remoteVideo.play().catch(e => console.log('Remote play error:', e));
    });

    peer.on('track', (track, stream) => {
        console.log('Received track:', track.kind);
        if (!remoteVideo.srcObject) {
            remoteVideo.srcObject = stream;
        }
    });

    peer.on('connect', () => {
        console.log('Peer connection established');
    });

    peer.on('close', () => {
        console.log('Peer connection closed');
        endCall();
    });

    peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        endCall();
    });

    peer.on('iceStateChange', (state) => {
        console.log('ICE state:', state);
    });

    endCallButton.onclick = () => {
        socket.emit('end call', { toIp: targetIp });
        endCall();
    };
}

function endCall() {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    callContainer.classList.add('hidden');
    incomingCallBox.classList.add('hidden');
}

// Simplified incoming call handling
socket.on('incoming call', async (data) => {
    if (peer) {
        // If already in a call, reject the new one
        socket.emit('end call', { toIp: data.from.ip });
        return;
    }

    // Show incoming call dialog
    incomingCallText.textContent = `Incoming call from ${data.from.deviceName}`;
    incomingCallBox.classList.remove('hidden');

    // Handle accept/reject
    const handleAccept = async () => {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            localVideo.srcObject = localStream;
            await localVideo.play().catch(e => console.log('Play error:', e));

            peer = new SimplePeer({
                initiator: false,
                stream: localStream,
                trickle: true, // Enable trickle ICE
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:stun3.l.google.com:19302' },
                        { urls: 'stun:stun4.l.google.com:19302' }
                    ]
                }
            });

            setupPeerEvents(peer, data.from.ip);
            console.log('Receiving initial signal:', data.signal);
            peer.signal(data.signal);
            callContainer.classList.remove('hidden');
            incomingCallBox.classList.add('hidden');
        } catch (err) {
            console.error('Error accepting call:', err);
            alert('Could not access camera/microphone');
            endCall();
        }
    };

    const handleReject = () => {
        incomingCallBox.classList.add('hidden');
        socket.emit('end call', { toIp: data.from.ip });
    };

    // Set up one-time event listeners
    acceptCallBtn.onclick = () => {
        handleAccept();
        acceptCallBtn.onclick = null;
        rejectCallBtn.onclick = null;
    };

    rejectCallBtn.onclick = () => {
        handleReject();
        acceptCallBtn.onclick = null;
        rejectCallBtn.onclick = null;
    };
});

socket.on('call answered', (data) => {
    console.log('Call answered, receiving signal:', data.signal);
    if (peer) {
        peer.signal(data.signal);
    }
});

socket.on('call ended', endCall);

// Auto-refresh device list periodically
setInterval(() => {
    emitPing();
    cleanupOldDevices();
}, 30000); // Every 30 seconds 