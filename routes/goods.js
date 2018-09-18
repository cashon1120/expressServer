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
router.get('/list', (req, res, next) => {
    let params = {}
    let page = parseInt(req.query.page);
    let pageSize = parseInt(req.query.pageSize);
    let skip = (page - 1) * pageSize;
    let sort = req.query.sort;
    let priceArea = parseInt(req.query.priceArea);
    switch (priceArea) {
        case 1:
            params = { salePrice: { $gt: 0, $lte: 100 } };
            break;
        case 2:
            params = { 'salePrice': { $gt: 100, $lte: 500 } };
            break;
        case 3:
            params = { 'salePrice': { $gt: 500, $lte: 1000 } };

            break;
        case 4:
            params = { 'salePrice': { $gt: 1000, $lte: 5000 } };
            break;
    }
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    if (sort != 0) {
        goodsModel.sort({ 'salePrice': sort })
    }
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
router.post('/addCart', (req, res, next) => {
    let userId = "100000077", productId = req.body.productId;
    let User = require('../models/user');
    User.findOne({ userId: userId }, (userErr, userdoc) => {
        if (userErr) {
            res.json({
                status: 1,
                msg: userErr.message
            })
        } else {
            if (userdoc) {
                let goodsItem = '';
                userdoc.cartList.forEach((item) => {
                    if (item.productId == productId) {
                        goodsItem = item;
                        item.productNum++;
                    }
                })
                if (goodsItem) {
                    userdoc.save((saveErr, saveDoc) => {
                        if (saveErr) {
                            res.json({
                                status: 1,
                                msg: saveErr.message
                            })
                        } else {
                            res.json({
                                status: 0,
                                msg: '',
                                result: 'success'
                            })
                        }
                    })
                } else {
                    Goods.findOne({ productId: productId }, (proErr, proDoc) => {
                        if (proErr) {
                            res.json({
                                status: 1,
                                msg: proErr.message
                            })
                        } else {
                            if (proDoc) {
                                proDoc.productNum = 1;
                                proDoc.checked = 1;
                                userdoc.cartList.push(proDoc);
                                userdoc.save((saveErr, saveDoc) => {
                                    if (saveErr) {
                                        res.json({
                                            status: 1,
                                            msg: saveErr.message
                                        })
                                    } else {
                                        res.json({
                                            status: 0,
                                            msg: '',
                                            result: 'success'
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        }
    })
})
module.exports = router;