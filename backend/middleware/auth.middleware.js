import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies.accessToken;
		if (!token) {
			return res.status(401).json({ message: 'No access token' });
		}

		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		const user = await User.findById(decoded.userId).select('-password');
		if (!user) {
			return res.status(401).json({ message: 'User not found' });
		}

		req.user = user;
		next();
	} catch (error) {
		console.log('❌ auth.middleware.js error:', error.message);
		return res.status(401).json({ message: 'Not authorized', error: error.message });
	}
};

export const adminRoute = (req, res, next) => { 
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed to the next middleware or route handler
    } else {
        return res.status(403).json({ message: "Access denied - Admins only" });
    }
}