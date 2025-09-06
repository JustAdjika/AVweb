import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const REQUESTBLACKLISTS_TAB = sequelize.define('requestBlacklists', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: { // ID пользователя 
        type: DataTypes.INTEGER,
    },
    executerId: { // ID исполнителя координатора 
        type: DataTypes.INTEGER,
    },
    eventId: { // ID события 
        type: DataTypes.INTEGER,
    },
});

export default REQUESTBLACKLISTS_TAB