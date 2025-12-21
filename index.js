async function run() {
  try {
    await client.connect();

    const database = client.db("missionscic11DB");

    // ✅ Collections
    const userCollection = database.collection("users");
    const servicesCollection = database.collection("services");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");

    // ================= USERS =================
    
app.get("/users/role/:email", async (req, res) => {
  const email = req.params.email;

  const query = { email: email };
  const user = await userCollection.findOne(query);

  if (!user) {
    return res.send({ role: null });
  }

  res.send({ role: user.role });
});

    app.post("/users", async (req, res) => {
      const user = req.body;

      const existingUser = await userCollection.findOne({ email: user.email });
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // ================= SERVICES =================
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find().toArray();
      res.send(result);
    });

    // ================= PRODUCTS =================
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    // ================= ORDERS =================
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find().toArray();
      res.send(result);
    });

    // ================= REVIEWS =================
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}
