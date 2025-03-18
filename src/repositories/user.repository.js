const User = require('../models/user.model');

class UserRepository {
  constructor() {
    this._model = User;
  }

  async create(userData) {
    const user = new this._model(userData);
    return await user.save();
  }

  async findByEmail(email) {
    return await this._model.findOne({ email }).select('+password');
  }

  async findById(id) {
    return await this._model.findById(id);
  }

  async update(id, updateData) {
    return await this._model.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return await this._model.findByIdAndDelete(id);
  }

  async exists(email) {
    const count = await this._model.countDocuments({ email });
    return count > 0;
  }
}

// Export a singleton instance
module.exports = new UserRepository(); 