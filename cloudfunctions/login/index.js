const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { nickName, avatarUrl } = event;

  try {
    const existingUser = await db.collection('users').doc(OPENID).get();
    
    await db.collection('users').doc(OPENID).update({
      data: {
        lastLoginTime: Date.now(),
      },
    });

    return {
      success: true,
      openid: OPENID,
      userInfo: existingUser.data,
    };
  } catch (err) {
    if (err.errCode === -404001) {
      const newUser = await db.collection('users').doc(OPENID).set({
        data: {
          nickName: nickName || '用户',
          avatarUrl: avatarUrl || '',
          createTime: Date.now(),
          lastLoginTime: Date.now(),
        },
      });

      return {
        success: true,
        openid: OPENID,
        userInfo: {
          _id: OPENID,
          nickName: nickName || '用户',
          avatarUrl: avatarUrl || '',
          createTime: Date.now(),
          lastLoginTime: Date.now(),
        },
      };
    }

    return {
      success: false,
      error: err.message,
    };
  }
};