//index.js
//获取应用实例
const app = getApp()

Component({
  /**
   * 参数，height为高度，请使用rpx作为单位
   * 参数，hyperlink为超链接，为true时且存在产品id可跳转
   * 参数，banners为显示的图片数组，必须拥有image参数，若需要调整，需要存在productId参数
   */
  properties: {
    height: {
      type: String,
      value: '375rpx'
    },
    hyperlink: {
      type: Boolean,
      value: true,
    },
    banners: {
      type: Array,
      value: [],
    }
  },
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    afterColor: '#005cbf',
    imageThumbnail: app.globalData.imageThumbnail,
    circular: true,
  },
  methods: {
    handleTap: function (e) {
      const item = e.currentTarget.dataset.item
      if (item.productId && this.data.hyperlink) {
        wx.navigateTo({
          url: `/pages/product-detail/index?productId=${item.productId}`,
        })
      } else if (item.url != null && item.url!=""){
        wx.navigateTo({
          url: `/pages/webview/webview?url=${item.url}`,
        })
      } else if (item.type ==3) {
       
        wx.navigateTo({
          url: `/pages/user/get-coupon/index?activityId=${item.activityId}`,
        })
      }
    }
  }
})
