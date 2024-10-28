export const Constants = () => {
  const constant = {
    // admin service
    register: "/admin/register",
    PasswordLogin: "/admin/passwordlogin",
    updatePassword: "/admin/changepassword",
    otpVerify: "/admin/verify2FA",
    logout: "/admin/logout",
    sitemaintance: "/admin/siteSettings/update",

    // notifications
    getallnotifications: "/admin/getallnotifications",
    deleteNotification: "/admin/deleteallnotifications",
    readAllNotification: "/admin/readallnotifications",
    unreadNotifications: "/admin/getUnReadNotifications",

    //walletServices
    getPolygonBalances: "/admin/getbalance",
    getPopcornbalance: "/admin/getbalancess",
    transfer: "/admin/transfer",
    transtoken: "/admin/transtoken",
    getTransaction: "/admin/transaction",

    //surveyServices
    createSurvey: "admin/creation",
    editSurvey: "admin/updateSurvey",
    uploadphoto: "/admin/kyc/upload",
    getAllQuestions: "/admin/getallquestion",
    createQuestions: "/admin/createQuestion",
    editQuestion: "/admin/editQuestion",
    deleteQuestions: "/admin/deletequestion",
    submitSurvey: "/admin/saveToSurvey",
    submitupdatsurvey: "/admin/updatesavelinkToSurvey",
    getAllSurveys: "/admin/getallsurvey",
    getGraphData: "/admin/surveyactivity",
    getsurveybyuser: "/admin/getsurveybyuser",
    getsurveyanswers: "/admin/surveyresponse",
    surveyAnalytics: "/admin/responseanalyes",
    surveyStatus: "/admin/surveystatus",
    swapQuestionsupanddown: "/admin/questionswap",
    deleteSurvey: "/admin/deleteSurvey",
    swapSurveyPosition: "/admin/swapSurveyPosition",
    editsurveywithlink: "/admin/updatesavelinkToSurveyanddelete",

    //profileservices
    getProfile: "/Admin/adminInfo",
    getQr: "/admin/getqr",
    enable2FA: "/admin/qrcodeEnableDisable",
    updateProfile: "/admin/updateprofile",
    getAllUsers: "/admin/userlist",
    getDashboard: "/admin/dashboard",
    sendNotification: "/admin/sendmail",
    getEmails: "/admin/getemaildata",
    deleteEmail: "/admin/deleteemail",
    updatetoken: "/admin/updatetoken",
    fetchapikey: "/admin/getApiKey",
  };
  return constant;
};
