module.exports = {
  apps: [{
    name: "sparkle-tidy-experts",
    script: "server/index.js",
    cwd: "/root/sparkle-tidy-experts",
    env: {
      NODE_ENV: "production",
      PORT: 5003
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G"
  }]
}; 