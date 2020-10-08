const express=require('express');
const app=express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;

let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');

const url='mongodb://127.0.0.1:27017';
const dbname="hospitalmanagement";
let db

MongoClient.connect(url,{ useUnifiedTopology: true,useNewUrlParser:true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbname);
    console.log(`connected database: ${url}`);
    console.log(`Database:${dbname}`);
});

app.get('/hospital', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    const data=db.collection("hospital").find().toArray().then(result => res.json(result));
});

app.get('/ventilator', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    const data=db.collection("ventilators").find().toArray().then(result=>(res.json(result)));
});

app.post('/searchventbystatus', middleware.checkToken, (req,res) => {
    const status = req.body.status;
    console.log(status);
    const data=db.collection('ventilators').find({"status":status}).toArray().then(result=>res.json(result));
});

app.post('/searchventbyname', middleware.checkToken, (req,res) => {
    const name=req.body.name;
    console.log(name);
    const data=db.collection('ventilators').find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

app.post('/searchhospital', middleware.checkToken, (req,res) => {
    const name=req.body.name;
    console.log(name);
    const data=db.collection('hospital').find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

app.put('/addvent',(req,res)=>{
    const hId=req.body.hId;
    const ventilatorId=req.body.ventilatorId;
    const status=req.body.status;
    const name=req.body.name;
    console.log("adding ventilator, please wait a moment");
    const item={"hId":hId, "ventilatorId":ventilatorId, "status":status, "name":name};
    db.collection("ventilators").insertOne(item, function(err, result){
        res.json("inserted successfully");
    });
});

app.post('/updateventilator', middleware.checkToken, (req,res) => {
    const ventilatorId= {ventilatorId: req.body.ventilatorId};
    console.log(ventilatorId);
    const newvalues={$set: {status:req.body.status}};
    console.log("updating ventilator details, please wait a moment");
    db.collection("ventilators").updateOne(ventilatorId, newvalues, function(err, result){
        res.json('updated one document');
        if(err) throw err;
    });
});

app.delete('/deletevent', middleware.checkToken, (req,res) => {
    const ventilatorId=req.body.ventilatorId;
    console.log(ventilatorId);
    const temp={"ventilatorId":ventilatorId};
    db.collection("ventilators").deleteOne(temp, function(err,obj){
        if(err) throw err;
        res.json("deleted one element");
    });
});
app.listen(9000,(req,res)=>{
    console.log("working well");
}); 