const adminCollection = require('../db').db().collection("admin")
const parentsCollection = require('../db').db().collection("parents")
const teachersCollection = require('../db').db().collection("teachers")
const reportCollection = require('../db').db().collection("reports")
const ObjectID = require('mongodb').ObjectID

exports.checkAdmin = async function(req,res,next){

  if(req.session.user){
    let admin = await adminCollection.findOne({type: "admin"})
    if(admin){
      next()
    }else{
      res.render('admin/404');
    }
  }else{
    req.flash('errors', "You must be logged in first.")
    req.session.save(function(){
       res.redirect('/');
    })
  }
}

exports.login = function(req,res){

    res.render('admin/login',{
        errors: req.flash('errors')
    });
}

exports.logout = function(req, res) {
    req.session.destroy(function() {
      res.redirect('/')
    })
  }

exports.welcome = async function(req,res){

   let admin = await adminCollection.findOne({username: req.body.username,password:req.body.password})
  //  console.log(admin)
   if(admin){
    req.session.user = {
        username: admin.username, 
      }
      res.redirect('/')

   }else{
       console.log("not found")
       req.flash('errors', "Incorrect Password ")
       req.session.save(function(){
         res.redirect('/admin');
       })
       
   }

}


exports.teachers = async function(req,res){

  try{
    let teachers = await teachersCollection.find().toArray()
  if(teachers){
    res.render('admin/all-teachers',{
      teachers: teachers,
      success: req.flash("success"),
      errors: req.flash("errors")
    });
  }

  }catch(err){
    res.send(err);
  }

}


exports.parents = async function(req,res){

 try{
  let parents = await parentsCollection.find().toArray()
  if(parents){
    res.render('admin/all-parents',{
      parents: parents,
      success: req.flash("success"),
      errors: req.flash("errors")
    });
  }

 }catch(err){
   res.send(err);
 }

}




exports.findUser = async function(req,res){

  try{

  let user = await teachersCollection.findOne({_id: new ObjectID(req.params.id)})
  if(user){

    res.render('admin/accountStatus',{
      user:user,
      success: req.flash("success"),
      errors: req.flash("errors")
    })
    
  }else{
    let user = await parentsCollection.findOne({_id: new ObjectID(req.params.id)})
    if(user){

      res.render('admin/accountStatus',{
        user:user,
        success: req.flash("success"),
        errors: req.flash("errors")
      })
      
    }else{
      res.send("User doesn't exits");
    }
  }

  }catch(err){

    // console.log(err)
    res.render('admin/404');


  }

}



exports.updateAccount = async function(req,res){
  let id = req.body.id;
  let account = req.body.account;
  let type = req.body.type;


    if(type == "teacher"){

      let teacher = await teachersCollection.findOne({_id: new ObjectID(id)})
      if(teacher){

        try{
          await teachersCollection.findOneAndUpdate({_id: new ObjectID(id)},
            {$set: {
         
             account : account,
            
            }}),

            req.flash('success',"Account status updated sucessfully")

          req.session.save(function(){
            res.redirect(`/user/${id}`);
          })

         
      
        }catch(err){
          res.send(err)
        }
      }


    }else if(type == "parents"){

      let parent = await parentsCollection.findOne({_id: new ObjectID(id)})
      if(parent){

        try{
          await parentsCollection.findOneAndUpdate({_id: new ObjectID(id)},
            {$set: {
         
             account : account,
            
            }}),
            
           
            req.flash('success',"Account status updated sucessfully")

            req.session.save(function(){
              res.redirect(`/user/${id}`);
            })
  

      
        }catch(err){
          res.send(err)
        }
      }

    }


}


exports.reports = async function(req,res){

  try{
    let reports = await reportCollection.find().sort({createdDate: -1}).toArray()
    if(reports){
      res.render('admin/user-reports',{
        reports: reports
      });
    }
  
   }catch(err){
     res.send(err);
   }

}



exports.blockedTeachers = async function(req,res){

try{
  let users = await teachersCollection.find({account : "Blocked"}).toArray()
if(users){
  res.render('admin/blocked-teachers',{
    users:users,
  });
}
}catch(err){
  res.send(err);
}


}

exports.blockedParents = async function(req,res){
  try{
    let users = await parentsCollection.find({account : "Blocked"}).toArray()
  if(users){
    res.render('admin/blocked-parents',{
      users:users,
    });
  }
  }catch(err){
    res.send(err);
  }
}



