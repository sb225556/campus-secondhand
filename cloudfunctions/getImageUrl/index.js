const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  const { fileList = [] } = event;

  try {
    if (!fileList || fileList.length === 0) {
      return {
        success: true,
        tempFileList: [],
      };
    }

    const result = await cloud.getTempFileURL({
      fileList: fileList,
    });

    const tempFileList = (result.fileList || []).map(item => {
      return item.tempFileURL || '';
    });

    return {
      success: true,
      tempFileList,
    };
  } catch (err) {
    console.error('获取临时文件链接失败:', err);
    return {
      success: false,
      error: err.message || '获取图片链接失败',
    };
  }
};
