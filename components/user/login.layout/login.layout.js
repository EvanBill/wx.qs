// components/user/login.layout/login.layout.js
const user = require('../../../utils/user.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
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
    status: -1, // 页面状态 1:未授权 2:未绑定手机号 3:修改手机号码 4:完成 5:设置性别 -1:加载中
  },
  isMobile:false,
  /**
   * 组件的方法列表
   */
  methods: {
    UserLogin: function(e) {
      var model = e.detail.user;
      this.isMobile = e.detail.isMobile
      this.selectStatusByUser(model);

    },
    rebindMobile: function() {
      this.ChangeStatus(2);
    },
    ChangeStatus(status) {
      this.setData({
        status: status
      })
      if (status == 2){
        this.isMobile = true
      }

      if (status == 4) {
        this.triggerEvent('authorize')

        if (getCurrentPages().length > 1) {
          wx.navigateBack({

          })
        }
      }
    },
    OnReady() {
      var info = user.GetUserInfo();
      this.selectStatusByUser(info)
    },
    selectStatusByUser(info) {
      if (info == "") {
        this.ChangeStatus(1);
      } else {
        // 是否需要成为分享人
        if (this.properties.isShared) {
          // 是否已经是分享人
          if (info.shared) {
            if ((info.sex == null || info.sex == 0) && info.mobile != "") {
              // 设置性别
              this.ChangeStatus(5);
            } else {
              // 如果已经是分享人直接返回
              this.ChangeStatus(4);
            }
          } else {
            // 如果不是分享人判断是否绑定手机号码
            if (info.mobile == "") {
              this.ChangeStatus(2);
            } else {
              this.ChangeStatus(3);
            }
          }
          // 判断是否需要绑定手机号码
        } else if (this.properties.isBindMobile) {
          if (info.mobile == "") {
            this.ChangeStatus(2);
          } else {
            if ((info.sex == null || info.sex == 0) && info.mobile != "") {
              // 设置性别
              this.ChangeStatus(5);
            } else {
              this.ChangeStatus(4);
            }
          }
        } else if (this.properties.isChangeMobile) {
          if (this.data.status == 2 || this.data.status == 5) {
            if ((info.sex == null || info.sex == 0) && info.mobile != "") {
              // 设置性别
              this.ChangeStatus(5);
            } else {
              this.ChangeStatus(4);
            }
          } else {
            if (info.mobile == "") {
              this.ChangeStatus(2);
            } else {
              this.ChangeStatus(3);
            }
          }

        } else {
          if ((info.sex == null || info.sex == 0) && info.mobile != "") {
            // 设置性别
            this.ChangeStatus(5);
          } else {
            // 什么都不需要直接返回
            this.ChangeStatus(4);
          }
        }
      }
    },
    relogin: function() {
      user.SaveUserInfo("")
      this.ChangeStatus(1);
    },
    changeStatus: function() {
      this.ChangeStatus(2);
    }
  },
  ready: function() {
    this.OnReady();
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {
      if (this.data.status == 4 && !user.CheckUserInfo()){
        this.OnReady();
        // 每次进入小程序都会触发，如果正在输入手机号码会直接退出需要加一个字段isMobile
      } else if (this.data.status != -1 && this.data.status != 4 && !this.isMobile) {
        this.OnReady();
      } else if (this.data.status == 2 && user.CheckUserInfo() ){
        this.OnReady();
      }
    },
    hide: function() {},
    resize: function() {},
  }
})