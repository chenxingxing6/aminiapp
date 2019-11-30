var Request = require('../../Utils/Request.js');
var app = getApp()
var machineID
var userInfo = app.userInfo
var qrCode = null
var isPermission = 0
var isRequestSuccess = false
var isMember = false
var interval;
var maxTime = 30
var currentTime = maxTime //倒计时的事件（单位：s）

Page({
  data: {
    userInfo: userInfo,
    qrCode: qrCode,
    isPermission: isPermission,
    showLimit: false,  //是否显示限制用户页
    isMember: isMember,
    customerServicePhone: '', //客服电话
    items: [
      {
        title: '开通免密支付',
        des: '开通免密支付，拿完商品即可离开，系统会自动完成扣款，体验超赞。免密支付由腾讯、支付宝和悦盒公司签约，保证安全可靠。',
        buttonTitle: '开通免密支付,拿完即走',
        type: '1',
        img: "../../image/bg_figure.png"
      },
      {
        title: '成为路上会员',
        des: '成为路上会员，享受会员价的同时可获得积分，路上会员也可以在超多餐厅门店享受折扣',
        buttonTitle: '成为会员,立享会员价',
        type: '2',
        img: "../../image/bg_member.png"
      }
    ],
    isHidden:false,
    orderNo:''
  },
  onShow() {
    // 页面显示
    isPermission = 0
    isRequestSuccess = false
    isMember = false
    this.setData({
      isPermission:false,
      isRequestSuccess: isRequestSuccess,
      isMember: isMember,
      isPermission: isPermission,
    })
    this.reloadData()

  },
  onHide() {
    // 页面被关闭
    isPermission = 0
    isRequestSuccess = false
    isMember = false
    this.setData({
      //  isPermission:false,
      isRequestSuccess: isRequestSuccess,
      isMember: isMember,
      isPermission: isPermission
    })
    console.log('unload')
  },
  onLoad(query) { // 先执行
    app.qrCode = 'http://vm.27aichi.com/machine?MzE0NDE0MQ=='
    app.getCurrentTimeType()
    this.setData({
      backgroundImage: app.dateImage,
      dateStr: app.dateStr,
      userInfo: app.userInfo
    })
  },
  memberOrDeposi: function (e) {
    var type = e.currentTarget.dataset.type;
    if (type == '1') {
      var that = this
      Request.openMianmi(function (res) {
        that.queryIfNonSecrete()
      }, function () {
      }
      )
    }
    else if (type == '2') {
      if (!this.data.checkedValue) {
        my.showToast({
          content: '请先同意协议',  
        })
        return
      }
      var that = this
      Request.payMember(function (res) {
        console.log('payMembersuccess')
        interval = setInterval(function () {
          currentTime--
          Request.queryIsMember(function (res) {
            if (res.msg == 1) {
              that.setData({
                isPermission: 1,
                isMember: true,
              })
              clearInterval(interval)
            }
          }, function () {
          })
          if (currentTime <= 0) {
            clearInterval(interval)
          }
        }, 2000)
        that.reloadData();
      }, function () {
      }
      )
    }
  },
  myClick: function () {
    console.log('点击了....')
    if (!userInfo) {
      my.navigateTo({
        url: '../mobileLogin/mobileLogin',
      })
    }
    else {
      my.navigateTo({
        url: '../my/my',
      })
    }
  },
  orderListClick: function () {
    console.log('点击了....')
    if (!userInfo) {
      my.navigateTo({
        url: '../mobileLogin/mobileLogin',
      })
    }
    else {
      my.navigateTo({
        url: '../orderList/orderList',
      })
    }
  },
  
  //轮询开门状态
  openDoorFind: function (open_type, isMember){
    var url = app.globalData.servel_url + 'openDoorFind'
    var params={}
    console.log(this.data)
    params.orderNo = this.data.orderNo;
    params.mode=1;
    params.randomname= new Date();
    params.randompwd= new Date();
    params.machineNo=machineID;
    var that= this
     my.httpRequest({
      url: url,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: params,
      success: function (res) {
        console.log(res)
      if (res.data.code == '0') {
        if (res.data.msg==0){
          setTimeout(function () {
            //要延时执行的代码  
            that.openDoorFind(open_type, isMember)
          }, 1000)
        } else if (res.data.msg == 1){
          my.hideLoading()
          that.setData({
            isHidden:false,
            canClick: true
          })
          my.navigateTo({
            url: '../have-opened/have-opened?orderNo=' + that.data.orderNo + '&open_type=' + open_type + '&isMember=' + isMember,
          })
        } else if (res.data.msg == 2){
          my.hideLoading()
          that.setData({
            isHidden:false,
            canClick: true
          })
          my.showToast({
            content: '开门失败，请重新点击开门',
            duration: app.showToastDuring
          })
        }
      }else{
        my.hideLoading()
        that.setData({
          isHidden:false,
          canClick: true
        })
        console.log(url)
        my.showToast({
          content: res.data.msg,
          duration: app.showToastDuring
        })
      }
    }, 
    fail:function (res) {
      that.setData({
        isHidden:false,
        canClick: true
      })
      my.hideLoading()
      my.showToast({
        content: res.data.msg,
        duration: app.showToastDuring
      })
    }
  })
  },
  opendoor: function () {
    if (!userInfo && app.qrCode) {
      my.navigateTo({
        url: '../mobileLogin/mobileLogin',

      })
      return;
    }
    
    if (!qrCode) {
      my.scan({
        type: 'qr',
        success: (res) => {
          app.qrCode = res.code
        },
      });
      return;
    }
    console.log(qrCode)
    // var open_type = e.currentTarget.dataset.type;
    var open_type = '1'
    console.log("开门类型" + open_type + "机器ID：" + machineID)
    var url = app.globalData.servel_url + 'opendoor'
    console.log(url)
    var that = this
    my.showLoading({
      content: '正在开门',
    })
    my.httpRequest({
      url: url,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        uid: userInfo.uid,
        token: userInfo.token,
        machineID: machineID,
        type: open_type,
        orderSource: '2'
      },
      success: function (res) {
        console.log('开门接口')
        app.qrCode = null
        qrCode = null
        console.log(res.data)
        my.hideLoading()
        if (res.data.code == '0') {
          console.log(res.data.orderNo)
          that.setData({
            canClick: false,
            orderNo: res.data.data.orderNo
          })
          console.log(that.data)
          my.showLoading({
            content: '正在开门',
          })
          that.openDoorFind(open_type, isMember)
        } else {
          my.showToast({
            content: res.data.msg,
            duration: app.showToastDuring
            // type: 'fail'
          })
          that.setData({
            isHidden:false,
          })
        }
      },
      fail: function (res) {
        console.log('opendoor'+JSON.stringify(res.data))
        my.hideLoading()
        my.showToast({
          content: '开门失败,请检查网络',
          duration: app.showToastDuring
        })
        that.setData({
          isHidden:false,
        })
      }
    })
  },
  reloadData: function () {
    var open_type = '1'
    userInfo = app.userInfo
    qrCode = app.qrCode
    isRequestSuccess = false
    this.setData({
      userInfo: userInfo,
      qrCode: qrCode,
      isRequestSuccess: isRequestSuccess,
      isHidden:false,
    })
  },
  zhifu: function (orderInfo) {
    var orderNo = orderInfo.unpaidOrderNo
    var amount = orderInfo.unpaidOrderAmount
    var url = app.globalData.servel_url + 'get_orderstring'
    console.log(url)
    var that = this;
    var role;
    Request.payOrder(orderNo, amount, '会员柜订单:' + orderNo, function () {
      that.reloadData()
    }, function () {
      that.reloadData()
    })
  },
  // 是否同意会员协议
  checkboxChange: function () {
    console.log(123)
    let checkedValue = this.data.checkedValue;
    this.setData({
      checkedValue: !checkedValue
    })
  },
  // 点击同意会员协议文字跳转到协议页面
  toAgreement: function () {
    my.navigateTo({
      url: "../agreement/agreement"
    })
  }
});
