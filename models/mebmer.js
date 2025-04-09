// models/member.js
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define(
    "Member",
    {
      seq: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "SEQ",
      },
      nickname: {
        type: DataTypes.STRING,
        field: "NICKNAME",
      },
      email: DataTypes.STRING,
      // 필요한 필드 추가
      password: {
        type: DataTypes.STRING,
        field: "PASSWORD",
      },
    },
    {
      tableName: "MEMBER", // 대소문자 구분 주의!
      timestamps: true, // createdAt, updatedAt 없을 경우
      createdAt: "CREATED_AT",
      updatedAt: false,
    }
  );

  //암호화
  Member.addHook("beforeCreate", async (member, options) => {
    if (member.password) {
      const salt = await bcrypt.genSalt(10);
      member.password = await bcrypt.hash(member.password, salt);
    }
  });

  return Member;
};
