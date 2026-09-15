const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({
      port: 3000,
      local_host: '127.0.0.1',
      subdomain: 'expensewise-' + Math.random().toString(36).substring(2, 7)
    });
    console.log('PUBLIC_TUNNEL_URL=' + tunnel.url);
    
    tunnel.on('close', () => {
      console.log('Tunnel closed');
      process.exit(1);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });

    setInterval(() => {}, 60000);
  } catch (err) {
    console.error('Failed to create tunnel:', err);
  }
})();
