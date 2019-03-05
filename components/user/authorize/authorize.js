// components/user/authorize/authorize.js
const app = getApp()
const user = require('../../../utils/user.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    GetUserInfo: function(e) {
      if (e.detail.userInfo) {
        //用户按了允许授权按钮
        user.UserLogin(e.detail).then(res => {
          this.triggerEvent('login', {
            user: res
          })
        }).catch(err => {});
      } else {
        //用户按了拒绝按钮
        wx.showModal({
          title: '警告',
          content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
          showCancel: false,
          confirmText: '返回授权',
          success: function(res) {
            if (res.confirm) {}
          }
        })
      }
    }
  }
})