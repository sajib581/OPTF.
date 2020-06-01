const bcrypt = require("bcryptjs")
const teachersCollection = require('../db').db().collection("teachers")
const parentsCollection = require('../db').db().collection("parents")
const ObjectID = require('mongodb').ObjectID
const validator = require("validator")



let Parent = function(data) {

  this.data = data
  this.errors = []

}




Parent.prototype.cleanUp = function() {
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
    firstname:this.data.firstname,
    lastname:this.data.lastname,
    address:this.data.address,
    city:"City Name",
    overview:"I Am A Good Parent",
    createdDate: new Date(),
    classes: this.data.classes,
    subjects: this.data.subjects,
    salary: this.data.salary,
    medium: this.data.medium,
    account: "Active"
  }
}





Parent.prototype.validate = function() {
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
      let usernameExists = await parentsCollection.findOne({username: this.data.username})
      if (usernameExists) {this.errors.push("That username is already taken.")}
    }
  
    // Only if email is valid then check to see if it's already taken
    if (validator.isEmail(this.data.email)) {
      let emailExists = await parentsCollection.findOne({email: this.data.email})
      if (emailExists) {this.errors.push("That email is already being used.")}
    }
    resolve()
  })
}

Parent.prototype.login = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    parentsCollection.findOne({username: this.data.username}).then((attemptedUser) => {
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

Parent.prototype.register = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    await this.validate()
  
    // Step #2: Only if there are no validation errors 
    // then save the user data into a database
 
    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await parentsCollection.insertOne(this.data)
      resolve()
    } else {
      reject(this.errors)
    }
  })
}





Parent.findByUserName = function(username){

  return new Promise(function(resolve,reject){

    if(typeof(username) != "string"){
      reject()
      return
    }
  teachersCollection.findOne({username: username}).then(function(userDoc){
    if(userDoc){
      userDoc = new Parent(userDoc, true)
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
        experience: userDoc.data.experience,
        educationLevel: userDoc.data.educationLevel,
        educationalBackground: userDoc.data.educationalBackground,
        instituteName: userDoc.data.instituteName,
        result: userDoc.data.result,
        passed: userDoc.data.passed,
      
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



module.exports = Parent

