const express = require('express');
const bodyParser= require ("body-parser");
const { getDay } = require('./date');



const mongoose = require ( "mongoose");
const _ = require ("lodash");
const app = express();



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item =  mongoose.model("Item",itemSchema);

const Item1= new Item ({
    name:"Welcome to your to do list"
})
const Item2= new Item ({
    name:"Click + to add an item"
})
const Item3= new Item ({
    name:"<=== click checkbox to delete an item"
})

const defaultItems= [Item1,Item2,Item3];
 
const listSchema = new mongoose.Schema ({
    name :String, 
    items: [itemSchema]
});

const List = mongoose.model('List',listSchema);



app.get('/', function(req, res) {
    Item.find({}, function (err, foundItems){

        if (foundItems.length===0){
        Item.insertMany(defaultItems,function (err){
                if (err){
                    console.log(err);
                }else{
                    console.log("Item updated successfully to default Items DB");
                }
            });
            res.redirect("/")
        }else{
            res.render('List', {listTitle:"Today", newListItems:foundItems});

        }
    });
});





app.get("/:customListName", function (req,res){
  
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name:customListName},function(err,foundList){
        if (!err){
            if (!foundList){
                // no list found in the db with this name so make a new list 
                const list = new List({
                    name: customListName,
                    items:defaultItems
                });
                
               list.save()
               res.redirect("/"+ customListName)
                
            }else{
                // Show the found list from the database 
                res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
                    
                
            }
        }
    });  
    });
 
  
 
//  app.get("/work", function(req,res){
//     let day= date.getDay();
//      res.render("list",{listTitle:day+" Work list",newListItems:workItems});
//  })


//  app.post("/work",function(req,res){
//      let item=req.body.newItems;
//      workItems.push(item);
//      res.redirect("/work");
//  });

app.post("/",function (req,res){

    const itemName = req.body.newItem
    let listName = req.body.list;
 
     const item = new Item({
         name:itemName
     });
     if (listName === "Today"){
        item.save();
        res.redirect("/");
      } else {
        List.findOne({name: listName}, function(err, foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
        });
      }
   });


app.post ("/delete",function (req,res){
        const checkedItemId = req.body.checkbox;
        let listName = req.body.list;

    if (listName="Today"){
        Item.findByIdAndRemove(checkedItemId,function (err){
            if(!err){
            console.log("task deleted")
            res.redirect("/");
            }
        })    
        
    }else {         
       
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
          if (!err){
            res.redirect("/" + listName);
          }
        })
      }
        

    });

app.get("/about",function(req,res){
res.render("about");
});

app.listen(3000, () => console.log('listening on port 3000!'));