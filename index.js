const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000; // ✅ Changed to 5000 to match frontend

const app = express();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://missionscic11:RP4mu6DY2fdNo3X0@cluster0.epjhzoy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    const userCollections = database.collection('users'); // ✅ Changed to 'users' (plural)

    // ==================== USER REGISTRATION ROUTE ====================
    app.post('/users', async (req, res) => {
      try {
        const user = req.body;
        console.log('📥 Received user data:', user);

        // Check if user already exists
        const existingUser = await userCollections.findOne({ email: user.email });
        
        if (existingUser) {
          return res.status(400).send({ 
            success: false, 
            message: "User already exists" 
          });
        }

        // Insert new user
        const result = await userCollections.insertOne(user);
        console.log('✅ User saved to database:', result);

        res.status(201).send({ 
          success: true, 
          message: "User registered successfully",
          data: result 
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

    // ==================== GET ALL USERS (optional) ====================
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

    // ==================== GET USER ROLE BY EMAIL ====================
    app.get('/users/role/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const user = await userCollections.findOne({ email: email });

        if (!user) {
          return res.send({ role: null });
        }

        res.send({ role: user.role });
      } catch (error) {
        console.error('❌ Error fetching user role:', error);
        res.status(500).send({ error: "Failed to fetch user role" });
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
  res.send("🐾 Pet Adoption Platform API - Server is running!");
});

// ==================== START SERVER ====================
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
 