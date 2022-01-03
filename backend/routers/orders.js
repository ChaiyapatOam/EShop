const {Product} = require('../models/product')
const express = require('express')
const mongoose = require('mongoose')
const { Category } = require('../models/category')
const { Order } = require('../models/order')
const {OrderItem} = require('../models/order-item')
const router  = express.Router()

//Get All Order
router.get('/', async (req,res) =>{
    const orderList = await Order.find().populate('user','name').sort({'DateOrder': -1})

    if(!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList)
})

router.get('/:id', async (req,res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user','name')
    .populate({ path: 'orderItems', populate: {
        path:'product',populate:{path: 'category'}}})
    //.populate('orderItems')

    if(!order) {
        res.status(500).json({success: false})
    }
    res.send(order)
})

router.post('/', async (req,res)=>{
    const orderItemsId = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product : orderItem.product
        })
        newOrderItem = await newOrderItem.save()

        return  newOrderItem._id
    }))
    const orderItemsIdResolved = await orderItemsId
    // console.log(orderItemsIdResolved);

    let order = new Order({
        orderItems: orderItemsIdResolved,
        shippingAddress :req.body.shippingAddress,
        zip: req.body.zip,
        phone: req.body.phone,
        status: req.body.status,
        TotalPrice: req.body.TotalPrice,
        user: req.body.user,
    })
    order = await order.save()

    if(!order)
    return res.status(400).status.send('The order cannot be created')

    res.send(order)
})

module.exports = router