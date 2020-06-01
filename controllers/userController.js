const Teacher = require('../models/Teacher')
const Parent = require('../models/Parent')
const teachersCollection = require('../db').db().collection("teachers")
const parentsCollection = require('../db').db().collection("parents")
const requestCollection = require('../db').db().collection("requests")
const friendCollection = require('../db').db().collection("friends")
const reportCollection = require('../db').db().collection("reports")

const ObjectID = require('mongodb').ObjectID



exports.mustBeLoggedIn = function(req,res,next){
 if(req.session.user){
   if(req.session.user.account == "Blocked"){
     res.render('blocked');
   }else{
    next()
   }
 }else{
   req.flash('errors', "You must be logged in first.")
   req.session.save(function(){
      res.redirect('/login');
   })
 }

}
exports.login = function(req, res) {

  if(req.body.type == "teacher"){
      let user = new Teacher(req.body)
    user.login().then(function(result) {
      req.session.user = {
        username: user.data.username, 
        type: user.data.type,
          }
      req.session.save(function() {
        res.redirect('/')
      })
    }).catch(function(e) {
      req.flash('errors', e)
      req.session.save(function() {
        res.redirect('/login')
      })
    })

  }else if (req.body.type == "parents"){
        let user = new Parent(req.body)
    user.login().then(function(result) {
      req.session.user = {
            username: user.data.username, 
            type: user.data.type,
          }
      req.session.save(function() {
        res.redirect('/')
      })
    }).catch(function(e) {
      req.flash('errors', e)
      req.session.save(function() {
        res.redirect('/login')
      })
    })

  }else if (req.body.type == "admin"){
    res.send("Admin");
  }else{
    res.send("Login Failed !");
  }

}

exports.logout = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/')
  })
}

exports.register = function(req, res) {


if(req.body.type == "teacher"){

  let user = new Teacher(req.body)
   user.register().then(() => {
     req.session.user = {
           username: user.data.username, 
           type: user.data.type,
         }
     req.session.save(function() {
       res.redirect('/')
     })
   }).catch((regErrors) => {
     regErrors.forEach(function(error) {
       req.flash('regErrors', error)
     })
     req.session.save(function() {
       res.render("signup",{
        regErrors : req.flash('regErrors')
       });
     })
   })
 
 }else{
 
   let user = new Parent(req.body)
   user.register().then(() => {
     req.session.user = {
       username: user.data.username, 
       type: user.data.type,
         }
     req.session.save(function() {
       res.redirect('/')
     })
   }).catch((regErrors) => {
     regErrors.forEach(function(error) {
       req.flash('regErrors', error)
     })
     req.session.save(function() {
      res.render("signup",{
        regErrors : req.flash('regErrors')
      })
     })
   })
 }

 
}


