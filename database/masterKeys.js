import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const MASTERKEYS_TAB = sequelize.define('masterKeys', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    key: { // сам ключ MASTER KEY
        type: DataTypes.STRING,
    },
    expiresAt: { // Истечение срока действия MASTER KEY
        type: DataTypes.DATE,
    }
});

export default MASTERKEYS_TAB