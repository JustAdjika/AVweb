import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const AVSTAFFS_TAB = sequelize.define('avstaffs', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: { // ID пользователя
        type: DataTypes.STRING,
    },
    role: { // Роль в альянсе (Volunteer, Coordinator, Headquater, Administrator)
        type: DataTypes.STRING
    },
    preceptorId: { // ID выдавшего права/MASTER KEY (если использовался)
        type: DataTypes.STRING
    }
});

export default AVSTAFFS_TAB