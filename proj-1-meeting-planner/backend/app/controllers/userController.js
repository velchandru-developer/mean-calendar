const mongoose = require('mongoose');
const shortId = require('shortid');
const time = require('../libs/timeLib');
const check = require('../libs/checkLib');
const passwordLib = require('../libs/generatePasswordLib');
const logger = require('../libs/loggerLib');
const response = require('../libs/responseLib');
const validateParams = require('../libs/paramsValidationLib');
const token = require('../libs/tokenLib');
const mail = require('../libs/mailLib');
let verifyDetails = {};

const UserModel = mongoose.model('User');
const AuthModel = mongoose.model('Authorize');

let getAllNormalUsers = (req, res) => {
    UserModel.find({ isAdmin: false }).select('-__v -_id').lean().exec((error, result) => {
        if (error) {
            logger.error(error.message, "userController.getAllNormalUsers()", 10);
            let apiResponse = response.generate(true, "Failed to load user(s)", 500, null);
            res.send(apiResponse);
        } else if (check.isEmpty(result)) {
            logger.info("No user(s) found", "userController.getAllNormalUsers()");
            let apiResponse = response.generate(true, "No user(s) found", 404, null);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(false, "All user details found", 200, result);
            res.send(apiResponse);
        }
    })
}

let signUp = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.emailAddress) {
                if (!validateParams.Email(req.body.emailAddress)) {
                    let apiResponse = response.generate(true, "Email address does not meet the requirements", 400, null);
                    reject(apiResponse);
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, "password parameter is missing", 400, null);
                    reject(apiResponse);
                } else if (check.isEmpty(req.body.userName)) {
                    let apiResponse = response.generate(true, "userName paramaeter is missing", 400, null);
                    reject(apiResponse);
                } else resolve(req);
            } else {
                logger.error("Email Address is not provided", "userController.validateUserInput()", 5);
                let apiResponse = response.generate(true, "emailAddress parameter is missing", 500, null);
                reject(apiResponse);
            }
        });
    }

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ emailAddress: req.body.emailAddress }).exec((error, userDetails) => {
                if (error) {
                    logger.error(error.message, "userController.createUser()", 10);
                    let apiResponse = response.generate(true, "Failed to create user", 500, null);
                    reject(apiResponse);
                } else if (check.isEmpty(userDetails)) {
                    let userName = req.body.userName;
                    if (req.body.isAdmin == "true") userName = userName + "-admin";
                    let newUser = new UserModel({
                        userId: shortId.generate(),
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        isAdmin: req.body.isAdmin,
                        userName: userName,
                        emailAddress: req.body.emailAddress,
                        password: passwordLib.hashpassword(req.body.password),
                        countryCode: req.body.countryCode,
                        mobileNumber: req.body.mobileNumber,
                        createdOn: time.now()
                    });
                    newUser.save((error, newUser) => {
                        if (error) {
                            logger.error(error.message, "userController.createUser", 10);
                            let apiResponse = response.generate(true, "Failed to create new user", 500, null);
                            reject(apiResponse);
                        }
                        else {
                            let newUserObj = newUser.toObject();
                            resolve(newUserObj);
                        }
                    });
                } else {
                    logger.error("User already exists and cannot be created", "userController.createUser()", 4); //need to check why 4 and 403
                    let apiResponse = response.generate(true, "User already exists with the same email address", 403, null);
                    reject(apiResponse);
                }
            });
        });
    }

    validateUserInput(req, res).then(createUser).then((resolve) => {
        delete resolve.password;
        let apiResponse = response.generate(false, "User created", 200, resolve);
        res.send(apiResponse);
    }).catch((error) => {
        res.send(error);
    });
}

let logIn = (req, res) => {

    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.emailAddress) {
                UserModel.findOne({ emailAddress: req.body.emailAddress }, (error, userDetails) => {
                    if (error) {
                        logger.error("Failed to retrieve user details", "userController.findUser()", 10);
                        let apiResponse = response.generate(true, "Failed to retrieve user details", 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(userDetails)) {
                        logger.error("No user found", "userController.findUser()", 7);
                        let apiResponse = response.generate(true, "No user details found", 404, null);
                        reject(apiResponse);
                    } else {
                        logger.info("User found", "userController.findUser()", 10);
                        resolve(userDetails);
                    }
                });
            } else {
                let apiResponse = response.generate(true, "emailAddress parameter is missing", 400, null);
                reject(apiResponse);
            }
        });
    }

    let validatePassword = (userDetails) => {
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, userDetails.password, (error, isMatch) => {
                if (error) {
                    logger.error(error.message, "userController.validatePassword()", 10);
                    let apiResponse = response.generate(true, "Login failed", 500, null);
                    reject(apiResponse);
                } else if (isMatch) {
                    let userDetailsObj = userDetails.toObject();
                    delete userDetailsObj.password;
                    delete userDetailsObj._id;
                    delete userDetailsObj.__v;
                    delete userDetailsObj.createdOn;
                    resolve(userDetailsObj);
                } else {
                    logger.info("Login failed due to invalid password", "userController.validatePassword()", 10);
                    let apiResponse = response.generate(true, "Login failed due to invalid password", 400, null);
                    reject(apiResponse);
                }
            });
        });
    }

    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (error, tokenDetails) => {
                if (error) {
                    let apiResponse = response.generate(true, "Failed to generate token", 500, null);
                    reject(apiResponse);
                } else {
                    tokenDetails.userId = userDetails.userId;
                    tokenDetails.userDetails = userDetails;
                    resolve(tokenDetails);
                }
            });
        });
    }

    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (error, userDetails) => {
                if (error) {
                    logger.error(error.message, "userController.saveToken()", 10);
                    let apiResponse = response.generate(true, "Error while fetching token", 500, null);
                    reject(apiResponse)
                } else if (check.isEmpty(userDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    });
                    newAuthToken.save((error, newTokenDetails) => {
                        if (error) {
                            logger.error(error.message, "userController.saveToken()", 10);
                            let apiResponse = response.generate(true, "Error while saving new token", 500, null);
                            reject(apiResponse);
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody);
                        }
                    });
                } else {
                    userDetails.authToken = tokenDetails.authToken;
                    userDetails.tokenSecret = tokenDetails.tokenSecret;
                    userDetails.tokenGenerationTime = time.now();
                    userDetails.save((error, newTokenDetails) => {
                        if (error) {
                            logger.error(error.message, "userController.saveToken()", 10);
                            let apiResponse = response.generate(true, "Error while saving updated token", 500, null);
                            reject(apiResponse);
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody);
                        }
                    });
                }
            });
        });
    }

    findUser(req, res).then(validatePassword).then(generateToken).then(saveToken).then((resolve) => {
        let apiResponse = response.generate(false, "Login sucessful", 200, resolve);
        res.status(200);
        res.send(apiResponse);
    }).catch((error) => {
        res.status(error.status);
        res.send(error);
    });
}

