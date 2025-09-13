import ACCOUNTS_TAB from "./accounts.js";
import VOLUNTEERS_TAB from "./volunteers.js";

VOLUNTEERS_TAB.belongsTo(ACCOUNTS_TAB, { foreignKey: "userId" });
ACCOUNTS_TAB.hasMany(VOLUNTEERS_TAB, { foreignKey: "userId" });

export {
    VOLUNTEERS_TAB,
    ACCOUNTS_TAB
}