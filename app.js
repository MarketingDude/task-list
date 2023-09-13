//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ =require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const uri = "mongodb+srv://user1:WAEzMKnLbqx904u2@cluster0.7dzy142.mongodb.net/tasklistDB?retryWrites=true&w=majority";

    // Define the schema and model here
    const itemsSchema = new mongoose.Schema({
      name: String
    });
    const listSchema = {
      name: String,
      items: [itemsSchema]
    };
    const List = mongoose.model("List", listSchema);

    const Item = mongoose.model("Item", itemsSchema);

    // Create some default items
    const item1 = new Item({
      name: "Do the laundry"
    });
    const item2 = new Item({
      name: "Buy groceries"
    });
    const item3 = new Item({
      name: "Pay the bills"
    });
    const defaultItems = [item1, item2, item3];

    // Open the MongoDB connection when the app starts
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });


  app.get("/", async function (req, res) { // Make the route handler async

    try {
 
      // Find all items and render the list using async/await
      const foundItems = await Item.find({});
      console.log(foundItems);
      if (foundItems.length===0) {
Item.insertMany(defaultItems);
res.redirect("/");
//mongoose.connection.close();
      }
      else{
      res.render("list", { listTitle: "Today", newListItems: foundItems })};
      //mongoose.connection.close();
    } catch (err) {
      console.error(err);
    }
  });



app.post("/", async function(req, res){

 
    // Find all items and render the list using async/await
    const itemName = req.body.newItem;
    const listName=req.body.list;
    console.log(listName);
    console.log(itemName);
    const item=new Item({name: itemName});
    if(listName==="Today"){
    item.save();
    res.redirect("/");}
    else {
      const data = await List.findOne({name: listName});
      data.items.push(item);
      data.save();
      //res.redirect("/"+listName);
      res.render("list",{ listTitle: data.name, newListItems: data.items });
    }
    
  } );

  app.post("/delete", async function(req, res){
    try {
      const checkedItemId = req.body.checkbox;
      const listName=req.body.listName;
      if(listName==="Today"){
      // Use findByIdAndRemove to find the item by its ID and remove it
      const deletedItem = await Item.findByIdAndRemove(checkedItemId);
      if (deletedItem) {
        console.log("Successfully deleted checked item");
      } else {
        console.log("Item not found or already deleted");
      }
  
      res.redirect("/");
    } else{
        await List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItemId}}});
        
res.redirect("/"+listName);
      };
    
  }
  catch (err) {
    console.log(err);}});




app.get("/:customListName", async function(req,res){

const customListName=_.capitalize(req.params.customListName);
const data = await List.findOne({name:customListName});
    if (!data) {
      console.log("doesn't exist");
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/:customListName");
    }
    else {
    console.log("exists!");
    res.render("list",{ listTitle: data.name, newListItems: data.items });
    }
  });


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
