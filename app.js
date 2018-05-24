//load our app server

const express = require('express')
const app = express()
const mySql = require('mysql')
const bodyParser = require('body-parser')
const multer = require('multer')

const request = require('request')

app.use(bodyParser.urlencoded({
    "extended":true
}))

app.use(express.static('uploads'))

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
  
var upload = multer({ storage: storage }).single('image')



const sendNotifications = (data,callBack) => {


    request({
        url: "https://fcm.googleapis.com/fcm/send",
        method: "POST",
        headers: {
          "Content-Type" : "application/json",
          "Authorization": "key=AIzaSyDnZEXIwG9p1M9Ok7rgseSUWiR57aLabcI"
        },
        body: JSON.stringify({
          "priority" : "high",
          "notification" : {
            "title": "node notification title",
            "text": "node notification text",
            //"sound":"default",
          },
          "data":{
              "firstname":"Arslan",
          },
          "to" :  "e7AmfJlmQv8:APA91bEP-a_FO6ri1ajwYlubQoFaJNp2ypc4VhwQSbK0BLTA6vlzyIMCokM9wevrg_x82ZltE5inkRqpU6-guqqt-Wluw27fezVr_T9GhbkuNje517NkMXKc6rfyNHQOoeQDxLTb4jz8"
        })
      }, function(error, response, body) {
        if (error) { 
            console.error(error) 
            callBack(false)
            
        }
        else if (response.statusCode >= 400) { 
          console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage)
          callBack(true)
        }
        else {
            callBack(true)
        }
      });

}



app.post('/sendNotification',(req,res)=>{


   sendNotifications("123",result =>{
        if(result){
            return res.json({
                "status":true,
                "message":"sent"
            })
        }
        return res.json({
            "status":false,
            "message":"not sent"
         })
   })
})





app.post('/getUser',(req,res) =>{
    if (!req.body.id){
        return res.json({
            "error":"please give id",
            "status":false
        })
    }
    var id = req.body.id
    console.log(id)
    const connection = createSqlConnection()
    var query = "select * from Users where id = " + id
    console.log(query)
    connection.query(query,(error,rows,fields)=>{
        if(error){
            return res.json({
                "error":"something error",
                "status":false
            })
        }
        if (rows.length > 0){
            return res.json({
                "status":true,
                data:{
                    "user": rows
                }
            })
        }else{
            return res.json({
                "status":false,
                "message":"no user exist"
            })
        }

        
    })


})


app.post('/profileImage', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
        return res.json({
          "status":false,
          "error":err
      })
    }
    var url = "http://localhost:3002/"
    url = url + req.file.path.substring(8,req.file.path.length)
    console.log(url)
    var query = "UPDATE Users set image = '" + url + "' where id = " + req.body.id
    var coonection = createSqlConnection()
    coonection.query(query,(error,rows,fields)=>{
        if(error){
            return res.json({
                "error":error,
                "status":false
            })
        }
        return res.json({
                "status":true,
                data:{
                    "message":"inserted",
                    "user": {
                        "url":url
                    }
                }
        })
    })
    // Everything went fine
  })
})


app.post("/signUp",(req,res)=>{
    const connection = createSqlConnection()
    let firstName = req.body.firstName
    let lastName = req.body.lastName
    if(!firstName && !lastName){
        return res.json({
            "error":"please provide firstname and lastname",
            "status":false
        })
    }
    var query = "insert into Users (firstname,lastName) VALUES(?,?)"
    
    connection.query(query,[firstName,lastName],(error,rows,fields)=>{
        if(error){
            return res.json({
                "error":"Please give firstName and alstname",
                "status":false
            })
        }
        return res.json({
                "status":true,
                data:{
                    "message":"inserted",
                    "user": {
                        "id":rows.insertId,
                        "firstName":firstName,
                        "lastName":lastName,
                    }
                }
        })
    })
})

app.delete("/deletAllUsers",(req,res)=>{
    var query = "delete from users"
    const connection = createSqlConnection()
    connection.query(query,(error,rows,fields)=>{
        if(error){
            return res.json({
                "error":"something error",
                "status":false
            })
        }
        return res.json({
                "status":true,
                data:{
                    "message":"all users deleted"
                }
        })
    })
    

})

function createSqlConnection(){
    const connection = mySql.createConnection({
        host:'localhost',
        user:'root',
        database:'RestApis'
    })
    return connection
}

app.get("/users",(req,res) =>{

    
    const connection = createSqlConnection()
    var query = "select * from Users"
    connection.query(query,(error,rows,fields) =>{
        if (error){
            return res.json({
                "error":"something error",
                "status":false
            })
        }
        
        var user1 = {
            "firstName":"Arslan"
        }
        if(rows.length > 0){
            return res.json({
                "status":true,
                data:{
                    "users":rows
                }
            })
        }else{
            return res.json({
                "error":"no user found",
                "status":false
            })
        }
    })
})



//localhost 3002
const PORT = process.env.PORT || 3002
app.listen(PORT,() => {
    console.log("server is running")
})
