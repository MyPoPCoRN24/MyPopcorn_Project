import url from "../shared/constants/url";
import { Constants } from "../shared/constants/constants";

export const AuthService = () => {
  const constants = Constants();

  const register = (val) => {
    return url.post(constants.register, val);
  };

  const GoogleLogin = (val) => {
    return url.post(constants.googleLogin, val);
  };

  const passwordLogin = (val) => {
    return url.post(constants.PasswordLogin, val);
  };

  const otpVerifySubmit = (val, id) => {
    return url.post(`${constants.otpVerify}/${id}`, val);
  };

  const logout = () => {
    console.log("==============api calling========================");
    return url.get(constants.logout);
  };

  return {
    register,
    logout,
    passwordLogin,
    otpVerifySubmit,
    GoogleLogin
  };
};
