const express = require('express');
const bodyParser = require('body-parser')
const app = express();
var items = [];

app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", function(req, res) {
    var options = {
        weekday: "long",
        month: "long",
        day: "numeric"
    }
    var today = new Date();
    var day = today.toLocaleDateString("en-US", options)

    res.render('list', { Day: day, newli: items });
});

app.post("/", function(req, res) {
    item = req.body.newItem;
    items.push(item)
    console.log(item);
    res.redirect("/")
})

app.listen(3000, function() { console.log("server started at http://localhost:3000"); })