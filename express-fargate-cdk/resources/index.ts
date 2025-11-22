import express from "express";
export const app = express();

app.get("/", (req, res) => {
    res.send("Hello from Express over ECS + CDK!");
});

app.get("/users", (req, res) => {
    res.status(200).json([{ name: "John Doe" }, { name: "Jane Doe" }]);
});

app.get("/healthcheck", (req, res) => {
    res.status(200).json({ status: "OK" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Running on http://localhost:" + port));
