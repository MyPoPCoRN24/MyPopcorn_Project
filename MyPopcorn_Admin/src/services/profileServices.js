import url from "../shared/constants/url";
import { Constants } from "../shared/constants/constants";

export const profileServices = () => {
  const constants = Constants();

  const getProfile = () => {
    return url.get(constants.getProfile);
  };

  const getApiKey = () => {
    return url.get(constants.fetchapikey);
  };

  const getDashboardData = () => {
    return url.get(constants.getDashboard);
  };

  const updateProfile = (val) => {
    return url.post(constants.updateProfile, val);
  };

  const get2FAQrDetails = () => {
    return url.get(constants.getQr);
  };

  const getNotifications = (val) => {
    return url.post(constants.getallnotifications, val);
  };

  const readAllNotifications = () => {
    return url.get(constants.readAllNotification);
  };

  const deleteNotification = () => {
    return url.delete(constants.deleteNotification);
  };

  const submit2FA = (val) => {
    return url.post(constants.enable2FA, val);
  };

  const updatePassword = (val) => {
    return url.post(constants.updatePassword, val);
  };

  const sendNotification = (val) => {
    return url.post(constants.sendNotification, val);
  };

  const getAllUsers = (val) => {
    return url.post(constants.getAllUsers, val);
  };

  const getAllEmails = (val) => {
    return url.post(constants.getEmails, val);
  };

  const updateToken = (val) => {
    return url.post(constants.updatetoken, val);
  };

  const deleteEmail = (id) => {
    return url.delete(`${constants.deleteEmail}/${id}`);
  };

  return {
    getProfile,
    getNotifications,
    deleteNotification,
    get2FAQrDetails,
    submit2FA,
    updateProfile,
    updatePassword,
    getAllUsers,
    getDashboardData,
    readAllNotifications,
    sendNotification,
    getAllEmails,
    deleteEmail,
    updateToken,
    getApiKey,
  };
};
