const mongoose = require('mongoose');
const uri = 'mongodb://127.0.0.1:27017/labour-platform';
console.log('Testing connection to:', uri);
mongoose.connect(uri)
    .then(() => { console.log('Connected!'); process.exit(0); })
    .catch(err => { console.error('Failed:', err.message); process.exit(1); });
