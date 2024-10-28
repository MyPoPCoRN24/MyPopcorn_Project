const express = require("express");
const adminAuth = require("../middleware/auth-surveycreator");
const asyncHandler = require("../middleware/async");

const SitesettingsController = require("../controllers/sitesettings");
const sitesettingsController = new SitesettingsController();

const router = express.Router();

router.post(
  "/admin/siteSettings/create",
  adminAuth,
  asyncHandler(sitesettingsController.create)
);
router.get(
  "/admin/siteSettings/list",
  adminAuth,
  asyncHandler(sitesettingsController.list)
);

router.patch(
  "/admin/siteSettings/update",
  adminAuth,
  asyncHandler(sitesettingsController.update)
);

router.get("/siteSettings", asyncHandler(sitesettingsController.list));
router.get(
  "/sitemaintenance",
  asyncHandler(sitesettingsController.sitemaintenance)
);

module.exports = router;
