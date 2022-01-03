const mongoose = require('mongoose')
const orderSchema = mongoose.Schema({
    orderItems:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'OrderItem',
        required: true
    }],
    shippingAddress:{
        type: String,
        required: true
    },
    zip:{
        type: String,
        required: true
    },
    phone: {
        type: String,
        require:true
    },
    status: {
        type: String,
        require: true,
        default: 'Pending'
    },
    TotalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    DateOrder: {
        type: Date,
        default: Date.now
    }
})
orderSchema.virtual('id').get(function() {
    return this._id.toHexString()
})

orderSchema.set('toJSON',{
    virtuals: true
})

exports.Order = mongoose.model('Order', orderSchema)