exports.welcome = async function(req, res) {
  if (req.session.user) {

    if(req.session.user.type == "teacher"){
      let user = await teachersCollection.findOne({username:req.session.user.username})
      if(user){

        req.session.user = {
          _id: user._id,
          username: user.username, 
          type: user.type,
          account: user.account,
            }
        req.session.save(function() {
          res.render('teachers-dashboard', {
            user:user,
            success: req.flash('success')
          })
        })


      } 
      
    }else if(req.session.user.type == "parents"){
      let user = await parentsCollection.findOne({username:req.session.user.username})
      if(user){
        req.session.user = {
          _id: user._id,
          username: user.username, 
          type: user.type,
          account: user.account,
            }
        req.session.save(function() {
          res.render('parents-dashboard', {
            user:user,
            success: req.flash('success')
          })
        })
      } 

    }else if(req.session.user.username == "admin"){

      let teachers = await teachersCollection.find().toArray();
      let parents = await parentsCollection.find().toArray();
      let reports = await reportCollection.find().toArray();

      let totalteachers = teachers.length;
      let totalparents = parents.length;
      let totalreports = reports.length;


      res.render('admin/dashboard', {
        
        totalteachers : totalteachers,
        totalparents : totalparents,
        totalreports : totalreports,
      
      })
    }

   
  } else {
    res.render('index', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
  }
}



exports.ifUserExits = function(req,res,next){

  if(req.session.user.type == "teacher"){
    Teacher.findByUserName(req.params.username).then(function(userDoc){
      req.userProfile = userDoc
      next()

    }).catch(function(){

      res.render("404");
    
    })


  }else if(req.session.user.type == "parents"){
   
    Parent.findByUserName(req.params.username).then(function(userDoc){
      // console.log(userDoc.firstname)
      req.userProfile = userDoc
 
      next()

    }).catch(function(){

      res.render("404");
      
    })


    }
}


exports.profileShow = async function(req,res){

  if(req.session.user.type == "teacher"){

    let type = req.session.user.type

    let request = await requestCollection.findOne({reqBy: new ObjectID(req.session.user._id), reqTo: new ObjectID(req.userProfile._id)})
    
    let pending = await requestCollection.findOne({reqBy: new ObjectID(req.userProfile._id), reqTo: new ObjectID(req.session.user._id) })

    let friend = await friendCollection.findOne({reqBy: new ObjectID(req.userProfile._id), reqTo: new ObjectID(req.session.user._id) })

    res.render("parentProfileView",{
      id: req.userProfile._id,
      username: req.userProfile.username,
      file: req.userProfile.file,
      phone: req.userProfile.phone,
      type: req.userProfile.type,
      id: req.userProfile._id,
      username: req.userProfile.username,
      file: req.userProfile.file,
      phone: req.userProfile.phone,
      gender: req.userProfile.gender,
      address: req.userProfile.address,
      city: req.userProfile.city,
      overview: req.userProfile.overview,
      firstname: req.userProfile.firstname,
      lastname: req.userProfile.lastname,
      classes: req.userProfile.classes,
      subjects: req.userProfile.subjects,
      salary: req.userProfile.salary,
      medium: req.userProfile.medium,
      pending: pending,
      request:request,
      user: type,
      friend:friend,
      success: req.flash('success'),
      errors: req.flash('errors')
    });

  }else if(req.session.user.type == "parents"){
    let type = req.session.user.type

    let request = await requestCollection.findOne({reqBy: new ObjectID(req.session.user._id), reqTo: new ObjectID(req.userProfile._id)})
   

    let pending = await requestCollection.findOne({ reqBy: new ObjectID(req.userProfile._id), reqTo: new ObjectID(req.session.user._id) })

    let friend = await friendCollection.findOne({reqBy: new ObjectID(req.userProfile._id), reqTo: new ObjectID(req.session.user._id) })



    res.render("teacherProfileView",{
        id: req.userProfile._id,
        username: req.userProfile.username,
        file: req.userProfile.file,
        type: req.userProfile.type,
        phone: req.userProfile.phone,
        gender: req.userProfile.gender,
        address: req.userProfile.address,
        city: req.userProfile.city,
        overview: req.userProfile.overview,
        firstname: req.userProfile.firstname,
        lastname: req.userProfile.lastname,
        classes: req.userProfile.classes,
        subjects: req.userProfile.subjects,
        salary: req.userProfile.salary,
        medium: req.userProfile.medium,
        experience: req.userProfile.experience,
        educationLevel: req.userProfile.educationLevel,
        educationalBackground: req.userProfile.educationalBackground,
        instituteName: req.userProfile.instituteName,
        result: req.userProfile.result,
        passed: req.userProfile.passed,
        pending: pending,
        request:request,
        user:type,
        friend:friend,
        success: req.flash('success'),
        errors: req.flash('errors')

    });
  }

}

exports.addRequest = async function(req,res){


  if(req.session.user){


    let check = await requestCollection.findOne({reqBy: new ObjectID(req.userProfile._id ),reqTo: new ObjectID(req.session.user._id)})

    if(check){

          req.flash('errors', `${req.userProfile.username} is already sent you a request recently`)
          req.session.save(function(){
            res.redirect(`/profile/${req.userProfile.username}`)
          })

    }else{

      let user = await requestCollection.findOne({reqBy: new ObjectID(req.session.user._id),reqTo: new ObjectID(req.userProfile._id)})
    
      if(!user){
  
        await requestCollection.insertOne({
            reqBy: new ObjectID(req.session.user._id),
            reqTo: new ObjectID(req.userProfile._id)
            })
  
            req.flash('success', `Request sent successfully to ${req.userProfile.username} `)
            req.session.save(function(){
              res.redirect(`/profile/${req.userProfile.username}`)
            })
  
      
  
        }else{
          req.flash('errors', `Request already sent`)
        req.session.save(function(){
          res.redirect(`/profile/${req.userProfile.username}`)
        })
        }

    }

  }else{
    res.render('404');    
  }
}




exports.cancleRequest = async function(req,res){


  if(req.session.user){

    let check = await friendCollection.findOne({reqBy: new ObjectID(req.session.user._id),reqTo: new ObjectID(req.userProfile._id)})

    if(check){

      req.flash('errors', `${req.userProfile.username} is accepted your request recently. You won't able to cancle this request bcoz you and ${req.userProfile.username} are friends now`)
      req.session.save(function(){
        res.redirect(`/profile/${req.userProfile.username}`)
      })

    }else{

      let user = await requestCollection.findOne({reqBy: new ObjectID(req.session.user._id),reqTo: new ObjectID(req.userProfile._id)})
    
    if(user){

      await requestCollection.deleteOne({
          reqBy: new ObjectID(req.session.user._id),
          reqTo: new ObjectID(req.userProfile._id)
          })

       req.flash('errors', `Request successfully canceled`)
      req.session.save(function(){
        res.redirect(`/profile/${req.userProfile.username}`)
      })

      }else{
        req.flash('errors', `Request already removed`)
      req.session.save(function(){
        res.redirect(`/profile/${req.userProfile.username}`)
      })
      }
    }

  }else{
    res.render('404');    
  }
}

  exports.acceptRequest = async function(req,res){
 

    if(req.session.user){

    let request = await requestCollection.findOne({reqBy: new ObjectID(req.userProfile._id), reqTo: new ObjectID(req.session.user._id)})

      if(request){

        let user = await friendCollection.findOne({reqBy: new ObjectID(req.userProfile._id), reqTo: new ObjectID(req.session.user._id)})

          if(!user){


              await friendCollection.insertOne({reqBy: new ObjectID(req.userProfile._id), reqTo: new ObjectID(req.session.user._id)})
              await friendCollection.insertOne({reqBy: new ObjectID(req.session.user._id), reqTo: new ObjectID(req.userProfile._id)})

              await requestCollection.deleteOne({reqBy: new ObjectID(req.userProfile._id), reqTo: new ObjectID(req.session.user._id)})
              await requestCollection.deleteOne({reqBy: new ObjectID(req.session.user._id), reqTo: new ObjectID(req.userProfile._id)})
              
              req.flash('success', `You and ${req.userProfile.username} are friends now`)
             req.session.save(function(){
             res.redirect(`/profile/${req.userProfile.username}`)
               })

          } else{

            req.flash('success', `This request was already accepted by you`)
            req.session.save(function(){
            res.redirect(`/profile/${req.userProfile.username}`)
              })
          }
        
      }else{
        req.flash('success', `${req.userProfile.username} already cancled this request, You won't able to accept this request`)
            req.session.save(function(){
            res.redirect(`/profile/${req.userProfile.username}`)
              })
      }
    }else{
      res.render('404');
    }
 
}


  exports.unfriend = async function(req,res){
   

    if(req.session.user){

      await friendCollection.deleteOne({reqBy: new ObjectID(req.userProfile._id), reqTo: new ObjectID(req.session.user._id)})
      await friendCollection.deleteOne({reqBy: new ObjectID(req.session.user._id), reqTo: new ObjectID(req.userProfile._id)})

            req.flash('errors', `You just unfriend ${req.userProfile.username}`)
            req.session.save(function(){
            res.redirect(`/profile/${req.userProfile.username}`)
              })

    }else{
      res.render('404');
    }
   
  }



  exports.search = function(req,res){
    
    let type = req.session.user.type

    if(req.session.user.type == "teacher"){

      res.render('search',{
        type: type,
        errors: req.flash('errors'),
      });

    }else if(req.session.user.type == "parents"){

      res.render('search',{
        type: type,
        errors: req.flash('errors'),
      });

  }
}


  exports.getSearch = async function(req,res){
    
    let type = req.session.user.type;

    let search = req.body.search.toLowerCase()

    var classes = ["1", "2", "3", "4", "psc", "6", "7", "jsc", "ssc", "hsc" ];

     var subjects = ["bangla", "english", "math", "physics",
                      "chemistry", "biology", "higher math", 
                      "agriculture" ,"home economics", "accounting", 
                      "management", "finance", "sociology", "economics",
                       "social work" , "history"];

      var address = ["chashara", "amlapara", "nitaigonj", "jalkuri", "bhuigor"];

                       

    if(req.session.user.type == "teacher"){

      if(address.indexOf(search) !== -1){


        try{

          let parents = await parentsCollection.find({address: search}).toArray()
         
           if(parents){

            req.flash('success', `${parents.length} result(s) found`)
            req.session.save(function(){
            
              res.render('parentsresult', {
                parents:parents,
                type:type,
                success: req.flash('success'),
                errors: req.flash('errors'),
              });
              })

               }
 
           }catch(err){
             res.send(err);
           }

      }else if(classes.indexOf(search) !== -1){

        try{

          let parents = await parentsCollection.find({classes: search}).toArray()
         
           if(parents){

            req.flash('success', `${parents.length} result(s) found`)
            req.session.save(function(){
            
              res.render('parentsresult', {
                parents:parents,
                type:type,
                success: req.flash('success'),
                errors: req.flash('errors'),
              });
              })

               }
 
           }catch(err){
             res.send(err);
           }
      }else if(subjects.indexOf(search) !== -1){

        try{

          let parents = await parentsCollection.find({subjects: search}).toArray()
         
           if(parents){
                   
            req.flash('success', `${parents.length} result(s) found`)
            req.session.save(function(){
            
              res.render('parentsresult', {
                parents:parents,
                type:type,
                success: req.flash('success'),
                errors: req.flash('errors'),
              });
              })

               }
 
           }catch(err){
             res.send(err)
           }
          }else if(subjects.indexOf(search) !== -1){

        try{

          let parents = await parentsCollection.find({subjects: search}).toArray()
         
           if(parents){
                   
            req.flash('success', `${parents.length} result(s) found`)
            req.session.save(function(){
            
              res.render('parentsresult', {
                parents:parents,
                type:type,
                success: req.flash('success'),
                errors: req.flash('errors'),
              });
              })

               }
 
           }catch(err){
             res.send(err)
           }
      }else{
       
        req.flash('errors', `Wrong Keywords Please search by a class name/number (such as: 1,2,3,4,PSC,JSC, etc)
                                            OR by a subject name (such as: Bangla, English, etc) 
                                            OR by a address name (such as: Chashara, Jalkuri, etc) `)
            req.session.save(function(){

              res.render('search',{
                type: type,
                errors: req.flash('errors'),
              });
              })
      }
    
    }
     else if(req.session.user.type == "parents"){
      if(address.indexOf(search) !== -1){

        try{

          let teachers = await teachersCollection.find({address: search}).toArray()
         console.log(teachers)
           if(teachers){

            req.flash('success', `${teachers.length} result(s) found`)
            req.session.save(function(){
              res.render('teachersresult', {
                teachers:teachers,
                 type:type,
                 success: req.flash('success'),
                 errors: req.flash('errors'),
               });
              })

               }
 
           }catch(err){
             res.send(err);
           }




      }else if(classes.indexOf(search) !== -1){

        try{

          let teachers = await teachersCollection.find({classes: search}).toArray()
         console.log(teachers)
           if(teachers){

            req.flash('success', `${teachers.length} result(s) found`)
            req.session.save(function(){
              res.render('teachersresult', {
                teachers:teachers,
                 type:type,
                 success: req.flash('success'),
                 errors: req.flash('errors'),
               });
              })

               }
 
           }catch(err){
             res.send(err);
           }
      }else if(subjects.indexOf(search) !== -1){

        try{

          let teachers = await teachersCollection.find({subjects: search}).toArray()
         
           if(teachers){
                   
            req.flash('success', `${teachers.length} result(s) found`)
            req.session.save(function(){
              res.render('teachersresult', {
                teachers:teachers,
                 type:type,
                 success: req.flash('success'),
                 errors: req.flash('errors'),
               });
              })

               }
 
           }catch(err){
             res.send(err)
           }
      }else{
        req.flash('errors', `Wrong Keywords Please search by a class name/number (such as: 1,2,3,4,PSC,JSC, etc)
                                            OR by a subject name (such as: Bangla, English, etc) 
                                            OR by a address name (such as: Chashara, Jalkuri, etc) `)
        req.session.save(function(){

          res.render('search',{
            type: type,
            errors: req.flash('errors'),
          });
          })
      }
   }
 }


exports.friends = async function(req,res){

  let type = req.session.user.type

  if(req.session.user.type == "teacher"){
    try{
      let users = await friendCollection.aggregate([
        {$match:{reqBy: new ObjectID(req.session.user._id)}},
        {$lookup: 
        {from: "parents", localField: "reqTo", foreignField: "_id", as: "reqToDocument",}},
        {$project: {  
        reqTo: {$arrayElemAt: ["$reqToDocument", 0]}
        }}
  
      ]).toArray()
  
      if(users){
        res.render("friends",{
          type:type,
          users:users,
        });
        }
    }catch(err){
      res.send(err);
    }
  
  }else{

    try{
      let users = await friendCollection.aggregate([
        {$match:{reqBy: new ObjectID(req.session.user._id)}},
        {$lookup: 
        {from: "teachers", localField: "reqTo", foreignField: "_id", as: "reqToDocument",}},
        {$project: {  
          reqTo: {$arrayElemAt: ["$reqToDocument", 0]}
        }}
  
      ]).toArray()
  
      if(users){
        res.render("friends",{
          type:type,
          users:users,
        });
        }
    }catch(err){
      res.send(err);
    }

  }

  }



exports.requestFrom = async function(req,res){

  let type = req.session.user.type

  if(req.session.user.type == "teacher"){
    try{
      let users = await requestCollection.aggregate([
        {$match:{reqTo: new ObjectID(req.session.user._id)}},
        {$lookup: 
        {from: "parents", localField: "reqBy", foreignField: "_id", as: "reqByDocument",}},
        {$project: {  
          reqBy: {$arrayElemAt: ["$reqByDocument", 0]}
        }}
  
      ]).toArray()
  
      if(users){
       
        res.render("requestFrom",{
          type:type,
          users:users,
        });
        }
    }catch(err){
      res.send(err);
    }
  
  }else{

    try{
      let users = await requestCollection.aggregate([
        {$match:{reqTo: new ObjectID(req.session.user._id)}},
        {$lookup: 
        {from: "teachers", localField: "reqBy", foreignField: "_id", as: "reqByDocument",}},
        {$project: {  
          reqBy: {$arrayElemAt: ["$reqByDocument", 0]}
        }}
  
      ]).toArray()
  
      if(users){
  
        res.render("requestFrom",{
          type:type,
          users:users,
        });
        }
    }catch(err){
      res.send(err);
    }

  }

}


exports.requestTo = async function(req,res){
 
  let type = req.session.user.type

  if(req.session.user.type == "teacher"){
    try{
      let users = await requestCollection.aggregate([
        {$match:{reqBy: new ObjectID(req.session.user._id)}},
        {$lookup: 
        {from: "parents", localField: "reqTo", foreignField: "_id", as: "reqToDocument",}},
        {$project: {  
        reqTo: {$arrayElemAt: ["$reqToDocument", 0]}
        }}
  
      ]).toArray()
  
      if(users){
       
        res.render("requestTo",{
          type:type,
          users:users,
        });
        }
    }catch(err){
      res.send(err);
    }
  
  }else{

    try{
      let users = await requestCollection.aggregate([
        {$match:{reqBy: new ObjectID(req.session.user._id)}},
        {$lookup: 
        {from: "teachers", localField: "reqTo", foreignField: "_id", as: "reqToDocument",}},
        {$project: {  
          reqTo: {$arrayElemAt: ["$reqToDocument", 0]}
        }}
  
      ]).toArray()
  
      if(users){

        res.render("requestTo",{
          type:type,
          users:users,
        });
        }
    }catch(err){
      res.send(err);
    }

  }

}




exports.report = async function(req,res){



  this.data = {
   id : req.body.id,
   username: req.body.username,
   type: req.body.type,
   file: req.body.file,
   gender: req.body.gender,
   phone: req.body.phone,
   reason: req.body.reason,
   details : req.body.details,
   byUsername : req.session.user.username,
   byType : req.session.user.type,
    createdDate: new Date(),


  }


  let check = await reportCollection.findOne({byUsername : req.session.user.username,  username: req.body.username })

  if(!check){

  try{

    await reportCollection.insertOne(this.data)

    req.flash('success', `Reported Successfully`)
    req.session.save(function(){
    res.redirect(`/profile/${req.body.username}`);
      })

  }catch(err){
    res.send(err);
  }

  }else{
    req.flash('errors', `You already reported this user once. You can't report a user twice`)
    req.session.save(function(){
    res.redirect(`/profile/${req.body.username}`);
      })
  }

  

}

