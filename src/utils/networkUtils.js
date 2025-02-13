const os = require('os');
const net = require('net');
const dns = require('dns').promises;

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
        for (const interface of interfaces[interfaceName]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return '127.0.0.1';
}

async function scanNetwork() {
    const localIP = getLocalIPAddress();
    const subnet = localIP.split('.').slice(0, 3).join('.');
    const devices = [];
    const scanPromises = [];

    for (let i = 1; i < 255; i++) {
        const ip = `${subnet}.${i}`;
        scanPromises.push(checkPort(ip));
    }

    const results = await Promise.all(scanPromises);
    return results.filter(device => device !== null);
}

function checkPort(ip) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 200;

        socket.on('connect', () => {
            socket.destroy();
            getHostname(ip).then(hostname => {
                resolve({
                    ip,
                    hostname: hostname || 'Unknown Device',
                    isCurrentDevice: ip === getLocalIPAddress()
                });
            });
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(null);
        });

        socket.setTimeout(timeout);
        socket.on('timeout', () => {
            socket.destroy();
            resolve(null);
        });

        socket.connect(3001, ip);
    });
}

async function getHostname(ip) {
    try {
        const hostname = await dns.reverse(ip);
        return hostname[0];
    } catch (error) {
        return null;
    }
}

module.exports = {
    scanNetwork,
    getLocalIPAddress
}; 