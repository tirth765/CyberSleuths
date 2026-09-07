const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: 'analyst', enum: ['analyst', 'admin', 'viewer'] },
  avatar: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  notifications: {
    criticalAlerts: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    realTimeAlerts: { type: Boolean, default: true },
    campaignDetection: { type: Boolean, default: true }
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
