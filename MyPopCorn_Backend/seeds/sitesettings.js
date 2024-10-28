const SiteSettings = require('../models/sitesettings')

const seedSiteSettings = async () => {
    let check_item = [
        { title: 'Site Maintenance Title', key: 'site_maintenance', type: 'description', value: "We'll Be Right Back!" },
    ];
    for (let val of check_item) {
        let check_ex = await SiteSettings.findOne({ key: val.key });
        if (!check_ex) {
            await new SiteSettings(val).save();
        }
    }
    return true;
}


module.exports = {
    seedSiteSettings
};