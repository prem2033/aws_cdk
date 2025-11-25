import  express from 'express'
const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Hello from Express running on ECS Fargate!");
});

app.get("/users", (req, res) => {
    res.status(200).json([
        { id: 1, name: "Test Name" }
    ]);
});

app.get('/healthcheck',(req,res)=>{
  res.status(200).json({
    status : 'Running..'
  })
})
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
