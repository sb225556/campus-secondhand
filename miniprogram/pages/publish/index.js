const app = getApp();

Page({
  data: {
    formData: {
      name: '',
      category: '',
      price: '',
      description: '',
      contact: '',
      images: [],
    },
    categories: ['数码产品', '图书教材', '生活用品', '运动户外', '服饰鞋包', '其他'],
  },

  onLoad() {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.options && prevPage.options.itemId) {
      this.loadItem(prevPage.options.itemId);
    }
  },

  async loadItem(itemId) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getItemDetail',
        data: { itemId },
      });

      if (result.result.success) {
        const item = result.result.item;
        this.setData({
          formData: {
            name: item.name,
            category: item.category,
            price: String(item.price),
            description: item.description,
            contact: item.contact,
            images: item.images,
          },
        });
      }
    } catch (err) {
      console.error('获取物品信息失败:', err);
    }
  },

  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value,
    });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      'formData.category': this.data.categories[index],
    });
  },

  onPriceInput(e) {
    this.setData({
      'formData.price': e.detail.value,
    });
  },

  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value,
    });
  },

  onContactInput(e) {
    this.setData({
      'formData.contact': e.detail.value,
    });
  },

  async onUploadImage() {
    if (this.data.formData.images.length >= 6) {
      wx.showToast({
        title: '最多上传6张图片',
        icon: 'none',
      });
      return;
    }

    wx.chooseImage({
      count: 6 - this.data.formData.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePaths = res.tempFilePaths;
        const images = [...this.data.formData.images];

        wx.showLoading({ title: '上传中...' });

        for (let i = 0; i < tempFilePaths.length; i++) {
          try {
            const uploadResult = await wx.cloud.uploadFile({
              cloudPath: `items/${Date.now()}_${i}.png`,
              filePath: tempFilePaths[i],
            });
            images.push(uploadResult.fileID);
          } catch (err) {
            console.error('上传图片失败:', err);
            wx.showToast({
              title: '上传失败',
              icon: 'none',
            });
          }
        }

        this.setData({
          'formData.images': images,
        });

        wx.hideLoading();
      },
    });
  },

  onDeleteImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          const images = [...this.data.formData.images];
          images.splice(index, 1);
          this.setData({
            'formData.images': images,
          });
        }
      },
    });
  },

  async onSubmit() {
    const { name, category, price, description, contact, images } = this.data.formData;

    if (!name.trim()) {
      wx.showToast({ title: '请输入物品名称', icon: 'none' });
      return;
    }
    if (!category) {
      wx.showToast({ title: '请选择物品分类', icon: 'none' });
      return;
    }
    if (!price.trim()) {
      wx.showToast({ title: '请输入物品价格', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      wx.showToast({ title: '请输入物品描述', icon: 'none' });
      return;
    }
    if (!contact.trim()) {
      wx.showToast({ title: '请输入联系方式', icon: 'none' });
      return;
    }
    if (images.length === 0) {
      wx.showToast({ title: '请至少上传一张图片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发布中...' });

    try {
      const result = await wx.cloud.callFunction({
        name: 'createItem',
        data: {
          name: name.trim(),
          category,
          price: Number(price),
          description: description.trim(),
          contact: contact.trim(),
          images,
          userName: app.globalData.userInfo?.nickName || '用户',
          userAvatar: app.globalData.userInfo?.avatarUrl || '',
        },
      });

      if (result.result.success) {
        wx.showToast({
          title: '发布成功',
          icon: 'success',
        });
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index',
          });
        }, 1500);
      } else {
        wx.showToast({
          title: result.result.error || '发布失败',
          icon: 'none',
        });
      }
    } catch (err) {
      console.error('发布失败:', err);
      wx.showToast({
        title: '发布失败',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },
});