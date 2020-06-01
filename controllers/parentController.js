const Teacher = require('../models/Teacher')
const Parent = require('../models/Parent')
const parentsCollection = require('../db').db().collection("parents")
const ObjectID = require('mongodb').ObjectID
const upload = require('express-fileupload')

exports.parentProfilePicture = async function(req, res) {

  if(req.session.user){

  let file = req.files.file;
  let filename = Date.now() + "-" + file.name;

  file.mv("./public/images/parent/" + filename, (err) => {
      if(err) throw err;
  
  })

    try{
      await parentsCollection.findOneAndUpdate({username:req.session.user.username},
        {$set: {
     
         file: filename,
        
        }}),
        
        req.flash('success', 'Your profile picture is successsfully updated')
        req.session.save(function(){
          res.redirect('/')
        })
        
  
    }catch(err){
      res.send(err)
    }
  
  }else{
    res.send("You Must Logged-In First.");
  }
}



exports.basicInfo = async function(req,res){

  let user = await parentsCollection.findOne({username: req.session.user.username})
  if(user){
    await parentsCollection.findOneAndUpdate({username:req.session.user.username},{
      $set:{
                firstname: req.body.firstname,
                lastname:req.body.lastname,
                phone: req.body.phone,
                overview: req.body.overview,
                address: req.body.address,
                city: req.body.city,
          }
    })
  
    req.flash('success', 'Your basic information is successsfully updated')
    req.session.save(function(){
      res.redirect('/')
    })
  }
  
  
  }
  
  
  exports.tuitionInformation = async function(req,res){
  
  
  let user = await parentsCollection.findOne({username: req.session.user.username})
  if(user){
    await parentsCollection.findOneAndUpdate({username:req.session.user.username},{
      $set:{
                classes: req.body.classes,
                subjects: req.body.subjects,
                medium: req.body.medium,
                salary: req.body.salary,
                experience: req.body.experience
          }
    })
    // let abcd = await parentsCollection.findOne({classes: '9'})
    // console.log(abcd.classes)
    req.flash('success', 'Your tuition information is successsfully updated')
    req.session.save(function(){
      res.redirect('/')
    })
    
    }
   }
  

   exports.parents = async function(req,res){
    let type = req.session.user.type
    
    try{

      let users = await parentsCollection.find().sort({createdDate: -1}).toArray()

      if(users){

        res.render('parents',{
          users: users,
          type: type
        });

      }


    }catch(err){
      res.send(err);
    }
}



