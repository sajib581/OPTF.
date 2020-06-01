const Teacher = require('../models/Teacher')
const Parent = require('../models/Parent')
const teachersCollection = require('../db').db().collection("teachers")
const ObjectID = require('mongodb').ObjectID
const upload = require('express-fileupload')

exports.teacherProfilePicture = async function(req, res) {

  if(req.session.user){

  let file = req.files.file;
  let filename = Date.now() + "-" + file.name;

  file.mv("./public/images/teacher/" + filename, (err) => {
      if(err) throw err;
  
  })

    try{
      await teachersCollection.findOneAndUpdate({username:req.session.user.username},
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

let user = await teachersCollection.findOne({username: req.session.user.username})
if(user){
  await teachersCollection.findOneAndUpdate({username:req.session.user.username},{
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


let user = await teachersCollection.findOne({username: req.session.user.username})
if(user){
  await teachersCollection.findOneAndUpdate({username:req.session.user.username},{
    $set:{
              classes: req.body.classes,
              subjects: req.body.subjects,
              medium: req.body.medium,
              salary: req.body.salary,
              experience: req.body.experience
        }
  })

  // let abcd = await teachersCollection.findOne({classes: 'PSC'})
  // if(abcd){
  //   console.log(abcd)
  // }else{
  //   console.log("No data")
  // }

  req.flash('success', 'Your tuition information is successsfully updated')
  req.session.save(function(){
    res.redirect('/')
  })
  
  }
 }



exports.educationalInformation = async function(req,res){


  let user = await teachersCollection.findOne({username: req.session.user.username})
  if(user){
    await teachersCollection.findOneAndUpdate({username:req.session.user.username},{
      $set:{
            educationLevel: req.body.educationLevel,
            educationalBackground: req.body.educationalBackground,
            instituteName: req.body.instituteName,
            result: req.body.result,
            passed: req.body.passed,
          }
    })

    req.flash('success', 'Your educational information is successsfully updated')
    req.session.save(function(){
      res.redirect('/')
    })
    }
   }


   exports.teachers = async function(req,res){
    let type = req.session.user.type
    
    try{

      let users = await teachersCollection.find().sort({createdDate: -1}).toArray()

      if(users){

        res.render('teachers',{
          users: users,
          type: type
        });

      }


    }catch(err){
      res.send(err);
    }
}
