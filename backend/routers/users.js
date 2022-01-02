const {User} = require('../models/user')
const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()

router.get('/', async (req,res) => {
    const userList = await User.find().select('-passwordHash')

    if(!userList){
        res.status(500).json({success:false})
    }
    res.send(userList)
})
router.get('/:id', async (req,res) =>{
    const user = await User.findById(req.params.id).select('-passwordHash')

    if(!user)
        res.status(500).json({message:"The user with the givern id was not found"})
    
    res.status(200).send(user)
})

router.post('/', async (req,res)=>{
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10) ,
        phone: req.body.phone,
        Address: req.body.Address,
        isAdmin: req.body.isAdmin,
    })
    user = await user.save()

    if(!user)
    return res.status(404).status.send('The user cannot be created')

    res.send(user)
})
router.post('/login', async (req,res) => {
    const user = await User.findOne({name:req.body.name})

    if(!user){
        return res.status(400).send('The user was not found')
    }
    if(user &&  bcrypt.compareSync(req.body.password, user.passwordHash)) {
        res.status(200).send('user Authenticated')
    }else {
        res.status(400).send('password is wrong')
    } 
})



module.exports = router