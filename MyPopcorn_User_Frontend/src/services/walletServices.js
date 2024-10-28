import url from "../shared/constants/url";
import { Constants } from "../shared/constants/constants";

export const walletServices = () => {
  const constants = Constants();

  const polygonBalance = () => {
    return url.get(constants.getPolygonBalances);
  };

  const claimTransaction = () => {
    return url.get(constants.claimtransaction);
  };

  const popcornBalance = (val) => {
    return url.get(constants.getPopcornbalance);
  };

  const transfer = (val) => {
    return url.post(constants.transfer, val);
  };

  const transtoken = (val) => {
    return url.post(constants.transtoken, val);
  };

  const redeemToken = (val) => {
    return url.post(constants.reedemtoken, val);
  };

  const getTransaction = (val) => {
    return url.post(constants.getAllTransaction, val);
  };

  return {
    polygonBalance,
    popcornBalance,
    transfer,
    transtoken,
    getTransaction,
    claimTransaction,
    redeemToken
  };
};
