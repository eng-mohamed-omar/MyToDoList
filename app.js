//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "do homeWork"});
const item2 = new Item({name: "video games"});
const item3 = new Item({name: "workout"});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }else{
          console.log("add successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){
  const itemN = req.body.newItem;
  const listName = req.body.list;
  const itemNew = new Item({name: itemN});
  if (listName === "Today"){
    itemNew.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(itemNew);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId=req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("deleted successfully");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });
    }
});


app.get('/:name', function(req, res) {
    const named = _.capitalize(req.params.name);
    List.findOne({ name: named }, function (err, foundList) {
      if (!err){
        if (!foundList){
          const list = new List({
            name: named,
            items: defaultItems
          });
          list.save();
          res.redirect('/' + named);
        } else {
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
    }});
  });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// if (req.body.list === "Work") {
//   workItems.push(item);
//   res.redirect("/work");
// } else {
//   items.push(item);
//   res.redirect("/");
// }
