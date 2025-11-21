import express from "express";

export const app = express();

app.get("/", (req, res) => {
    res.send("Hello from Express running on AWS Lambda!");
});

app.get("/users", (req, res) => {
    res.json([
        { id: 1, name: "John Doe" }
    ]);
});

// export default app;
