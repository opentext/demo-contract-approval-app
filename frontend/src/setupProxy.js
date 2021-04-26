const createProxyMiddleware = require('http-proxy-middleware');

module.exports = app => {
    console.log('Setting proxy configuration');
    app.use(createProxyMiddleware(
        ['/api', '/session', '/configuration', '/logout'],
        {
            target: 'http://localhost:' + process.env.npm_package_config_port,
            changeOrigin: true,
        })
    );
};