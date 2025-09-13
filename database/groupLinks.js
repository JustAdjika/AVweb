import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const GROUPLINKS_TAB = sequelize.define('groupLinks', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    link: {
        type: DataTypes.STRING,
    },
    eventId: { 
        type: DataTypes.INTEGER
    },
    day: {
        type: DataTypes.STRING
    }
});

export default GROUPLINKS_TAB