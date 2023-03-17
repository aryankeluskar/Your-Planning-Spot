// ARYAN, PLS ADD ANOTHER CONDITION TO CHECK IF ONLY NAME IS PRESENT BUT NOT PASSWORD
// use google oauth to log in, also add a date coloumn, and integrate the same with google calender
// the above will set this apart from other to do list projects.
// encrypt the to do list


import express from 'express';
import pkg from 'mongodb';
let { MongoClient } = pkg;
import { } from 'dotenv/config' // module
import sha256 from 'crypto-js/sha256.js';

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
        // Use the collection "passdata"
        let col = db.collection("passdata");

        app.listen(3000, function () {
            console.log("Server started at http://localhost:3000");
        });

        app.get("/", function (req, res) {
            res.render('signup');
        });

        app.post("/signed", async function (req, res) {
            console.log("Looking up for user with name: " + req.body.namein);

            // create a filter for a movie to update
            let filter = { name: { userfirst: req.body.namein }, usrpwd: sha256(req.body.passin).toString() };
            // this option instructs the method to create a document if no documents match the filter
            let options = {
                upsert: true,
                projection: { _id: 0, usrpwd: 0, name: 1, theirlist: 1 }
            };

            findAndExecute();

            function findAndExecute() {
                col.findOne(filter, async function (errdb, personDocument) {
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

                    else {
                        console.log("reached adding new user cause he doesnt exist");
                        await db.collection("passdata").insertOne({
                            name: { userfirst: req.body.namein },
                            usrpwd: sha256(req.body.passin).toString(),
                            theirlist: ["Welcome to Your Planning Spot", "Type Something and Hit Enter or Add Button", "<- Check the box to delete an item"]
                        });
                        findAndExecute();
                    }
                });
            }
        });


    } catch (err) {
        console.log(err.stack);
    }
    finally {
    }
}

run().catch(console.dir);