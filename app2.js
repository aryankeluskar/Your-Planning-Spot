require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose')
const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
mongoose.connect("mongodb+srv://aryan-keluskar:" + process.env.PWD + "@cluster0.xj6cf.mongodb.net/tdList", { useNewUrlParser: true, useUnifiedTopology: true })
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
// items.find({}, function(err, found) {
//     if (found.length > 0) {
//         console.log(found.length + " items present");
//     } else {
//         items.insertMany([i1, i2, i3], function(err) {
//             console.log(err);
//         });
//     }
// });
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
    const ni = new items({
        name: req.body.newItem
    });
    ni.save();
    // console.log(item);
    // res.redirect('https://www.google.com')
    res.redirect("/");
});

app.post("/delete", function(req, res) {
    items.findByIdAndDelete({ _id: req.body.cb }, function(err) {});
    // res.redirect("http://localhost:3000")
    // res.redirect("http://localhost:3000")
    res.redirect("/");

});

app.listen(process.env.PORT || 3000, function() { console.log("server started at http://localhost:3000"); })