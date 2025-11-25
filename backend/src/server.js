const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const express = require('express');
const app = express();

const loginRouter = require("./routes/login.router");


app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());


app.use("/api/login", loginRouter);
app.use("/api", function (req, res) {
    res.json({ message: "API catch-all is working!" });
});


if (argv.mode === "prod") {
    const frontendPath = path.join(__dirname, "..", "..", "frontend", "dist");
    app.use(express.static(frontendPath));
    app.use("/*any", function (req, res) {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});
