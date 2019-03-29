module.exports = {
  apps : [{
    name: 'lunch-api',
    script: './server.js',
    instances: 1,
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    ignore_watch: ["node_modules", "log", "db"],
    max_memory_restart: "200M",
    cron_restart: "0 6,7,8 * * *",
  }]
};
