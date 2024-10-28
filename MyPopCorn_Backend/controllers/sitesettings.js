const SiteSettings = require("../models/sitesettings");
const { getSocket } = require("../services/socket");
const User = require("../models/user");
const EmitData = require("../services/emitData");
const Notification = require("../models/notification");

class SiteSettingsController {
  constructor() {}

  async create(req, res) {
    let create = await new SiteSettings(req.body).save();
    return res
      .status(200)
      .json({ success: true, message: "Settings Created", data: create });
  }

  async list(req, res) {
    let list = await SiteSettings.find({});
    return res
      .status(200)
      .json({ success: true, message: "Settings Listed", data: list });
  }

  async update(req, res) {
    try {
      const siteSettings = await SiteSettings.findOne({ _id: req.body.id });
      const updates = Object.keys(req.body);
      updates.forEach(async (update) => {
        siteSettings[update] = req.body[update];

        if (update === "notification" && req.body[update] === true) {
          console.log("update");
          try {
            const users = await User.find({});
            for (const user of users) {
              const notification = new Notification({
                user_id: user._id,
                message: siteSettings.value,
                // title: "New Property",
                type: "",
              });
              console.log("nnnnnnnnnnnnnnnnnnn");
              await notification.save();

              let data1 = await Notification.find({
                user_id: user._id,
                read: false,
              });

              EmitData.sendData("new_notification", user._id, data1);
            }
          } catch (error) {
            console.error("Error fetching users:", error);
          }
        }
      });

      await siteSettings.save();

      if (siteSettings.key === "site_maintenance") {
        let io = await getSocket();
        io.sockets.emit("site_maintenance", siteSettings);
      }

      return res
        .status(200)
        .json({
          success: true,
          message: "Settings Updated",
          data: siteSettings,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Error updating settings",
          error: error.message,
        });
    }
  }

  async delete(req, res) {
    await SiteSettings.deleteOne({ _id: req.params.id });
    return res.status(200).json({ success: true, message: "Settings Removed" });
  }
  async sitemaintenance(req, res) {
    try {
      const getSettings = await SiteSettings.findOne({
        key: "site_maintenance",
      });
      return res.status(200).json({ success: true, data: getSettings });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error getting site maintenance status",
        error: error.message,
      });
    }
  }
}

module.exports = SiteSettingsController;
