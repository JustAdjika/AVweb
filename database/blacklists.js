import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const BLACKLISTS_TAB = sequelize.define('blacklists', {
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
    }
});

export default BLACKLISTS_TAB