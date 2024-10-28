const crypto = require('crypto')

const CryptoDecryption = {

    encrypt: function(text) {
        const key = process.env.CRYPTO_PASS
        const iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return (iv.toString('hex') + ':' + encrypted.toString('hex'));
    },

    decrypt: function(text) {
        try {
            const key = process.env.CRYPTO_PASS
            let textParts = text.split(':');
            let iv = Buffer.from(textParts[0], 'hex');
            let encryptedText = Buffer.from(textParts[1], 'hex');
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (err) {
            console.log(err)
        }
    },

    randomString: function() {
        try {

            var string = '';
            var characters = Date.now().toString();
            var charactersLength = characters.length;
            for (var i = 0; i < 5; i++) {
                string += characters.charAt(Math.floor(Math.random() *
                    charactersLength));
            }
            string = string;
            return string.toUpperCase();
        } catch (error) {
            console.log('Error @ randomString :', error)
            return false;
        }
    }
}


module.exports = CryptoDecryption