import ACCOUNTS_TAB from "./accounts.js";
import VOLUNTEERS_TAB from "./volunteers.js";
import REQUESTS_TAB from "./requests.js";
import POSITIONS_TAB from "./positions.js";

VOLUNTEERS_TAB.belongsTo(ACCOUNTS_TAB, { foreignKey: "userId" });
ACCOUNTS_TAB.hasMany(VOLUNTEERS_TAB, { foreignKey: "userId" });

REQUESTS_TAB.belongsTo(ACCOUNTS_TAB, { foreignKey: "userId" })
ACCOUNTS_TAB.hasMany(REQUESTS_TAB, { foreignKey: "userId" })

POSITIONS_TAB.belongsTo(VOLUNTEERS_TAB, { foreignKey: "volunteerId" })
VOLUNTEERS_TAB.hasMany(POSITIONS_TAB, { foreignKey: "volunteerId" })

export {
    VOLUNTEERS_TAB,
    ACCOUNTS_TAB,
    REQUESTS_TAB,
    POSITIONS_TAB
}