const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() }, 
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // VULN: Can be mass-assigned
    bio: { type: String, default: '' }
});

module.exports = mongoose.model('User', userSchema);
