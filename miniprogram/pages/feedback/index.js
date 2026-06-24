const app = getApp();

Page({
  data: {
    typeList: [
      { value: 'suggestion', label: '功能建议' },
      { value: 'bug', label: 'Bug反馈' },
      { value: 'other', label: '其他' },
    ],
    currentType: 'suggestion',
    content: '',
    contact: '',
    images: [],
    submitting: false,
  },

  onTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ currentType: type });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  onUploadImage() {
    const remain = 6 - this.data.images.length;
    if (remain <= 0) return;

    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePaths = res.tempFilePaths;
        const images = [...this.data.images];

        wx.showLoading({ title: '上传中...' });

        for (let i = 0; i < tempFilePaths.length; i++) {
          try {
            const uploadResult = await wx.cloud.uploadFile({
              cloudPath: `feedback/${Date.now()}_${i}.png`,
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

        this.setData({ images });
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
          const images = [...this.data.images];
          images.splice(index, 1);
          this.setData({ images });
        }
      },
    });
  },

  async onSubmit() {
    const { currentType, content, contact, images } = this.data;

    if (!content.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none',
      });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    try {
      const result = await wx.cloud.callFunction({
        name: 'submitFeedback',
        data: {
          type: currentType,
          content: content.trim(),
          contact: contact.trim(),
          userName: (app.globalData.userInfo && app.globalData.userInfo.nickName) || '匿名用户',
          images: images,
        },
      });

      if (result.result && result.result.success) {
        wx.hideLoading();
        wx.showToast({
          title: '提交成功',
          icon: 'success',
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.hideLoading();
        wx.showToast({
          title: (result.result && result.result.error) || '提交失败',
          icon: 'none',
        });
      }
    } catch (err) {
      console.error('提交反馈失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '提交失败',
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
