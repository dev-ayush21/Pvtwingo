const fs = require('fs/promises');
const path = require('path');

const USERS_DB_PATH = path.join(__dirname, '..', 'users.json');

// Helper to read users from the JSON file
const readUsers = async () => {
    try {
        const data = await fs.readFile(USERS_DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return {}; // If file doesn't exist, return empty object
        throw error;
    }
};

// Helper to write users to the JSON file
const writeUsers = async (users) => {
    await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2));
};

// Controller for registering a user
const registerUser = async (req, res) => {
    const { username } = req.body;
    if (!username || username.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long.' });
    }

    const users = await readUsers();
    const normalizedUser = username.toLowerCase();

    if (!users[normalizedUser]) {
        users[normalizedUser] = {
            username: normalizedUser,
            hasDeposited: false,
            createdAt: new Date().toISOString(),
        };
        await writeUsers(users);
        console.log(`New user registered: ${normalizedUser}`);
    }

    res.json({ success: true, user: users[normalizedUser] });
};

// Controller for confirming a deposit
const confirmDeposit = async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    const users = await readUsers();
    const normalizedUser = username.toLowerCase();

    if (users[normalizedUser]) {
        users[normalizedUser].hasDeposited = true;
        await writeUsers(users);
        console.log(`Deposit confirmed for user: ${normalizedUser}`);
        return res.json({ success: true, message: 'Access granted!', user: users[normalizedUser] });
    }

    res.status(404).json({ success: false, message: 'User not found.' });
};

// Controller for getting user status
const getUserStatus = async (req, res) => {
    const { username } = req.params;
    const users = await readUsers();
    const normalizedUser = username.toLowerCase();

    if (users[normalizedUser]) {
        res.json({ success: true, user: users[normalizedUser] });
    } else {
        res.status(404).json({ success: false, message: 'User not found.' });
    }
};

module.exports = {
    registerUser,
    confirmDeposit,
    getUserStatus
};