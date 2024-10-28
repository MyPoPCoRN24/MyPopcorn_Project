import url from "../shared/constants/url";
import { Constants } from "../shared/constants/constants";

export const walletServices = () => {
  const constants = Constants();

  const polygonBalance = () => {
    return url.get(constants.getPolygonBalances);
  };

  const popcornBalance = (val) => {
    return url.get(constants.getPopcornbalance);
  };

  const getTransaction = (val) => {
    return url.post(constants.getTransaction, val);
  };

  const transfer = (val) => {
    return url.post(constants.transfer, val);
  };

  const transtoken = (val) => {
    return url.post(constants.transtoken, val);
  };

  return {
    polygonBalance,
    popcornBalance,
    transfer,
    transtoken,
    getTransaction,
  };
};
