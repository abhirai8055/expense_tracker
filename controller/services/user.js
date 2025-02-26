const userModel =require("../../models/userModel") ;
const status =require("../../models/enums/status");

const userServices = {
  checkUserExists: async (email, mobileNumber) => {
    let query = { $and: [{ status: { $ne: status.DELETE } }, { $or: [{ email: email }, { mobileNumber: mobileNumber }] }] }
    return await userModel.findOne(query);
  },
  createUser: async (insertObj) => {
    return await userModel.create(insertObj);
  },
  findUser: async (email) => {
    return await userModel.findOne({ $and: [{ email: email }, { status: { $ne: status.DELETE } }] });
  },
  findUserById: async (id) => {
    return await userModel.findOne({ $and: [{ _id: id }, { status: { $ne: status.DELETE } }] });
  },
  updateUserById: async (query, obj) => {
    return await userModel.findByIdAndUpdate(query, obj, { new: true });
  },
  findAll: async (query) => {
    return await userModel.find(query)
  },
  findAdmin: async (query) => {
    return await userModel.findOne(query);
  },
  findIdAndDelete: async(query)=>{
    return await userModel.findByIdAndDelete(query)
  }

}
module.exports = userServices;