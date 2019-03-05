// components/items/coupon/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

    couponData: Object,
    status: {
      type: Number,
      value: 1
    },
    isFromReceive: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    imageBg: [
      "/images/bg_hs.png", //失效、已使用
      "/images/bg_pt.png", //平台
      "/images/bg_nan.png", //单品
      "/images/bg_nv.png", //类目
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onItemCouponClick: function(res) {
      this.triggerEvent("onItemCouponClick", {
        "itemCouponData": res.currentTarget.dataset.coupon
      })
    }
  }
})