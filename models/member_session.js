const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const MemberSession = sequelize.define(
    "MemberSession",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_seq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "MEMBER",
          key: "SEQ",
        },
      },
      refresh_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "MEMBER_SESSION",
      timestamps: false,
    }
  );

  MemberSession.associate = (models) => {
    MemberSession.belongsTo(models.Member, {
      foreignKey: "member_seq",
      targetKey: "seq",
    });
  };

  return MemberSession;
};
