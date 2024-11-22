
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "Nethra";
console.log(JWT_SECRET);
function generateAccessToken(id) {
    return jwt.sign(
        { userId: id},
        JWT_SECRET 
    );
}

exports.postAddUsers = async (req, res) => {
    const { username, email, password } = req.body;
    try {
       
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }
 
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashedPassword });

        return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
      
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        const token = generateAccessToken(user.id, user.username);

        return res.status(200).json({ message: 'Login successful', token: token });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
