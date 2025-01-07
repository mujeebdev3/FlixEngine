import { User } from "../models/index.js";

class UserRepository {
  async findUserByCondition(condition) {
    return await User.findOne({ ...condition, isDeleted: false });
  }
  async findUserById(userId) {
    return await User.findById(userId).select("-password");
  }
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }
  async getAllUsers(page = 1, limit = 10) {
    return await User.find({})
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);
  }
  async getUserById(userId) {
    return await User.findById(userId).select("-password");
  }
  async updateUserDetails(userId, userData) {
    return await User.findOneAndUpdate({ _id: userId }, userData, {
      new: true,
    }).select("-password");
  }

  async deleteUser(userId) {
    return await User.deleteOne({ _id: userId });
  }

  async softDeleteUser(userId) {
    return await User.findOneAndUpdate(
      {
        _id: userId,
      },
      { isDeleted: true, deleteAt: new Date() },
      { new: true }
    );
  }

  async restoreUser(userId) {
    return await User.findOneAndUpdate(
      { _id: userId, isDeleted: true },
      { isDeleted: false, deleteAt: null },
      { new: true }
    );
  }
}

export default new UserRepository();
