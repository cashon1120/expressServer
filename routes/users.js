const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Until = require('../util/util')

//用户登录
router.post('/login', (req, res, next) => {
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  User.findOne(param, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message
      })
    } else {
      if (doc) {
        res.cookie('userId', doc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24
        })
        res.cookie('userName', doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24
        })
        res.json({
          status: 0,
          msg: '登录成功',
          result: {
            userName: doc.userName
          }
        })
      } else {
        res.json({
          status: 1,
          msg: '账号或密码错误'
        })
      }
    }
  })
})

//退出登录
router.post('/logOut', (req, res, next) => {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  })
  res.cookie('userName', '', {
    path: '/',
    maxAge: -1
  })
  res.json({
    status: 0,
    msg: '',
    result: ''
  })
})

//判断是否登录
router.get('/checkLogin', (req, res, next) => {
  if (req.cookies.userId) {
    res.json({
      status: 0,
      msg: '',
      result: {
        userName: req.cookies.userName
      }
    })
  }
})

//购物车列表
router.get('/cartList', (req, res, next) => {
  let userId = req.cookies.userId;
  User.findOne({
    userId: userId
  }, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: 0,
          msg: '',
          result: doc.cartList
        })
      }
    }
  })
})

//删除购物车产品
router.post('/cartDel', (req, res, next) => {
  let userId = req.cookies.userId,
    productId = req.body.productId;
  User.update({
    userId: userId
  }, {
    $pull: {
      cartList: {
        productId: productId
      }
    }
  }, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: 0,
        msg: '',
        result: 'success'
      })
    }
  })
})

//修改产品信息
router.post('/cartEdit', (req, res, next) => {
  let userId = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked;
  User.update({
    userId: userId,
    'cartList.productId': productId
  }, {
    'cartList.$.productNum': productNum,
    'cartList.$.checked': checked
  }, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: 0,
        msg: '',
        result: 'success'
      })
    }
  })
})

//全选
router.post('/checkAll', (req, res, next) => {
  let userId = req.cookies.userId,
    checkAll = req.body.checkAll ? '1' : '0';
  User.findOne({
    userId: userId
  }, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        doc.cartList.forEach((item) => {
          item.checked = checkAll;
        })
        doc.save((saveErr, saveDoc) => {
          res.json({
            status: 0,
            msg: '',
            result: 'success'
          })
        })
      }
    }
  })
})

//获取地址
router.get('/address', (req, res, next) => {
  let userId = req.cookies.userId;
  User.findOne({
    userId: userId
  }, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: 0,
        msg: '',
        result: doc.addressList
      })
    }
  })
})
//设置默认地址
router.post('/setDefault', (req, res, next) => {
  let userId = req.cookies.userId,
    addressId = req.body.addressId;
  if (!addressId) {
    res.json({
      status: 1003,
      msg: '错误的参数',
      result: ''
    })
    return
  }
  User.findOne({
    userId: userId,
  }, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        doc.addressList.forEach(item => {
          if (item.addressId == addressId) {
            item.isDefault = true;
          } else {
            item.isDefault = false;
          }
        })
        doc.save((saveErr, saveDoc) => {
          res.json({
            status: 0,
            msg: 'err.message',
            result: 'success'
          })
        })
      }
    }
  })
})

//删除地址
router.post('/delAddress', (req, res, next) => {
  let userId = req.cookies.userId,
    addressId = req.body.addressId;
  User.update({
    userId: userId
  }, {
    $pull: {
      addressList: {
        addressId: addressId
      }
    }
  }, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: 0,
        msg: '',
        result: 'success'
      })
    }
  })
})
router.post('/payMent', (req, res, next) => {
  let userId = req.cookies.userId,
    addressId = req.body.addressId,
    orderTotal = req.body.orderTotal;
  User.findOne({
    userId: userId
  }, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        let addressInfo = '';
        let goodsList = [];
        let order = {};
        doc.addressList.forEach(item => {
          if (item.addressId == addressId) {
            addressInfo = item;
          }
        })
        doc.cartList.filter(item => {
          if (item.checked == 1) {
            goodsList.push(item)
          }
        })
        let platForm = 'jd' //平台标识
        let r1 = Math.floor(Math.random() * 10);
        let r2 = Math.floor(Math.random() * 10);
        let systemDate = new Date().Format('yyyyMMddhhmmss');
        let createTime = new Date().Format('yyyy-MM-dd hh:mm:ss')
        let orderId = platForm + r1 + systemDate + r2;
        order = {
          orderId: orderId,
          orderTotal: orderTotal,
          addressInfo: addressInfo,
          goodsList: goodsList,
          orderStatus: 1,
          createData: createTime
        }
        doc.orderList.push(order);
        doc.save((err1, doc1) => {
          if (err1) {
            res.json({
              status: 1,
              msg: err.message,
              result: ''
            })
          } else {
            res.json({
              status: 0,
              msg: '',
              result: {
                orderId: order.orderId,
                orderTotal: order.orderTotal
              }
            })
          }
        })
      }
    }
  })
})
//获取订单详情
router.get('/orderDetail', (req, res, next) => {
  let userId = req.cookies.userId,
    orderId = req.query.orderId;
  User.findOne({
    userId: userId
  }, (err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message,
        result: ''
      })
    } else {
      if (doc && doc.orderList.length > 0) {
        doc.orderList.forEach(item => {
          if (item.orderId == orderId) {
            res.json({
              status: 0,
              msg: '',
              result: {
                orderId: item.orderId,
                orderTotal: item.orderTotal
              }
            })
          }
        })
      } else {
        res.json({
          status: 1,
          msg: '',
          result: '没有此订单'
        })
      }
    }
  })
})
//查询购物车数量
router.get('/getCartCount', (req, res, next) => {
  let userId = req.cookies.userId;
  if (userId) {
    User.findOne({
      userId: userId
    }, (err, doc) => {
      if (err) {
        res.json({
          status: 1,
          msg: err.message,
          result: ''
        })
      } else {
        var cartList = doc.cartList;
        let count = 0;
        cartList.map(item => {
          count += parseInt(item.productNum);
        })
        res.json({
          status: 0,
          msg: '',
          result: count
        })
      }
    })
  }
})
module.exports = router;