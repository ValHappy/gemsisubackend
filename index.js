const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebasekey = require('./keys/firebasekey.json');

const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

admin.initializeApp({
    credential: admin.credential.cert(firebasekey),
    databaseURL: "https://gemsisu.firebaseio.com"
});

app.get("/", (request, response) => {
    response.send("Listening...");
});

app.post("/users", (request, response) => {
    const { email, password, displayName } = request.body;
    admin.auth().createUser({ email, password, displayName })
        .then((resolve) => {
            response.status(200).json(resolve);
        }, (error) => {
            response.status(400).json(error);
        });
});

app.get("/comments", async (request, response) => {
    try {
        const comments = await admin.firestore().collection("comments").get();
        const newComments = [...comments.docs].map((comment) => {
            const newComment = {
                id: comment.id,
                name: comment.data().name,
                date: comment.data().date,
                comment: comment.data().comment
            };
            return newComment;
        });
        response.status(200).json(newComments);
    } catch (error) {
        response.status(400).json(error);
    }
});

app.post("/comments", async (request, response) => {
    const { name, date, comment } = request.body;
    try {
        const docRef = await admin.firestore().collection("comments").add({
            name, date, comment
        });
        const comments = await admin.firestore().collection("comments").get();
        const newComments = [...comments.docs].map((comment) => {
            const newComment = {
                id: comment.id,
                name: comment.data().name,
                date: comment.data().date,
                comment: comment.data().comment
            };
            return newComment;
        });
        response.status(200).json(newComments);
    } catch (error) {
        response.status(400).json(error);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Example app listening on port !`);
    console.log("http://localhost:3000");

});