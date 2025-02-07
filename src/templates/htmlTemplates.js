const styles = require('../styles/styles');

const renderPage = (content) => `
    <html>
    <head>
        <style>${styles}</style>
    </head>
    <body>${content}</body>
    </html>
`;

module.exports = renderPage; 