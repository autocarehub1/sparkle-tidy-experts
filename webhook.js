const express = require("express");
const { exec } = require("child_process");
const app = express();
const PORT = 3001;  // Use an available port

app.use(express.json());

app.post("/webhook", (req, res) => {
    console.log("Received a webhook event!");

    exec("bash /var/www/your-repo/deploy.sh", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send("Deployment failed.");
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        console.log(`Stdout: ${stdout}`);
        res.status(200).send("Deployment successful!");
    });
});

app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});
