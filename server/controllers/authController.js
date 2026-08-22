const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const store = require("../store");

const JWT_SECRET = process.env.JWT_SECRET || "medirescue-dev-secret";

function sign(user) {
  return jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, age, allergies } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }
    const existing = await store.findUser(email);
    if (existing) return res.status(409).json({ error: "User already exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await store.saveUser({ name, email, passwordHash, phone, bloodGroup, age, allergies, emergencyContacts: [] });
    res.status(201).json({ token: sign(user), user: { name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await store.findUser(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ token: sign(user), user: { name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
