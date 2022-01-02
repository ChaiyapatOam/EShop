const {Product} = require('../models/product')
const express = require('express')
const mongoose = require('mongoose')
const { Category } = require('../models/category')
const router  = express.Router()

//Get All Product
router.get('/', async (req,res) =>{
    let filter = {}
    if(req.query.categories)
    {
        filter = {
            category:req.query.categories.split(',')
        }
    }
    const productList = await Product.find(filter).populate('category')
    res.send(productList)
})
//get by id
router.get('/:id', async (req,res) =>{
    const product = await Product.findById(req.params.id).populate('category')

    if(!product)
        res.status(500).json({message:"The product with the givern id was not found"})
    
    res.status(200).send(product)
})
//create new product
router.post('/' , async (req,res) =>{
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        image : req.body.image,
        images: req.body.images,
        price: req.body.price,
        category: req.body.category,
        countInStock : req.body.countInStock,
        isFeatured : req.body.isFeatured,
    })
    product = await product.save()
    if(!product)
    return res.status(500).send("The product cannot be creat")

    res.send(product)

})
//Update Product
router.put('/:id',async (req,res) =>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product ID')
    }
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image : req.body.image,
            images: req.body.images,
            price: req.body.price,
            category: req.body.category,
            countInStock : req.body.countInStock,
            isFeatured : req.body.isFeatured,
        },
        {new:true}
        )
        if(!product)
        return res.status(404).status.send('The product cannot be created')
    
        res.send(product)
})

//Delete Product
router.delete('/:id',(req,res) => {
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product) {
            return res.status(200).json({success:true,message:"The product is deleted"})
        } else {
            return res.status(404).json({success:false,message:"product not found"})
        }
    }).catch((err)=>{
        return res.status(400).json({success:false,err: err})
    })
})

router.get('/get/count', async (req,res) => {
    const productCount = await Product.countDocuments()

    if(!productCount){
        res.status(500).json({success:false})
    }
    res.send({
        productCount: productCount})
})
// isFeatured
router.get('/get/featured', async (req,res) => {
    const product = await Product.find({isFeatured: true})
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)
})
// Count isFeatured
router.get('/get/featured/:count', async (req,res) => {
    const count = req.params.count ? req.params.count:0
    const product = await Product.find({isFeatured: true}).limit(+count)
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)
})

module.exports = router