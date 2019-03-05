//app.js
const user = require('utils/user.js')
const api = require('utils/request.js')
const payment = require('utils/payment.js')
const util = require('utils/util.js')

App({
  onLaunch: function () {
    var phone = wx.getSystemInfoSync();  //调用方法获取机型
    if (phone.platform == 'ios') {
      this.globalData.isiOS = true;
    }
    // payment.SaveSharerData(null, null)
    this.checkUpdate()
  },
  onShow: function (options) {
    // api.resetAllRequest()
    // if (user.CheckUserInfo()) {
    //   api.fetchRequest("/users/loggedin").then((res) => {
    //     console.log(res);
    //     if (!res.data) {
    //       user.SaveUserInfo("")
    //     } else {
    //       if ((user.GetUserInfo().sex == null || user.GetUserInfo().sex == 0) && user.CheckUserMobile())
    //         wx.navigateTo({
    //           url: '/pages/login/select-gender/inedx',
    //         })
    //     }
    //   })
    // }
    // this.checkBox()
  },
  /** 
   * 判断生日是否为当天弹出领取优惠券 
   */
  checkBox: function () {
    api.fetchRequest('/users/info').then(function (res) {
      var str = res.data.birthday
      var date = ""
      try {
        date = str.slice(0, 10);
      } catch (err) {
        date = ""
      }
      if (date == util.formatDate(new Date()) && date != null) {
        if (wx.getStorageSync('isGetCoupon') != 1) {
          api.fetchRequest(`/activities?type=${'3'}`).then(function (res) {
            wx.setStorageSync("isGetCoupon", 1)
            wx.navigateTo({
              url: `/pages/user/get-coupon/index?activityIds=${res.data}`,
            })
          }).catch(function (res) {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          })
        }

      }

    })
  },
  /**
   * 检查更新(只针对冷启动有效)
   */
  checkUpdate: function () {
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，可能导致有些功能无法使用，请升级到最新微信版本。'
      })
    }
  },
  globalData: {
    userInfo: wx.getStorageSync('user'),
    _path: 'http://192.168.0.133:8804',
    header: {
      Authorization: wx.getStorageSync('user').token
    },
    isiOS: false,
    imageThumbnail: '',
    imageThumbnailList: '',
  }
})