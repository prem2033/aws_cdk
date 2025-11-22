import  express from 'express'
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Express running on ECS Fargate!");
});

app.get("/users", (req, res) => {
    res.json([
        { id: 1, name: "Test Name" }
    ]);
});

app.get('/healthcheck',(req,res)=>{
  res.status(200).json({
    status : 'Running..'
  })
})
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
