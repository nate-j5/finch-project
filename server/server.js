// server.js
const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const axios = require("axios");
require("dotenv").config({ path: "../.env" });

const app = express();
const PORT = 4000;

// Cookie session middleware
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_SECRET || "your-secret-key"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true, 
    sameSite: "lax",
  })
);

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization,Finch-API-Version,provider_id",
  })
);

// API Route to get provider list
app.get("/api/providers", (req, res) => {
  try {
    const providers = require("./data/data.json");
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: "Failed to load providers" });
  }
});

// API Route to get an access token and fetch data
app.post("/api/get-access-token", async (req, res) => {
  try {
    const url = "https://api.tryfinch.com/sandbox/connections";
    const authHeader = `Basic ${Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
    ).toString("base64")}`;

    const response = await axios.post(
      url,
      {
        provider_id: req.body.provider_id,
        products: ["company", "directory", "individual"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Finch-API-Version": "2020-09-17",
          Authorization: authHeader,
        },
      }
    );

    // Store token in session instead of sending to client
    req.session.accessToken = response.data.access_token;

    // Fetch additional data using the token
    const [directoryResponse, companyResponse] = await Promise.all([
      axios.get("https://api.tryfinch.com/employer/directory", {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
          "Finch-API-Version": "2020-09-17",
        },
      }),
      axios.get("https://api.tryfinch.com/employer/company", {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
          "Finch-API-Version": "2020-09-17",
        },
      }),
    ]);

    // Send data without the token
    res.json({
      directory: directoryResponse.data,
      company: companyResponse.data,
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// API Route to fetch employee details using session token
app.get("/api/employee/:id", async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: "No access token found" });
  }

  try {
    const response = await axios({
      method: "post", // Changed to POST
      url: "https://api.tryfinch.com/employer/individual",
      headers: {
        Authorization: `Bearer ${req.session.accessToken}`,
        "Finch-API-Version": "2020-09-17",
        "Content-Type": "application/json",
      },
      data: {
        // Using data instead of params for POST
        requests: [
          {
            individual_id: req.params.id,
          },
        ],
      },
    });

    // Check if we have valid data
    if (
      response.data &&
      response.data.responses &&
      response.data.responses[0]
    ) {
      res.json(response.data.responses[0].body);
    } else {
      throw new Error("No employee data found in response");
    }
  } catch (error) {
    console.error("Error fetching employee:", error.message);
    res.status(500).json({
      error: "Failed to fetch employee data",
      details: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
