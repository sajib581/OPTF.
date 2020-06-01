const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const teacherController = require('./controllers/teacherController')
const parentController = require('./controllers/parentController')
const adminController = require('./controllers/adminController')



//users

router.get('/', userController.welcome)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/logout', userController.logout)

router.get('/profile/:username', userController.mustBeLoggedIn, userController.ifUserExits,userController.profileShow)

// friends

router.get('/add/:username', userController.mustBeLoggedIn, userController.ifUserExits, userController.addRequest)
router.get('/cancle/:username', userController.mustBeLoggedIn, userController.ifUserExits, userController.cancleRequest)
router.get('/accept/:username', userController.mustBeLoggedIn, userController.ifUserExits, userController.acceptRequest)
router.get('/unfriend/:username', userController.mustBeLoggedIn, userController.ifUserExits, userController.unfriend)
router.get('/about', userController.mustBeLoggedIn, function(req,res){

  res.render('about-us');

})


//Teacher

router.post('/teacher/profilepicture', userController.mustBeLoggedIn, teacherController.teacherProfilePicture)
router.post('/teacher/basicInfo',  userController.mustBeLoggedIn, teacherController.basicInfo)
router.post('/teacher/tuitionInformation',  userController.mustBeLoggedIn, teacherController.tuitionInformation)
router.post('/teacher/educationalInformation',  userController.mustBeLoggedIn, teacherController.educationalInformation)
router.get('/teachers', userController.mustBeLoggedIn,teacherController.teachers)

//Parents

router.post('/parent/profilepicture', userController.mustBeLoggedIn, parentController.parentProfilePicture)
router.post('/parent/basicInfo',  userController.mustBeLoggedIn, parentController.basicInfo)
router.post('/parent/tuitionInformation',  userController.mustBeLoggedIn, parentController.tuitionInformation)
router.get('/parents', userController.mustBeLoggedIn,parentController.parents)

//Search
router.get('/search', userController.mustBeLoggedIn,userController.search)
router.post('/search', userController.mustBeLoggedIn,userController.getSearch)
//View Friends and Request
router.get('/friends', userController.mustBeLoggedIn,userController.friends)
router.get('/requestFrom', userController.mustBeLoggedIn,userController.requestFrom)
router.get('/requestTo', userController.mustBeLoggedIn,userController.requestTo)

//User Report
router.post('/report', userController.mustBeLoggedIn,userController.report)


// Admin
router.get('/admin', adminController.login)
router.post('/admin', adminController.welcome)
router.get('/AllTeachers', adminController.checkAdmin, adminController.teachers)
router.get('/AllParents', adminController.checkAdmin, adminController.parents)

router.get('/user/:id', adminController.checkAdmin, adminController.findUser)
router.post('/userUpdate',  adminController.updateAccount)

router.get('/UserReports', adminController.checkAdmin, adminController.reports)

router.get('/BlockedTeachers', adminController.checkAdmin, adminController.blockedTeachers)
router.get('/BlockedParents', adminController.checkAdmin, adminController.blockedParents)






router.get('/login', function(req,res){
  res.render('login',{
    errors : req.flash("errors")
  });
})

router.get('/register', function(req,res){
  res.render('signup',{
    regErrors : req.flash("regErrors")
  });
})


module.exports = router