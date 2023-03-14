
// ------------------------------
// code to handle MongoDB below
// ------------------------------


import express from 'express';
import pkg from 'mongodb';
const { MongoClient } = pkg;
import { } from 'dotenv/config' // module

// Replace the following with your Atlas connection string
const url = "mongodb+srv://" + process.env.USERID + ":" + process.env.PASS + "@" + process.env.DBNAME + "/?retryWrites=true&w=majority";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db("finaltrial");
        // Use the collection "people"
        const col = db.collection("usersdata");
        // Construct a document                                                                                                                                                              
        // let personDocument = {
        //     "name": { "userfirst": "Alan", "userlast": "Turing" },
        //     "theirlist": ["Turing machine", "Turing test", "Turingery"],
        // }

        const query = {"_id":{"$oid":"6410b433cbac6ff8e65a6dd2"},"name":{"userfirst":"Alan"},"theirlist":["Turing Machine"]};
        const optionsf = {
            // Include only the `name` and `theirList` fields in the returned document
            projection: { _id: 0, name: 1, theirlist: 1 },
          };
      
        const personDocument = col.findOne(query, optionsf);
        console.log(personDocument);

        // ------------------------------
        // code to render the app with the list below
        // ------------------------------


        const app = express();

        app.set('view engine', 'ejs');
        app.use(express.static("public"));
        app.use(express.urlencoded({
            extended: true
        }));
        app.use(express.json());

        var options = {
            // for displaying the dat at the top of the todolist
            weekday: "long",
            month: "long",
            day: "numeric"
        }

        let actualList = personDocument.theirlist;

        console.log(actualList);

        app.get("/", function (req, res) {
            // home page render    
            var today = new Date();
            var day = today.toLocaleDateString("en-US", options)
            res.render('list', { Day: day, newli: actualList });
        });

        app.post("/", async function (req, res) {
            // adding item
            console.log("adding item of value: " + req.body.newItem);

            // create a filter for a movie to update
            const filter = { "name": { "userfirst": "Alan", "userlast": "Turing" } };
            // this option instructs the method to create a document if no documents match the filter
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                  theirlist: actualList.push(req.body.newItem)
                },
              };
              const result = await col.updateOne(filter, updateDoc, options);
              console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
              );

            
            res.redirect("/");
        });

        app.post("/delete", function (req, res) {
            // removing item, using the item index to splice it from array
            console.log("Removing item of index: " + Number(Object.keys(req.body)[0]));
            actualList.splice(Number(Object.keys(req.body)[0]), 1)
            res.redirect("/");
        });

        app.listen(3000, function () {
            console.log("Server started at http://localhost:3000");
        });

    } catch (err) {
        console.log(err.stack);
    }
    finally {
    }
}

run().catch(console.dir);
