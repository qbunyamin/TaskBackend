const jwt = require('jsonwebtoken');
const Token = require('../db/models/Token'); // Token modelini dahil edin
const UserRoles = require('../db/models/UserRoles');
const rolePrivileges = require('../config/role_privileges');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');

const JWT_SECRET = "secretjwskey"; // Bunu güvenli bir yerde saklayın

module.exports = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    const error = new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Access Denied!", "No token provided");
    return res.status(error.code).json({ error: error.message });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Token'ın veritabanında olup olmadığını kontrol et
    const tokenInDb = await Token.findOne({ token });
    if (!tokenInDb) {
      const error = new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Invalid Token!", "Failed to authenticate token");
      return res.status(error.code).json({ error: error.message });
    }

    // User roles and permissions
    const userRoles = await UserRoles.find({ user_id: decoded.id });
    const userPermissions = [];

    userRoles.forEach(role => {
      const rolePrivilegesList = rolePrivileges.privileges.filter(priv => priv.group === role.role_id);
      userPermissions.push(...rolePrivilegesList.map(priv => priv.key));
    });

    req.user = {
      ...decoded,
      roles: userRoles.map(role => role.role_id),
      permissions: userPermissions
    };

    next();
  } catch (err) {
    const error = new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Invalid Token!", "Failed to authenticate token");
    res.status(error.code).json({ error: error.message });
  }
};
