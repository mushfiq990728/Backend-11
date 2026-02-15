const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");

    const database = client.db('missionscic11DB');
    const userCollections = database.collection('users');

    // ==================== USER REGISTRATION ROUTE ====================
    app.post('/users', async (req, res) => {
      try {
        const user = req.body;
        console.log('📥 Received user data:', user);

        // ✅ Validate required fields (NO password - Firebase handles it)
        if (!user.email || !user.name || !user.bloodGroup || !user.district) {
          return res.status(400).send({ 
            success: false, 
            message: "Missing required fields" 
          });
        }

        // ✅ Check if user already exists
        const existingUser = await userCollections.findOne({ email: user.email });
        
        if (existingUser) {
          return res.status(400).send({ 
            success: false, 
            message: "User already exists" 
          });
        }

        // ✅ Create user object (NO password - Firebase manages authentication)
        const newUser = {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bloodGroup: user.bloodGroup,
          district: user.district,
          upazila: user.upazila,
          role: user.role || "donor", // ✅ Default role
          status: user.status || "active", // ✅ Default status
          createdAt: new Date()
        };

        // ✅ Insert new user
        const result = await userCollections.insertOne(newUser);
        console.log('✅ User saved to database:', result);

        res.status(201).send({ 
          success: true, 
          message: "User registered successfully",
          data: { ...result, user: newUser }
        });

      } catch (error) {
        console.error('❌ Error saving user:', error);
        res.status(500).send({ 
          success: false, 
          message: "Failed to register user",
          error: error.message 
        });
      }
    });

    // ==================== GET ALL USERS ====================
    app.get('/users', async (req, res) => {
      try {
        const users = await userCollections.find().toArray();
        res.send({ success: true, data: users });
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).send({ 
          success: false, 
          message: "Failed to fetch users" 
        });
      }
    });

    // ==================== GET USER BY EMAIL ====================
    app.get('/users/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const user = await userCollections.findOne({ email: email });

        if (!user) {
          return res.status(404).send({ 
            success: false,
            message: "User not found" 
          });
        }

        res.send({ 
          success: true,
          data: user 
        });
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).send({ 
          success: false,
          error: "Failed to fetch user" 
        });
      }
    });

    // ==================== GET USER ROLE BY EMAIL ====================
    app.get('/users/role/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const user = await userCollections.findOne({ email: email });

        if (!user) {
          return res.send({ role: null });
        }

        res.send({ role: user.role, status: user.status });
      } catch (error) {
        console.error('❌ Error fetching user role:', error);
        res.status(500).send({ error: "Failed to fetch user role" });
      }
    });

    // ==================== UPDATE USER STATUS (Block/Unblock) ====================
    app.patch('/users/:email/status', async (req, res) => {
      try {
        const email = req.params.email;
        const { status } = req.body;

        const result = await userCollections.updateOne(
          { email: email },
          { $set: { status: status } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ 
            success: false,
            message: "User not found" 
          });
        }

        res.send({ 
          success: true,
          message: `User ${status === 'blocked' ? 'blocked' : 'activated'} successfully`
        });
      } catch (error) {
        console.error('❌ Error updating user status:', error);
        res.status(500).send({ 
          success: false,
          error: "Failed to update user status" 
        });
      }
    });

    // ==================== UPDATE USER ROLE ====================
    app.patch('/users/:email/role', async (req, res) => {
      try {
        const email = req.params.email;
        const { role } = req.body;

        const result = await userCollections.updateOne(
          { email: email },
          { $set: { role: role } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ 
            success: false,
            message: "User not found" 
          });
        }

        res.send({ 
          success: true,
          message: `User role updated to ${role} successfully`
        });
      } catch (error) {
        console.error('❌ Error updating user role:', error);
        res.status(500).send({ 
          success: false,
          error: "Failed to update user role" 
        });
      }
    });

    // Ping to confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. Successfully connected to MongoDB!");

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

run().catch(console.dir);

// ==================== DEFAULT ROUTE ====================
app.get('/', (req, res) => {
  res.send("🩸 Blood Donation Platform API - Server is running!");
});

// ==================== START SERVER ====================
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});