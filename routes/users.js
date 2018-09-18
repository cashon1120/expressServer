const express = require('express');
const router = express.Router();
const User = require('../models/user')

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
          maxAge: 1000 * 60 * 60
        })
        res.cookie('userName', doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
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
  User.findOne({ userId: userId }, (err, doc) => {
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
  let userId = req.cookies.userId, productId = req.body.productId;
  User.update({ userId: userId }, { $pull: { cartList: { productId: productId } } }, (err, doc) => {
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
  let userId = req.cookies.userId, productId = req.body.productId, productNum = req.body.productNum, checked = req.body.checked;
  User.update({ userId: userId, 'cartList.productId': productId }, { 'cartList.$.productNum': productNum, 'cartList.$.checked': checked }, (err, doc) => {
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
  let userId = req.cookies.userId, checkAll = req.body.checkAll ? '1' : '0';
  User.findOne({ userId: userId }, (err, doc) => {
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
module.exports = router;