let logOut = (req, res) => {
    AuthModel.deleteOne({ userId: req.body.userId }, (error, result) => {
        if (error) {
            logger.error(error.message, "userController.logOut()", 10);
            let apiResponse = response.generate(true, `Error occured: ${error.message}`, 500, null);
            res.send(apiResponse);
        } else if (check.isEmpty(result)) {
            logger.info("Already logged out or invalid user id", "meetingController.logOut()");
            let apiResponse = response.generate(true, "Already logged out or invalid user id", 404, null); //why 404
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(false, "Logged out successfully", 200, null);
            res.send(apiResponse);
        }
    });
}

let sendMail = (req, res) => {
    let emailAddress = req.body.emailAddress;
    let randomCode = generateCode(5);

    let mailOptions = {
        from: '"Password Manager" <chaser156@gmail.com>',
        to: emailAddress,
        subject: "Password Reset",
        text: `Please enter the code ${randomCode} to verify and reset your password`,
        html: `Please enter the code <b>${randomCode}</b> to verify and reset your password`,
    }

    function generateCode(length) {
        let result = '';
        const codes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const codesLength = codes.length;
        for (let i = 0; i < length; i++) {
            result += codes.charAt(Math.floor(Math.random() * codesLength));
        }
        return result;
    }

    mail.sendMail(mailOptions).then(() => {
        let apiResponse = response.generate(false, "Message sent sucessfully", 200, null);
        verifyDetails[emailAddress] = randomCode;
        res.send(apiResponse);
    }).catch((error) => {
        res.send(error);
    });
}

let verifyCode = (req, res) => {
    let emailAddress = req.body.emailAddress;
    let verifyingCode = req.body.verifyingCode;
    if (Object.keys(verifyDetails).includes(emailAddress) && verifyDetails[emailAddress] === verifyingCode) {
        let apiResponse = response.generate(false, "Verified successfully", 200, null);
        res.send(apiResponse);
        delete verifyingCode.emailAddress;
    } else {
        logger.info("Code doesn't match", "userController.verifyCode()");
        let apiResponse = response.generate(true, "Code doesn't match", 400, null);
        res.send(apiResponse);
    }
}

let findEmailAndUpdatePassword = (req, res) => {

    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.emailAddress) {
                UserModel.findOne({ emailAddress: req.body.emailAddress }, (error, userDetails) => {
                    if (error) {
                        logger.error("Failed to retrieve user details", "userController.findUser()", 10);
                        let apiResponse = response.generate(true, "Failed to retrieve user details", 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(userDetails)) {
                        logger.error("No user found", "userController.findUser()", 7);
                        let apiResponse = response.generate(true, "No user details found", 404, null);
                        reject(apiResponse);
                    } else {
                        logger.info("User found", "userController.findUser()", 10);
                        resolve(userDetails);
                    }
                });
            } else {
                let apiResponse = response.generate(true, "emailAddress parameter is missing", 400, null);
                reject(apiResponse);
            }
        });
    }

    let updatePassword = (userDetails) => {
        return new Promise((resolve, reject) => {
            let options = {
                password: passwordLib.hashpassword(req.body.password)
            };
            UserModel.updateOne({ userId: userDetails.userId }, options, { multi: false }).exec((error, result) => {
                if (error) {
                    logger.error(error.message, "userController.updatePassword()", 10)
                    let apiResponse = response.generate(true, 'Error occured.', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info("No user found", "userController.updatePassword()");
                    let apiResponse = response.generate(true, "No user found", 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, "Password successfully updated", 200, result)
                    resolve(apiResponse)
                }
            });
        });
    }
    findUser(req, res).then(updatePassword).then(() => {
        let apiResponse = response.generate(false, "Password successfully changed", 200, null);
        res.status(200);
        res.send(apiResponse);
    }).catch((error) => {
        res.status(error.status);
        res.send(error);
    });
}

module.exports = {
    getAllNormalUsers: getAllNormalUsers,
    signUp: signUp,
    logIn: logIn,
    logOut: logOut,
    sendMail: sendMail,
    verifyCode: verifyCode,
    findEmailAndUpdatePassword: findEmailAndUpdatePassword
}