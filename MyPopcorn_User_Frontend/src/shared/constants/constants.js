export const Constants = () => {
  const constant = {
    // admin service
    register: "/user/register",
    PasswordLogin: "/user/passwordlogin",
    googleLogin: "/user/login",
    updatePassword: "/user/changepassword",
    otpVerify: "/user/verify2FA",
    logout: "/user/logout",
    sitemaintance: "/user/siteSettings/update",

    // notifications
    getallnotifications: "/user/getallnotifications",
    deleteNotification: "/user/deleteallnotifications",
    readAllNotification: "/user/readallnotifications",
    unreadNotifications: "/user/getUnReadNotifications",

    //walletServices
    getPolygonBalances: "/user/getbalance",
    getPopcornbalance: "/user/getbalancess",
    transfer: "/user/transfer",
    transtoken: "/user/transtoken",
    getAllTransaction: "/user/transaction",
    claimtransaction: "/user/rewardtransfer",
    reedemtoken: "/user/redeemtoken",

    //surveyServices
    createSurvey: "/user/creation",
    uploadphoto: "/user/kyc/upload",
    getAllQuestions: "/user/survey",
    getGraphData: "/user/surveyuseractivity",
    getAllSurvey: "/user/getuserallsurvey",
    submitsurvey: "/user/sumbit",
    userSurveyResponse: "/user/surveyresponse",

    //profileserviceuser
    getProfile: "/user/userInfo",
    getDashboardData: "/user/dashboard",
    getQr: "/user/getqr",
    enable2FA: "/user/qrcodeEnableDisable",
    updateProfile: "/user/updateprofile",
  };
  return constant;
};
