const express = require("express");
const router = express.Router();
const db = require("../models");

router.get("/", async (req, res) => {
  try {
    const members = await db.Member.findAll();
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { nickname, email, password } = req.body;

    // 중복 확인
    const exists = await db.Member.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "이미 가입된 이메일입니다." });
    }

    const newMember = await db.Member.create({ nickname, email, password });
    res.status(201).json({ message: "회원가입 성공", member: newMember });
  } catch (err) {
    res.status(500).json({ error: "회원가입 중 서버 오류" });
  }
});

module.exports = router;
