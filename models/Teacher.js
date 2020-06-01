const bcrypt = require("bcryptjs")
const teachersCollection = require('../db').db().collection("teachers")
const parentsCollection = require('../db').db().collection("parents")
const ObjectID = require('mongodb').ObjectID
const validator = require("validator")



let Teacher = function(data) {
  this.data = data
  this.errors = []

}




Teacher.prototype.cleanUp = function() {
  if (typeof(this.data.username) != "string") {this.data.username = ""}
  if (typeof(this.data.email) != "string") {this.data.email = ""}
  if (typeof(this.data.password) != "string") {this.data.password = ""}
  if (typeof(this.data.phone) != "string") {this.data.password1 = ""}

  // get rid of any bogus properties
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
    phone:this.data.phone,
    gender:this.data.gender,
    type:this.data.type,
    file:"user.png",
    address:this.data.address,
    city:"City Name",
    overview:"I Am A Good Teacher",
    firstname:this.data.firstname,
    lastname:this.data.lastname,
    createdDate: new Date(),
    classes: this.data.classes,
    subjects: this.data.subjects,
    salary: this.data.salary,
    medium: this.data.medium,
    experience: this.data.experience,
    educationLevel: this.data.educationLevel,
    educationalBackground: this.data.educationalBackground,
    instituteName: this.data.instituteName,
    result: this.data.result,
    passed: this.data.passed,
    account: "Active"

  }
}





Teacher.prototype.validate = function() {
  return new Promise(async (resolve, reject) => {
    if (this.data.username == "") {this.errors.push("You must provide a username.")}
    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("Username can only contain letters and numbers.")}
    if (!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address.")}
    if (this.data.password == "") {this.errors.push("You must provide a password.")}
    if (this.data.password.length > 0 && this.data.password.length < 8) {this.errors.push("Password must be at least 8 characters.")}
    if (this.data.password.length > 30) {this.errors.push("Password cannot exceed 30 characters.")}
    if (this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push("Username must be at least 3 characters.")}
    if (this.data.username.length > 30) {this.errors.push("Username cannot exceed 30 characters.")}
    if (this.data.username == "") {this.errors.push("You must provide a contact number.")}
    if (this.data.phone.length > 0 && this.data.phone.length < 10) {this.errors.push("Invalid contact number.")}
    if (this.data.phone.length > 10) {this.errors.push("Invalid contact number.")}
  
    // Only if username is valid then check to see if it's already taken
    if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
      let usernameExists = await teachersCollection.findOne({username: this.data.username})
      if (usernameExists) {this.errors.push("That username is already taken.")}
    }
  
    // Only if email is valid then check to see if it's already taken
    if (validator.isEmail(this.data.email)) {
      let emailExists = await teachersCollection.findOne({email: this.data.email})
      if (emailExists) {this.errors.push("That email is already being used.")}
    }
    resolve()
  })
}

Teacher.prototype.login = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    teachersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
      if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
        resolve()
      } else {
        reject("Invalid username / password.")
      }
    }).catch(function() {
      reject("Please try again later.")
    })
  })
}

Teacher.prototype.register = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    await this.validate()
  
    // Step #2: Only if there are no validation errors 
    // then save the user data into a database
 
    if (!this.errors.length) {
   
      // hash user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await teachersCollection.insertOne(this.data)
      resolve()
    } else {
      reject(this.errors)
    }
  })
}





Teacher.findByUserName = function(username){

  return new Promise(function(resolve,reject){

    if(typeof(username) != "string"){
      reject()
      return
    }
  parentsCollection.findOne({username: username}).then(function(userDoc){
    if(userDoc){
     
      userDoc = new Teacher(userDoc, true)
      userDoc ={
        _id: userDoc.data._id,
        username: userDoc.data.username,
        file: userDoc.data.file,
        type: userDoc.data.type,
        phone: userDoc.data.phone,
        gender: userDoc.data.gender,
        address: userDoc.data.address,
        city: userDoc.data.city,
        overview: userDoc.data.overview,
        firstname: userDoc.data.firstname,
        lastname: userDoc.data.lastname,
        classes: userDoc.data.classes,
        subjects: userDoc.data.subjects,
        salary: userDoc.data.salary,
        medium: userDoc.data.medium,    
      }

      resolve(userDoc)

    }else{

      reject()

    }

  }).catch(function(){
    reject()
  })
  })
}


module.exports = Teacher

