const { seedSiteSettings } = require("../seeds/sitesettings");

const seedSettings = async () => {
  seedSiteSettings();
};

module.exports = {
  seedSettings,
};