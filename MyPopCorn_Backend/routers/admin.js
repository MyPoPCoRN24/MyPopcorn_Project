const express = require("express");
const adminAuth = require("../middleware/auth-surveycreator");
const asyncHandler = require("../middleware/async");
const AdminController = require("../controllers/admin");
const adminController = new AdminController();

const router = express.Router();

router.post("/admin/register", asyncHandler(adminController.createNewUser));
router.post(
  "/admin/passwordlogin",
  asyncHandler(adminController.passwordlogin)
);
router.get(
  "/admin/adminInfo",
  adminAuth,
  asyncHandler(adminController.AdminInfo)
);
router.get("/admin/getqr", adminAuth, asyncHandler(adminController.getqr));
router.post(
  "/admin/qrcodeEnableDisable",
  adminAuth,
  asyncHandler(adminController.qrcodeEnableDisable)
);
router.post(
  "/admin/verify2FA/:adminId",
  asyncHandler(adminController.verify2FA)
);
router.get("/admin/logout", adminAuth, asyncHandler(adminController.logout));
router.post(
  "/admin/getallnotifications",
  adminAuth,
  asyncHandler(adminController.getallnotifications)
);
router.get(
  "/admin/unReadNotifications",
  adminAuth,
  asyncHandler(adminController.unReadNotifications)
);
router.delete(
  "/admin/deleteallnotifications",
  adminAuth,
  asyncHandler(adminController.deleteallnotifications)
);
router.get(
  "/admin/readallnotifications",
  adminAuth,
  asyncHandler(adminController.readallnotifications)
);
router.get(
  "/admin/getbalance",
  adminAuth,
  asyncHandler(adminController.getBalances)
);

router.get(
  "/admin/getbalancess",
  adminAuth,
  asyncHandler(adminController.getBalancesss)
);

router.post(
  "/admin/transfer",
  adminAuth,
  asyncHandler(adminController.Fundtranfered)
);

router.post(
  "/admin/transtoken",
  adminAuth,
  asyncHandler(adminController.tokentransfer)
);

router.post(
  "/admin/updateprofile",
  adminAuth,
  asyncHandler(adminController.updateAdmin)
);

router.post(
  "/admin/updatetoken",
  adminAuth,
  asyncHandler(adminController.updatetoken)
);

router.post(
  "/admin/changepassword",
  adminAuth,
  asyncHandler(adminController.changePassword)
);

router.post(
  "/admin/transaction",
  adminAuth,
  asyncHandler(adminController.gettransaction)
);


router.post(
  "/admin/sendmail", adminAuth,
  asyncHandler(adminController.sendmail)
);


router.post(
  "/admin/getemaildata",
  adminAuth,
  asyncHandler(adminController.getemaildata)
);


router.get(
  "/admin/removeUserProfile",
  adminAuth,
  asyncHandler(adminController.removeUserProfile)
);


router.delete(
  "/admin/deleteemail/:id",
  adminAuth,
  asyncHandler(adminController.deleteemail)
);


router.get(
  "/admin/getapikey",
  adminAuth,
  asyncHandler(adminController.getapikey)
);

module.exports = router;
