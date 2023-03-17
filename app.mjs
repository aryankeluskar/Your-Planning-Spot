
// ------------------------------
// code to handle MongoDB below
// ------------------------------

import express from 'express';
import pkg from 'mongodb';
let { MongoClient } = pkg;
import { } from 'dotenv/config' // module

// Replace the following with your Atlas connection string
let url = "mongodb+srv://" + process.env.USERID + ":" + process.env.PASS + "@" + process.env.DBNAME + "/?retryWrites=true&w=majority";
let client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        let app = express();
        app.set('view engine', 'ejs');
        app.use(express.static("public"));
        app.use(express.urlencoded({
            extended: true
        }));
        app.use(express.json());

        let dayoptions = {
            // for displaying the date at the top of the todolist
            weekday: "long",
            month: "long",
            day: "numeric"
        }

        await client.connect();
        console.log("Connected correctly to server");
        let db = client.db("finaltrial");
        // Use the collection "usersdata"
        let col = db.collection("usersdata");

        app.listen(3000, function () {
            console.log("Server started at http://localhost:3000");
        });

        app.get("/", function (req, res) {
            res.render('signup');
        });

        app.post("/signed", async function (req, res) {
            console.log("Adding user with name: " + req.body.namein);

            // create a filter for a movie to update
            let filter = { name: {userfirst: req.body.namein }};
            console.log(filter);
            // this option instructs the method to create a document if no documents match the filter
            let options = { upsert: true };

            col.findOne(filter, async function (err, personDocument) {
                if (personDocument) {
                    let actualList = personDocument.theirlist;
                    console.log(actualList);

                    res.redirect("/app");

                    app.get("/app", function (req, res) {
                        // home page render    
                        let today = new Date();
                        let day = today.toLocaleDateString("en-US", dayoptions)
                        res.render('list', { Day: day, newli: actualList, theirname: personDocument.name.userfirst });
                    });

                    app.get("/signup", function (req, res) {
                        let today = new Date();
                        let day = today.toLocaleDateString("en-US", options)
                        res.render('signup');
                    });


                    app.post("/app", async function (req, res) {
                        // adding item
                        console.log("adding item of value: " + req.body.newItem);

                        // create a filter for a movie to update
                        let filter = { name: personDocument.name };

                        // this option instructs the method to create a document if no documents match the filter
                        let options = { upsert: true };

                        // updating the list
                        actualList.push(req.body.newItem)

                        let updateDoc = {
                            $set: {
                                theirlist: actualList
                            },
                        };
                        let result = await col.updateOne(filter, updateDoc, options);
                        console.log(
                            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
                        );

                        // return to homepage
                        res.redirect("/app");
                    });



                    app.post("/delete", async function (req, res) {
                        // removing item, using the item index to splice it from array
                        console.log("Removing item of index: " + Number(Object.keys(req.body)[0]));
                        actualList.splice(Number(Object.keys(req.body)[0]), 1)

                        // create a filter for a movie to update
                        let filter = { name: personDocument.name };

                        // this option instructs the method to create a document if no documents match the filter
                        let options = { upsert: true };

                        let updateDoc = {
                            $set: {
                                theirlist: actualList
                            },
                        };
                        let result = await col.updateOne(filter, updateDoc, options);
                        console.log(
                            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
                        );

                        res.redirect("/app");
                    });

                    

                }
                if (err) {
                    await db.collection("usersdata").insertOne({
                        name: {userfirst: req.body.namein }
                    });
                }
            });
        });



    } catch (err) {
        console.log(err.stack);
    }
    finally {
    }
}

run().catch(console.dir);