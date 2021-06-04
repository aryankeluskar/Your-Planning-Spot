const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express();
var itarr = [];

app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/tdList", { useNewUrlParser: true, useUnifiedTopology: true })
const tdlSchema = {
    name: String
};
const items = mongoose.model("items", tdlSchema);

const i1 = new items({
    name: "Welcome to To Do list"
});
const i2 = new items({
    name: "Type Something and Hit Enter or Add Button"
});
const i3 = new items({
    name: "<- Check the box to delete an item"
});
items.find({}, function(err, found) {
    if (found.length > 0) {
        console.log(found.length + " items present");
    } else {
        items.insertMany([i1, i2, i3], function(err) {
            console.log(err);
        });
    }
});

app.get("/", function(req, res) {
    var options = {
        weekday: "long",
        month: "long",
        day: "numeric"
    }
    var today = new Date();
    var day = today.toLocaleDateString("en-US", options)

    items.find({}, function(err, found) {
        // console.log(found[i].name);    
        res.render('list', { Day: day, newli: found });
    });
});

app.post("/", function(req, res) {
    item = req.body.newItem;
    const ni = new items({
        name: item
    });
    ni.save();
    console.log(item);
    res.redirect("/")
});

app.post("/delete", function(req, res) {
    console.log(req.body.cb);
    items.find({ _id: req.body.cb }, function(err, found) {
        console.log("Removed: " + found[0].name);
    });

    items.findByIdAndDelete({ _id: req.body.cb }, function(err) {});
    res.redirect("/")
});

app.listen(3000, function() { console.log("server started at http://localhost:3000"); })