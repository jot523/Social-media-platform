/**
 * JWT Utilities
 */

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'connecto_secret';

exports.signToken = (userId, expiresIn = '30d') =>
  jwt.sign({ id: userId }, SECRET, { expiresIn });

exports.verifyToken = (token) => jwt.verify(token, SECRET);

exports.decodeToken = (token) => jwt.decode(token);