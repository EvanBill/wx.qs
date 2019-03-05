const api = require('./request.js')
const order_cache = {
  address: null,
  products: [],
  id: "",
  payment: null,
  store: [],
  sharerData: {
    sharerId: null,
    sharerTime: null
  },
  coupon: null
}
export function SaveSharerData(id, time) {
  order_cache.sharerData = {
    sharerId: id,
    sharerTime: time
  };
}
export function getSharerData() {
  return order_cache.sharerData;
}

export function SaveProducts(products) {
  order_cache.products = products;
}

export function SaveAddress(address) {
  order_cache.address = address;
}
export function SaveCoupon(coupon) {
  order_cache.coupon = coupon;
}
export function saveStore(store) {
  order_cache.store = store;
}

export function getStore() {
  return order_cache.store;
}


export function getCoupon() {
  return order_cache.coupon;
}

export function SaveId(id) {
  order_cache.id = id;
}

export function GetOrder() {
  return order_cache;
}

export function SavePayment(payment) {
  order_cache.payment = payment
}

export function ResetCache() {
  order_cache.address = null;
  order_cache.products = [];
  order_cache.payment = null;
}

export function ResetCoupon() {
  order_cache.coupon = null;
}

export function ResetAddress() {
  order_cache.address = null;
}
/**
 * 发起支付接口
 * orderNo 订单号
 * successNotifyUrl 支付成功回调地址 必填 注意，使用绝对路径 如 /pages/orders/order.detail/order.detail?orderId=111
 * cancelNotifyUrl 取消支付回调地址 注意，使用绝对路径 如 /pages/orders/order.detail/order.detail?orderId=111
 * errorNotifyUrl 支付失败回调地址 注意，使用绝对路径 如 /pages/orders/order.detail/order.detail?orderId=111
 */
export function Pay(orderNo, tip_success, tip_fail) {
  return new Promise((resolve, reject) => {
    api.fetchRequest(`/userTradeRecord/${orderNo}/minaPay`).then(function(res) {
      var sharedId = res.data.sharedId
      wx.requestPayment({
        timeStamp: res.data.timestamp,
        nonceStr: res.data.noncestr,
        package: res.data.appPackage,
        signType: res.data.signType,
        paySign: res.data.sign,
        success: (res) => {
          if (tip_success) {
            const pages = getCurrentPages()
            var curentPage = pages[pages.length - 1]
            if (curentPage.route == "pages/order/pay-result/index" || curentPage.route == "pages/order/order-confirm/confirm") {
              wx.redirectTo({
                url: '/pages/order/pay-result/index?isSuccess=true&orderNo=' + orderNo + '&id=' + order_cache.id + '&sharedId=' + sharedId,
              })
            } else {
              wx.navigateTo({
                url: '/pages/order/pay-result/index?isSuccess=true&orderNo=' + orderNo + '&id=' + order_cache.id + '&sharedId=' + sharedId,
              })
            }
          }
          resolve(res);
        },
        fail: (err) => {
          if (tip_fail) {
            switch (err.errMsg) {
              // case 'requestPayment:fail cancel':
              //   wx.showToast({
              //     title: '已取消支付',
              //     icon: 'none'
              //   })
              //   break;
              default: const pages = getCurrentPages()
              var curentPage = pages[pages.length - 1]
              if (curentPage.route == "pages/order/pay-result/index" || curentPage.route == "pages/order/order-confirm/confirm") {
                wx.redirectTo({
                  url: '/pages/order/pay-result/index?isSuccess=false&orderNo=' + orderNo + '&id=' + order_cache.id,
                })
              } else {
                wx.navigateTo({
                  url: '/pages/order/pay-result/index?isSuccess=false&orderNo=' + orderNo + '&id=' + order_cache.id,
                })
              }
              break;
            }
          }
          reject(err);
        }
      });
    })
  })
}

export function GetTotalPrice() {
  let price = 0;
  const products = order_cache.products;
  if (products && products.length > 0) {
    products.forEach(product => {
      price += product.productPrice
    });
  }
  return price;
}