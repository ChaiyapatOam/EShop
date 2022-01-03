const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan  = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config')

app.use(cors())
app.options('*',cors())
//middleware
const api = process.env.API_URL
//Router
const productsRouter = require('./routers/products')
const categoryRouter = require('./routers/categories')
const userRouter = require('./routers/users')
const ordersRouter = require('./routers/orders')

//Helper
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

app.use(bodyParser.json())
app.use(morgan('tiny')) //HTTP status
app.use(authJwt())
app.use(errorHandler)

app.use(api+'/products',productsRouter)
app.use(api+'/category',categoryRouter)
app.use(api+'/users',userRouter)
app.use(api+'/orders',ordersRouter)

mongoose.connect('mongodb://localhost/VUECRUD',{
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
.then(()=> {
    console.log("Database connected!");
})
.catch((err)=>{
    console.log(err);
})
app.listen(3000,()=>{
    // console.log(api);
    console.log("server running at http://localhost:3000");
})