import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }

      // Attach decoded token data to request for use in controllers if needed
      req.user = decoded;
      next();
    });
  };
};

// Dedicated middlewares for each role
export const verifyStudentToken = verifyToken('student');
export const verifyFacultyToken = verifyToken('faculty');
export const verifyInstitutionAdminToken = verifyToken('institutionAdmin');