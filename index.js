const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5500;
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a strong secret key

// MongoDB connection URI
const uri = "mongodb+srv://Aliyaizhara123:qj6WW7210OLve4Kl@cluster0.ejku6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}
connectToMongoDB().catch(console.dir);

app.use(cors());
app.use(express.json());

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access Denied: No Token Provided!');
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send('Access Denied: Invalid Token!');
        req.user = decoded;
        next();
    });
};

// Register API
app.post('/register', async (req, res) => {
    try {
        const { username, password, name, email, role } = req.body;
        const hash = bcrypt.hashSync(password, 10);

        await client.db('Databases').collection('users').insertOne({
            username,
            password: hash,
            name,
            email,
            role,
            createdAt: new Date(),
        });
        res.send('Successfully Registered');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Registration failed');
    }
});

// Login API
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await client.db('Databases').collection('users').findOne({ username });

        if (!user) return res.status(404).send('Username not found');
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).send('Wrong password');

        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Login failed');
    }
});

// CRUD APIs for Health Metrics
app.post('/healthMetrics', verifyJWT, async (req, res) => {
    try {
        const { weight, height, waterIntake, calorieIntake, calorieBurned } = req.body;
        await client.db('Databases').collection('healthMetrics').insertOne({
            username: req.user.username,
            date: new Date(),
            weight,
            height,
            waterIntake,
            calorieIntake,
            calorieBurned,
        });
        res.send('Health metrics added successfully');
    } catch (err) {
        console.error('Error adding health metrics:', err);
        res.status(500).send('Failed to add health metrics');
    }
});

app.get('/healthMetrics', verifyJWT, async (req, res) => {
    try {
        const metrics = await client.db('Databases').collection('healthMetrics').find({ username: req.user.username }).toArray();
        res.json(metrics);
    } catch (err) {
        console.error('Error fetching health metrics:', err);
        res.status(500).send('Failed to fetch health metrics');
    }
});

app.patch('/healthMetrics', verifyJWT, async (req, res) => {
    try {
        const { weight, height, waterIntake, calorieIntake, calorieBurned } = req.body;
        await client.db('Databases').collection('healthMetrics').updateOne(
            { username: req.user.username },
            { $set: { weight, height, waterIntake, calorieIntake, calorieBurned } }
        );
        res.send('Health metrics updated successfully');
    } catch (err) {
        console.error('Error updating health metrics:', err);
        res.status(500).send('Failed to update health metrics');
    }
});

app.delete('/healthMetrics', verifyJWT, async (req, res) => {
    try {
        await client.db('Databases').collection('healthMetrics').deleteOne({ username: req.user.username });
        res.send('Health metrics deleted successfully');
    } catch (err) {
        console.error('Error deleting health metrics:', err);
        res.status(500).send('Failed to delete health metrics');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Health and Fitness Management System listening on port ${port}`);
});