const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Goods = require('../models/goods')
//连接mongodb数据库
mongoose.connect('mongodb://127.0.0.1:27017/vuemall')
mongoose.connection.on('connected', () => {
    console.log('MongoDB connect success')
}).on('error', () => {
    console.log('MongoDB connect fail')
}).on('disconnected', () => {
    console.log('MongoDB connected disconnected')
})
router.get('/', (req, res, next) => {
    let params = {}
    let page = req.param('page');
    let pageSize = req.param('pageSize');
    let skip = (page - 1) * pageSize;
    let sort = req.param('sort');
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({ 'salePrice': sort })
    goodsModel.exec((error, doc) => {
        if (error) {
            res.json({
                status: 1,
                msg: error.message
            })
        } else {
            res.json({
                status: 0,
                msg: '',
                result: {
                    count: doc.length,
                    list: doc
                }
            })
        }
    })
})
module.exports = router;