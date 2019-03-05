//index.js
const app = getApp()
const u = require('../../../utils/user.js')
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')

Page({
  data: {
    backTopValue: false,
    banners: [],
    products: [],
    tabs: [{
      name: '最新发布',
      status: 1
    }, {
      name: '附近',
      status: 2
    }, {
      name: '趣拼',
      status: 2
    }, {
      name: '我的社区',
      status: 2
    }],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    showModal: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    count: 0,
    hasMobile: false,
    needMeasure: true,
    imageThumbnail: app.globalData.imageThumbnailList
  },
  onLoad: function() {
    wx.showLoading({
      title: '加载中...',
    })

    this.initShare()
    var _this = this;
    wx.getSystemInfo({
      success: function(res) {
        _this.setData({
          sliderLeft: 10 / 2,
          sliderOffset: 240 / _this.data.tabs.length * _this.data.activeIndex
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.hideLoading()
  },

  onShow: function() {
    var mUser = u.GetUserInfo()
    if (mUser != null) {
      this.setData({
        hasMobile: !mUser.shared
      })
    }
    this.getBanner()
    this.getcategory(this.data.page, false)
  },

  onHide: function() {
    wx.hideLoading()
  },
  contact: function() {
    wx.showLoading({
      title: '加载中...',
    })
  },


  /****
   * 分享
   */
  initShare: function() {
    this.data.count = wx.getStorageSync("s_count") || 0
    if (this.data.count == 0) {
      this.onShare()
    }
    this.data.count++;
    wx.setStorageSync("s_count", this.data.count)
  },
  onShare: function() {
    if (this.data.count > 0) {
      wx.navigateTo({
        url: '../../login/login.index/login.index?isShared=true',
      })
      return
    } else {
      this.setData({
        showModal: true
      });
    }
  },
  onShareClose: function() {
    this.setData({
      showModal: false
    });
  },
  onShareGo: function() {
    this.onShareClose()
    wx.navigateTo({
      url: '../../login/login.index/login.index?isShared=true',
    })
  },

  getcategory: function(page, isReach) {
    const url = `/products/mina_products`;
    const query = {
      page: page,
      pageSize: this.data.pageSize,
      gender: this.data.tabs[this.data.activeIndex].status,
      needMeasure: this.data.needMeasure
    }
    api.fetchRequest(url, query).then(res => {
      const list = res.data;
      if (isReach) {
        this.data.page = ++this.data.page
      }
      if (this.data.page == 1) {
        this.data.products = [];
        this.data.hasMore = true;
      }

      if (list.length < this.data.pageSize) {
        this.data.hasMore = false;
      }
      this.setData({
        products: this.data.products.concat(list),
        hasMore: this.data.hasMore
      })

    }).catch(function(err) {
      wx.showToast({
        title: err.data.message,
      })
    })
  },

  getBanner: function() {
    const _this = this
    api.fetchRequest('/banners').then(function(res) {
      _this.setData({
        banners: res.data,
      });
    }).catch(function(err) {
      wx.showToast({
        title: err.data.message,
      })
    })
  },

  tabClick: function(e) {
    if (this.data.activeIndex == e.currentTarget.id) return
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
      page: 1
    });
    this.getcategory(this.data.page, false);

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.data.page = 1
    this.getBanner()
    this.getcategory(this.data.page, false)
    //模拟加载
    setTimeout(function() {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },
  showProductDetail: function(e) {
    const item = e.currentTarget.dataset.product
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/product-detail/index?productId=${item.productId}&type=${type}`,
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var products = this.data.products[this.data.activeIndex];
    var tab = this.data.tabs[this.data.activeIndex];

    this.getcategory(this.data.page + 1, true)
  },

  /***
   * 定制 商城切换
   */
  onDingzhi: function() {
    if (!this.data.needMeasure) {
      this.setData({
        page: 1
      })
    }
    this.setData({
      needMeasure: true
    })
    this.getcategory(this.data.page, false)
  },
  onShopping: function() {
    if (this.data.needMeasure) {
      this.data.page = 1
    }
    this.setData({
      needMeasure: false
    })
    this.getcategory(this.data.page, false)
  },
  // 监听滚动条坐标
  onPageScroll: function(e) {
    var that = this
    var scrollTop = e.scrollTop
    var backTopValue = scrollTop > 100 ? true : false
    that.setData({
      backTopValue: backTopValue
    })
  },
  goTop: function() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  }
})