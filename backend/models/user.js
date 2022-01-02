const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type:String,
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        default:''
    },
    isAdmin: {
        type: Boolean,
        default:false
    },

})
userSchema.virtual('id').get(function() {
    return this._id.toHexString()
})

userSchema.set('toJSON',{
    virtuals: true
})

exports.User = mongoose.model('User',userSchema)
exports.userSchema = userSchema