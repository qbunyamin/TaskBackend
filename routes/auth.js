const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const Users = require('../db/models/Users');
const Token = require('../db/models/Token'); // Token modelini dahil edin
const Response = require("../lib/Response");
const CustomError = require('../lib/Error');

const UserRoles = require('../db/models/UserRoles');
const RolePrivileges = require('../db/models/RolePrivileges');
const Enum = require('../config/Enum');
const router = express.Router();

// JWT Secret Key
const JWT_SECRET = "secretjwskey"; // Bunu güvenli bir yerde saklayın

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(Enum.HTTP_CODES.UNAUTHORIZED).json({ error: 'Token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(Enum.HTTP_CODES.UNAUTHORIZED).json({ error: 'Invalid Token' });
    }
    req.user = user; // add the user payload to request
    next();
  });
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email and password must be filled");
    }

    const user = await Users.findOne({ email });

    if (!user) {
      throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "User Not Found!", "Invalid email or password");
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Authentication Failed!", "Invalid email or password");
    }

    // Kullanıcının rollerini al
    const userRoles = await UserRoles.find({ user_id: user._id });

    // Rollere ait yetkileri al
    const roleIds = userRoles.map(userRole => userRole.role_id);
    const rolePrivileges = await RolePrivileges.find({ role_id: { $in: roleIds } });

    // Yetkileri bir diziye dönüştür
    const permissions = rolePrivileges.map(rolePrivilege => rolePrivilege.permission);

    const tokenPayload = { id: user._id, email: user.email, permissions };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // Token'ı veritabanına kaydet
    await Token.create({ userId: user._id, token: accessToken });

    res.json(Response.successResponse({ accessToken, user: tokenPayload }));

  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});
// Me endpoint
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "User Not Found!", "Invalid token");
    }

    res.json(Response.successResponse({ user: { id: user._id, email: user.email, name: user.name }}));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
