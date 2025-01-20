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

// CRUD APIs for Users
app.post('/users', async (req, res) => {
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

app.get('/users', async (req, res) => {
    try {
        const users = await client.db('Databases').collection('users').find({}).toArray();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Failed to fetch users');
    }
});

app.patch('/users', async (req, res) => {
    try {
        const { username, updates } = req.body;
        await client.db('Databases').collection('users').updateOne(
            { username },
            { $set: updates }
        );
        res.send('User updated successfully');
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).send('Failed to update user');
    }
});

app.delete('/users', async (req, res) => {
    try {
        const { username } = req.body;
        await client.db('Databases').collection('users').deleteOne({ username });
        res.send('User deleted successfully');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Failed to delete user');
    }
});

// CRUD APIs for Workouts
app.post('/workouts', verifyJWT, async (req, res) => {
    try {
        const { type, duration, caloriesBurned } = req.body;
        await client.db('Databases').collection('workouts').insertOne({
            username: req.user.username,
            date: new Date(),
            type,
            duration,
            caloriesBurned,
        });
        res.send('Workout added successfully');
    } catch (err) {
        console.error('Error adding workout:', err);
        res.status(500).send('Failed to add workout');
    }
});

app.get('/workouts', verifyJWT, async (req, res) => {
    try {
        const workouts = await client.db('Databases').collection('workouts').find({ username: req.user.username }).toArray();
        res.json(workouts);
    } catch (err) {
        console.error('Error fetching workouts:', err);
        res.status(500).send('Failed to fetch workouts');
    }
});

app.patch('/workouts', verifyJWT, async (req, res) => {
    try {
        const { type, duration, caloriesBurned } = req.body;
        await client.db('Databases').collection('workouts').updateOne(
            { username: req.user.username },
            { $set: { type, duration, caloriesBurned } }
        );
        res.send('Workout updated successfully');
    } catch (err) {
        console.error('Error updating workout:', err);
        res.status(500).send('Failed to update workout');
    }
});

app.delete('/workouts', verifyJWT, async (req, res) => {
    try {
        await client.db('Databases').collection('workouts').deleteOne({ username: req.user.username });
        res.send('Workout deleted successfully');
    } catch (err) {
        console.error('Error deleting workout:', err);
        res.status(500).send('Failed to delete workout');
    }
});

// CRUD APIs for Progress
app.post('/progress', verifyJWT, async (req, res) => {
    try {
        const { metric, value } = req.body;
        await client.db('Databases').collection('progress').insertOne({
            username: req.user.username,
            date: new Date(),
            metric,
            value,
        });
        res.send('Progress added successfully');
    } catch (err) {
        console.error('Error adding progress:', err);
        res.status(500).send('Failed to add progress');
    }
});

app.get('/progress', verifyJWT, async (req, res) => {
    try {
        const progress = await client.db('Databases').collection('progress').find({ username: req.user.username }).toArray();
        res.json(progress);
    } catch (err) {
        console.error('Error fetching progress:', err);
        res.status(500).send('Failed to fetch progress');
    }
});

app.patch('/progress', verifyJWT, async (req, res) => {
    try {
        const { metric, value } = req.body;
        await client.db('Databases').collection('progress').updateOne(
            { username: req.user.username },
            { $set: { metric, value } }
        );
        res.send('Progress updated successfully');
    } catch (err) {
        console.error('Error updating progress:', err);
        res.status(500).send('Failed to update progress');
    }
});

app.delete('/progress', verifyJWT, async (req, res) => {
    try {
        await client.db('Databases').collection('progress').deleteOne({ username: req.user.username });
        res.send('Progress deleted successfully');
    } catch (err) {
        console.error('Error deleting progress:', err);
        res.status(500).send('Failed to delete progress');
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