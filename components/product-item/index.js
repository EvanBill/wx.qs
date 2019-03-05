/**
 * 产品列表中产品条目基础组件
 */
const img = require('../../utils/image.js')
const app = getApp()

Component({
  properties: {
    product: {
      type: Object,
      value: {},
    },
    selected: {
      type: Array,
      value: [],
    },
    invalid: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    isSelected: [],
    imageThumbnail: app.globalData.imageThumbnail,
  },
  methods: {
    selectProduct: function(e) {
      this.triggerEvent('selectProduct', e.currentTarget.dataset.item)
    },
    changeQuantity: function (e) {
      const product = e.currentTarget.dataset.product
      const quantity = Number(e.currentTarget.dataset.quantity)
      if ((product.quantity + quantity) > 0) {
        this.triggerEvent('changeQuantity', { product: product, quantity: quantity })
      }
    },
    changeAttr:function(e){
      const product = e.currentTarget.dataset.product
      this.triggerEvent('changeAttr', { product: product})
    },
    fetchImageFailed: function (e) {
      var dataset = e.currentTarget.dataset;
      var model;
      var key;
      model = this.properties.product;
      key = `product`;
      model.masterImage = img.FetchImageFailed(0);
      this.setData({
        [key]: model
      })
    }
  }
})