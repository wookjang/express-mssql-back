const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { DataTypes } = require("sequelize");
const dayjs = require("dayjs");

// 오버라이드
DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
  // 타임존 적용 후 YYYY-MM-DD HH:mm:ss.SSS 포맷으로 반환
  return dayjs(this._applyTimezone(date, options)).format(
    "YYYY-MM-DD HH:mm:ss.SSS"
  );
};

const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const JWT_EXPIRES = "1h"; // 토큰 만료시간

router.get("/", async (req, res) => {
  try {
    const members = await db.Member.findAll();
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류" });
  }
});

//회원가입
router.post("/register", async (req, res) => {
  try {
    const { nickname, email, password } = req.body;

    // 중복 확인
    const exists = await db.Member.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "이미 가입된 이메일입니다." });
    }

    //가입
    const newMember = await db.Member.create({ nickname, email, password });
    res.status(201).json({ message: "회원가입 성공", member: newMember });
  } catch (err) {
    res.status(500).json({ error: "회원가입 중 서버 오류" });
  }
});

//로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일로 유저 찾기
    const user = await db.Member.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "존재하지 않는 이메일입니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    //토큰 발급
    const accessToken = jwt.sign(
      {
        seq: user.seq,
        email: user.email,
        nickname: user.nickname,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { seq: user.seq },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const now = dayjs().toDate();
    const expires = dayjs().add(5, "minute").toDate();

    try {
      await db.MemberSession.create({
        member_seq: user.seq,
        refresh_token: refreshToken,
        created_at: now,
        expired_at: expires,
      });
    } catch (error) {
      return res.status(500).json({
        message: "세션 저장 중 오류 발생",
      });
    }

    // 로그인 성공
    res.status(200).json({
      message: "로그인 되었습니다.",
      user: {
        seq: user.seq,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        accessToken,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "로그인 오류" });
  }
});

//닉네임 변경
router.put("/nickname", async (req, res) => {
  try {
    const { nickname, email } = req.body;

    // 이메일로 유저 찾기
    const user = await db.Member.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "로그인 정보 오류가 있습니다" });
    }

    // 2. 닉네임 업데이트
    user.nickname = nickname;
    await user.save();

    // 3. 변경 성공
    res.status(200).json({
      message: "닉네임이 변경되었습니다.",
      user: {
        nickname: user.nickname,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "닉네임 변경 오류" });
  }
});

//패스워드 변경
router.put("/password", async (req, res) => {
  try {
    const { password, email } = req.body;

    const user = await db.Member.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "로그인 정보 오류가 있습니다" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("hashedPassword : ", hashedPassword);

    user.password = hashedPassword;

    await user.save();

    // 3. 변경 성공
    res.status(200).json({
      message: "비밀번호가 변경되었습니다.",
      user: {
        nickname: user.nickname,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "비밀번호 변경 오류" });
  }
});

module.exports = router;
