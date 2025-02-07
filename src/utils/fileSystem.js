const fs = require('fs');
const path = require('path');

const createDirectoryIfNotExists = (directory) => {
    const dirPath = path.join(__dirname, '../../', directory);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    return dirPath;
};

const findMediaFiles = (directory, extensions) => {
    const dirPath = createDirectoryIfNotExists(directory);
    const files = fs.readdirSync(dirPath);
    return files.filter(file => 
        extensions.some(ext => file.toLowerCase().endsWith(ext))
    );
};

module.exports = {
    createDirectoryIfNotExists,
    findMediaFiles
}; 