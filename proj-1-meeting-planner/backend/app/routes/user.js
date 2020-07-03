const appConfig = require('../../config/appConfig');
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}/users`;

    app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllNormalUsers);
   /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {get} /api/v1/users/view/all?authToken=:authToken Getting All Normal Users
     *
     * @apiParam {string} authToken Authorization Token of the user. (query/body/header params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "All user details found",
            "status": 200,
            "data": [
                {
                    "userId": "WARmEKY1b",
                    "firstName": "Photo",
                    "lastName": "Save",
                    "isAdmin": false,
                    "userName": "photosaver.x1",
                    "emailAddress": "photosaver.x1@gmail.com",
                    "password": "$2b$10$d/.hinNpDoWXmvMoxAM.aOEkMo5tLXhuU5KNoRLE.rdYfpdRvAD4m",
                    "countryCode": "1",
                    "mobileNumber": 1490930503,
                    "createdOn": "2020-06-23T10:16:26.000Z"
                },
                {
                    "userId": "tWhDWAt47",
                    "firstName": "Some",
                    "lastName": "User",
                    "isAdmin": false,
                    "userName": "someuser",
                    "emailAddress": "someuser@email.com",
                    "password": "$2b$10$f2K2YPZOqHHFeS1JecZEDOSyoM.vWNZmQB3loOL29DgrtRLQpPMU2",
                    "countryCode": "246",
                    "mobileNumber": 12423543446,
                    "createdOn": "2020-06-23T11:21:50.000Z"
                }
            ]
        }    
    */

    app.post(`${baseUrl}/signup`, userController.signUp);
   /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/signup Registering User
     *
     * @apiParam {string} firstName First Name of the user. (body params) (required)
     * @apiParam {string} lastName Last Name of the user. (body params) (required)
     * @apiParam {boolean} isAdmin Boolean(true/false) true->if user is Admin and false->if user is not Admin. (body params) (required)
     * @apiParam {string} userName Username of the user. (body params) (required)
     * @apiParam {string} emailAddress Email Address of the user. (body params) (required)
     * @apiParam {string} password Password of the user. (body params) (required)
     * @apiParam {string} countryCode Country Code for the Mobile Number of the user. (body params) (required)
     * @apiParam {number} mobileNumber Mobile Number of the user. (body params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "User created",
            "status": 200,
            "data": {
                "userId": "htq1F5Vz-",
                "firstName": "Velchandru",
                "lastName": "Muthukumar",
                "isAdmin": true,
                "userName": "velchandru-admin",
                "emailAddress": "velchandrum@gmail.com",
                "countryCode": "+91",
                "mobileNumber": 9597023918,
                "createdOn": "2020-07-02T16:40:30.000Z",
                "_id": "5efe0dfec5f64ab64c5371c1",
                "__v": 0
            }
        }
    */

    app.post(`${baseUrl}/login`, userController.logIn);
   /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login Logging in User
     *
     * @apiParam {string} emailAddress Email Address of the user. (body params) (required)
     * @apiParam {string} password Password of the user. (body params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Login sucessful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IkJCVkgxQmFkVyIsImlhdCI6MTU5MzcxMzg1OTc1MywiZXhwIjoxNTkzODAwMjU5LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJlZENoYXQiLCJkYXRhIjp7InVzZXJJZCI6Imh0cTFGNVZ6LSIsImZpcnN0TmFtZSI6IlZlbGNoYW5kcnUiLCJsYXN0TmFtZSI6Ik11dGh1a3VtYXIiLCJpc0FkbWluIjp0cnVlLCJ1c2VyTmFtZSI6InZlbGNoYW5kcnUtYWRtaW4iLCJlbWFpbEFkZHJlc3MiOiJ2ZWxjaGFuZHJ1bUBnbWFpbC5jb20iLCJjb3VudHJ5Q29kZSI6Iis5MSIsIm1vYmlsZU51bWJlciI6OTU5NzAyMzkxOH19.ZdLmvTz5QCDU69IQN0Y1mVcnTMzrWKku5zaFvDz0u_4",
                "userDetails": {
                    "userId": "htq1F5Vz-",
                    "firstName": "Velchandru",
                    "lastName": "Muthukumar",
                    "isAdmin": true,
                    "userName": "velchandru-admin",
                    "emailAddress": "velchandrum@gmail.com",
                    "countryCode": "+91",
                    "mobileNumber": 9597023918
                }
            }
        }    
    */

    app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logOut);
   /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/logout Logging out User
     *
     * @apiParam {string} userId User Id of the user. (query params) (required)
     * @apiParam {string} authToken Authorization Token of the user. (query/body/header params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Logged out successfully",
            "status": 200,
            "data": null
        }
    */

    app.post(`${baseUrl}/forgotpassword`, userController.sendMail);
   /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/forgotpassword Sending mail when User forgots the password
     *
     * @apiParam emailAddress Email Address of the user. (body params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Message sent sucessfully",
            "status": 200,
            "data": null
        }
    */

    app.post(`${baseUrl}/verifycode`, userController.verifyCode);
   /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/verifycode Sending the code received from mail to verify
     *
     * @apiParam emailAddress Email Address of the user. (body params) (required)
     * @apiParam verifyingCode Verifying Code sent from mail. (body params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Verified successfully",
            "status": 200,
            "data": null
        }
    */
        
    app.post(`${baseUrl}/updatepassword`, userController.findEmailAndUpdatePassword);
    /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/updatepassword Updating the new password
     *
     * @apiParam emailAddress Email Address of the user. (body params) (required)
     * @apiParam password Password of the user. (body params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Password successfully changed",
            "status": 200,
            "data": null
        }
    */  
}