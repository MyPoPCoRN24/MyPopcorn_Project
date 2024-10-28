const express = require("express");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/async");
const UserController = require("../controllers/user");
const usercontroller = new UserController();

const router = express.Router();

router.post("/user/register", asyncHandler(usercontroller.createNewUser));
router.post("/user/passwordlogin", asyncHandler(usercontroller.passwordlogin));
router.post("/user/login", asyncHandler(usercontroller.login));

router.get("/user/userInfo", auth, asyncHandler(usercontroller.userInfo));
router.get("/user/getqr", auth, usercontroller.getqr);
router.post(
  "/user/qrcodeEnableDisable",
  auth,
  usercontroller.qrcodeEnableDisable
);
router.post("/user/verify2FA/:userId", usercontroller.verify2FA);
router.get("/user/logout", auth, asyncHandler(usercontroller.logout));
router.post(
  "/user/getallnotifications",
  auth,
  asyncHandler(usercontroller.getallnotifications)
);

router.get(
  "/user/getUnReadNotifications",
  auth,
  asyncHandler(usercontroller.unReadNotifications)
);
router.delete(
  "/user/deleteallnotifications",
  auth,
  asyncHandler(usercontroller.deleteallnotifications)
);
router.get(
  "/user/readallnotifications",
  auth,
  asyncHandler(usercontroller.readallnotifications)
);
router.get("/user/getbalance", auth, asyncHandler(usercontroller.getBalances));

router.get(
  "/user/getbalancess",
  auth,
  asyncHandler(usercontroller.getBalancesss)
);

router.post("/user/transfer", auth, asyncHandler(usercontroller.Fundtranfered));

router.post(
  "/user/transtoken",
  auth,
  asyncHandler(usercontroller.tokentransfer)
);

router.post(
  "/user/updateprofile",
  auth,
  asyncHandler(usercontroller.updateuser)
);

router.post(
  "/user/changepassword",
  auth,
  asyncHandler(usercontroller.changePassword)
);

router.get(
  "/user/rewardpoints",
  auth,
  asyncHandler(usercontroller.rewardpoints)
);

router.get(
  "/user/rewardtransfer",
  auth,
  asyncHandler(usercontroller.rewardtransfer)
);

router.post(
  "/user/redeemtoken",
  auth,
  asyncHandler(usercontroller.redeemtoken)
);

router.post(
  "/user/transaction",
  auth,
  asyncHandler(usercontroller.getusertransaction)
);

router.get(
  "/user/removeUserProfile",
  auth,
  asyncHandler(usercontroller.removeUserProfile)
);

module.exports = router;
