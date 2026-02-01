const crypto = require('crypto');

// Use environment variable or valid fallback for dev
const SECRET_KEY = process.env.MEDIA_KEY
    ? Buffer.from(process.env.MEDIA_KEY, 'hex')
    : crypto.scryptSync('development_fallback_secret', 'salt', 32);

const IV_LENGTH = 16;

exports.encryptBuffer = (buffer) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

exports.decryptBuffer = (text) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted;
};
