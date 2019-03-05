// components/layout/layout/layout.js
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
    version: false
  },

  ready: function () {
    this.CheckVersion();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    CheckVersion: function () {
      if (wx.canIUse('button.open-type.getUserInfo')) {
        this.setData({
          version: true
        })
      }
    }
  }
})
