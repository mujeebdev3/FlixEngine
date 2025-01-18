import { Admin, User } from "../models/index.js";

class AdminRepository {
  async findAdminByCondition(condition) {
    return await Admin.findOne({ ...condition, isDeleted: false });
  }
  async findAdminById(adminId) {
    return await Admin.findById(adminId).select("-password");
  }
  async createAdmin(adminData) {
    const admin = new Admin(adminData);
    return await admin.save();
  }

  async updateAdminDetails(adminId, adminData) {
    return await Admin.findOneAndUpdate({ _id: adminId }, adminData, {
      new: true,
    }).select("-password");
  }

  async deleteAdmin(adminId) {
    return await Admin.deleteOne({ _id: adminId });
  }

  async getAllUsers(page = 1, limit = 10) {
    const totalUsers = await User.countDocuments();
    const users = await User.find({}) //.lean()
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);
    return { users, totalUsers };
  }

  async getUsersByCondition(condition, page = 1, limit = 10) {
    const totalUsers = await User.countDocuments(condition);
    const users = await User.find(condition)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);
    return { users, totalUsers };
  }

  async bulkDeleteUsers(userIds) {
    return await User.updateMany(
      { _id: { $in: userIds } },
      { isDeleted: true, deleteAt: new Date() }
    );
  }

  async softDeleteUser(adminId) {
    return await Admin.findOneAndUpdate(
      {
        _id: adminId,
      },
      { isDeleted: true, deleteAt: new Date() },
      { new: true }
    );
  }

  async restoreAdmin(adminId) {
    return await User.findOneAndUpdate(
      { _id: adminId, isDeleted: true },
      { isDeleted: false, deleteAt: null },
      { new: true }
    );
  }
}

export default new AdminRepository();
