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
    const TotalPrices = await Promise.all(orderItemsIdResolved.map(async (orderItemsId) => {
        const orderItem = await OrderItem.findById(orderItemsId).populate('product','price')
        const TotalPrice = orderItem.product.price * orderItem.quantity
        return TotalPrice
    }))
    // console.log(TotalPrices);
    const TotalPrice = TotalPrices.reduce((a,b) => a+b, 0)

    let order = new Order({
        orderItems: orderItemsIdResolved,
        shippingAddress :req.body.shippingAddress,
        zip: req.body.zip,
        phone: req.body.phone,
        status: req.body.status,
        TotalPrice: TotalPrice,
        user: req.body.user,
    })
    order = await order.save()

    if(!order)
    return res.status(400).status.send('The order cannot be created')

    res.send(order)
})
//Update Status
router.put('/:id',async (req,res) =>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        {new:true}
        )
        if(!order)
        return res.status(404).status.send('The order cannot be created')
    
        res.send(order)
})
//Deleted Order
router.delete('/:id',(req,res) => {
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success:true,message:"The order is deleted"})
        } else {
            return res.status(404).json({success:false,message:"order not found"})
        }
    }).catch((err)=>{
        return res.status(500).json({success:false,err: err})
    })
})
//Get Total Sale
router.get('/get/totalsale', async (req,res) => {
    const TotalSale = await Order.aggregate([
        { $group: { _id:null, TotalSale: {$sum: '$TotalPrice'}}}
    ])
    if(!TotalSale) {
        return res.status(400).send('The Order cannot be Sum ')
    }
    res.send({TotalSale:TotalSale.pop().TotalSale})
})
//Count Order
router.get('/get/count', async (req,res) => {
    const orderCount = await Order.countDocuments()

    if(!orderCount){
        res.status(500).json({success:false})
    }
    res.send({
        orderCount: orderCount})
})
//Get User Order     
router.get('/get/userorder/:userid', async (req,res) =>{
    const userorderList = await Order.find({user:req.params.userid}).populate({ path: 'orderItems', populate: {
        path:'product',populate:{path: 'category'}}}).sort({'DateOrder': -1})

    if(!userorderList) {
        res.status(500).json({success: false})
    }
    res.send(userorderList)
})
module.exports = router