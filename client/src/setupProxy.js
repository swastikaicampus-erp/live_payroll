const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://3.111.38.27',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Ye '/api' ko hata kar original path bhejega
      },
    })
  );
};