// components/user/login.js

const app = getApp()
const api = require('../../../utils/request.js');
const user = require('../../../utils/user.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    status: {
      type: Number,
      value: 1 // 页面状态 1:加载中 2:未绑定手机号 3:修改手机号码 
    },
    // 是否成为分享人
    isShared: {
      type: Boolean,
      value: false
    },
    // 是否绑定手机号码
    isBindMobile: {
      type: Boolean,
      value: false
    },
    // 是否更改手机号码
    isChangeMobile: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mobile: '',
    str: "发送验证码",
    timer: '',
    downCount: -1,
    check: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //发送手机验证码
    onSendCode: function() {
      if (this.data.downCount >= 0)
        return;
      var phonetel = /^(1)\d{10}$/;
      const _this = this;
      if (this.data.mobile == null || this.data.mobile.length < 11) {
        wx.showToast({
          title: '请输入手机号', //标题
          icon: 'none',
        })
        return;
      }
      if (!phonetel.test(this.data.mobile)) {
        wx.showToast({
          title: '请输入正确的手机号', //标题
          icon: 'none',
        })
        return;
      }
      api.fetchRequest('/sms/coder/' + _this.data.mobile, {}, "GET").then(function(res) {
        _this.onStartTimerDown(60);
      })
    },
    //启动倒计时
    onStartTimerDown: function(time) {
      const _this = this;
      this.data.downCount = time;
      _this.setData({
        str: (time-- + "s")
      });
      this.data.timer = setInterval(function() {
        if (time <= 0) {
          _this.onStopTimerDown();
        } else {
          _this.setData({
            str: (time-- + "s")
          });
        }
      }, 1000);
    },
    onStopTimerDown: function() {
      clearInterval(this.data.timer);
      this.data.downCount = -1;
      this.setData({
        str: "发送验证码"
      });
    },
    onRebind: function() {
      this.setData({
        mobile: "",
        [`user.mobile`]: ""
      })

      this.triggerEvent('rebindMobile', {})


    },
    onTel(e) {
      this.data.mobile = e.detail.value;
    },
    formSubmit: function(e) {

      if (this.data.mobile == null || this.data.mobile.length < 11) {
        wx.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      if (!user.TestingMobile(this.data.mobile)) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }

      const _this = this;
      if (this.properties.status != 3) {
        var code = e.detail.value.code;
        if (code.length < 6) {
          wx.showToast({
            title: '验证码错误',
            icon: 'none'
          });
          return;
        }
      } else if (!this.data.isShared) {
        wx.navigateBack({

        })
        return
      }


      var isCheck = this.data.check ? 1 : 0;

      if (this.properties.isShared) {
        if (!isCheck) {
          wx.showToast({
            title: '请勾选成为分享人',
            icon: 'none'
          });
          return
        }
      }

      var mobile = user.GetUserMobile()
      var obj = {}
      var stirng = ""
      // 成为分享人切已绑定手机号码
      if (this.properties.isShared && mobile && this.properties.status == 3){
        stirng = '/users/become_sharer'
      } else if (this.properties.isShared){
        stirng = '/users/bind'
        obj["code"] = code
        obj["mobile"] = _this.data.mobile
        obj["shared"] = true

      } else if (this.properties.isBindMobile) {
        // 绑定手机号，且已有手机号码，且为输入状态
        if ((this.properties.isBindMobile && mobile) && this.properties.status == 3) {
          wx.navigateBack({

          })
          return
        }
        stirng = '/users/bind'
        obj["code"] = code
        obj["mobile"] = _this.data.mobile
        obj["shared"] = false
      // 修改手机号
      } else if (this.properties.isChangeMobile && mobile) {
        stirng = '/users/modify_mobile'
        obj["code"] = code
        obj["mobile"] = _this.data.mobile
      } else {
        stirng = '/users/bind'
        obj["code"] = code
        obj["mobile"] = _this.data.mobile
        obj["shared"] = false
      }



      // if ((this.properties.isShared && mobile) && this.properties.status == 3) {

      //   stirng = '/users/become_sharer'
      // } else if ((this.properties.isBindMobile && mobile) && this.properties.status == 3) {
      //   wx.navigateBack({

      //   })
      //   return
      // } else {
      //   stirng = '/users/bind/' + _this.data.mobile + '/' + isCheck + '/' + code
      // }
      wx.showLoading({})

      api.fetchRequest(stirng, obj, "PUT").then((res) => {
        var info = user.GetUserInfo()
        info.mobile = _this.data.mobile
        info.shared = isCheck == 1
        info.userId = res.data.userId || info.userId
        user.SaveUserInfo(info)

        var isMobile = this.properties.isChangeMobile | this.properties.isBindMobile
        _this.triggerEvent('login', {
          user: info,
          isMobile: isMobile
        })
        if (this.properties.isShared) {
          if (info.shared) {
            wx.showToast({
              title: '成功成为分享人',
              icon: 'none',
            })
            if (stirng == '/users/bind') {

              api.fetchRequest(`/activities?type=${'1'}`).then(function (res) {

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
        } else if (this.properties.isBindMobile) {
          wx.showToast({
            title: '绑定成功',
            icon: 'none',
          })
          if (stirng == '/users/bind') {

            api.fetchRequest(`/activities?type=${'1'}`).then(function (res) {

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
        } else {
          wx.showToast({
            title: '修改成功',
            icon: 'none',
          })
        }
      }).catch(err => {
        if (err.data.customCode == 403) {
          this.triggerEvent('relogin', {})
        }
      }).finally(() => {
        wx.hideLoading();
      })
    },
    check: function() {
      this.setData({
        check: !this.data.check
      })
    },
    showProtocol: function() {
      wx.navigateTo({
        url: '/pages/login/protocol/index',
      })
    }
  },
  ready: function() {
    var info = user.GetUserInfo()
    this.setData({
      user: info,
      check: info.shared,
      mobile: info.mobile
    })
  }
})