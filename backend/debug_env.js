require('dotenv').config();
const fs = require('fs');
fs.writeFileSync('env_debug.txt', 'URI: ' + process.env.MONGODB_URI);
