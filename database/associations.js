import ACCOUNTS_TAB from "./accounts.js";
import VOLUNTEERS_TAB from "./volunteers.js";
import REQUESTS_TAB from "./requests.js";
import POSITIONS_TAB from "./positions.js";
import EQUIPMENTS_TAB from "./equipments.js";
import BLACKLISTS_TAB from "./blacklists.js";
import REQUESTBLACKLISTS_TAB from "./requestBlacklists.js";
import AVSTAFFS_TAB from "./avstaffs.js";

VOLUNTEERS_TAB.belongsTo(ACCOUNTS_TAB, { foreignKey: "userId" });
ACCOUNTS_TAB.hasMany(VOLUNTEERS_TAB, { foreignKey: "userId" });

REQUESTS_TAB.belongsTo(ACCOUNTS_TAB, { foreignKey: "userId" })
ACCOUNTS_TAB.hasMany(REQUESTS_TAB, { foreignKey: "userId" })

POSITIONS_TAB.belongsTo(VOLUNTEERS_TAB, { foreignKey: "volunteerId" })
VOLUNTEERS_TAB.hasMany(POSITIONS_TAB, { foreignKey: "volunteerId" })

BLACKLISTS_TAB.belongsTo(ACCOUNTS_TAB, { foreignKey: "userId" })
ACCOUNTS_TAB.hasMany(BLACKLISTS_TAB, { foreignKey: "userId" })

REQUESTBLACKLISTS_TAB.belongsTo(ACCOUNTS_TAB, { foreignKey: "userId" })
ACCOUNTS_TAB.hasMany(REQUESTBLACKLISTS_TAB, { foreignKey: "userId" })

AVSTAFFS_TAB.belongsTo(ACCOUNTS_TAB, { foreignKey: "userId" })
ACCOUNTS_TAB.hasMany(AVSTAFFS_TAB, { foreignKey: "userId" })

EQUIPMENTS_TAB.belongsTo(ACCOUNTS_TAB, { 
  foreignKey: "providerId", 
  as: "provider" 
});

EQUIPMENTS_TAB.belongsTo(ACCOUNTS_TAB, { 
  foreignKey: "userId", 
  as: "user" 
});

// и наоборот
ACCOUNTS_TAB.hasMany(EQUIPMENTS_TAB, { 
  foreignKey: "providerId", 
  as: "providerEquipments" 
});

ACCOUNTS_TAB.hasMany(EQUIPMENTS_TAB, { 
  foreignKey: "userId", 
  as: "userEquipments" 
});

export {
    VOLUNTEERS_TAB,
    ACCOUNTS_TAB,
    REQUESTS_TAB,
    POSITIONS_TAB,
    EQUIPMENTS_TAB,
    BLACKLISTS_TAB,
    REQUESTBLACKLISTS_TAB,
    AVSTAFFS_TAB
}