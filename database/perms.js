import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const PERMS_TAB = sequelize.define('perms', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: { // ID пользователя
        type: DataTypes.STRING,
    },
    permission: { // Роль доступа (COORDINATOR / ADMIN)
        type: DataTypes.STRING,
    },
    preceptorId: { // ID человека выдавшего права или MASTER KEY (в случае, если он использовался)
        type: DataTypes.STRING,
    }
});

export default PERMS_TAB