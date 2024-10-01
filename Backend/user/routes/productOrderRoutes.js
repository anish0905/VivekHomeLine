const express = require('express')
const { productOrder, cancelledOrder, getProductOrdersByUserId,  productOrderById, assgintoDeliveryBoy,getAllOrder,updateOrderStatus} = require('../controllers/productOrderController')

const router = express.Router()

router.post("/orderProduct",productOrder)
router.put("/cancelOrder/:orderId",cancelledOrder)
router.get("/getHistory/:userId", getProductOrdersByUserId )
router.get("/getorder/:orderId",  productOrderById )
router.patch("/assgintoDeliveryBoy",assgintoDeliveryBoy)
router.patch("/changeOrderStatus",updateOrderStatus)
router.get("/",getAllOrder)


module.exports = router;