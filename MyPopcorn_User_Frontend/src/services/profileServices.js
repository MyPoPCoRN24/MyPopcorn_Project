import url from "../shared/constants/url";
import { Constants } from "../shared/constants/constants";

export const profileServices = () => {
  const constants = Constants();

  const getProfile = () => {
    return url.get(constants.getProfile);
  };

  const getDashbaord = (val) => {
    return url.post(constants.getDashboardData, val);
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

  return {
    getProfile,
    getNotifications,
    deleteNotification,
    get2FAQrDetails,
    submit2FA,
    updateProfile,
    updatePassword,
    getDashbaord,
    readAllNotifications
  };
};
