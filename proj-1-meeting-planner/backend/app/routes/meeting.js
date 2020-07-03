const appConfig = require('../../config/appConfig');
const meetingController = require('../controllers/meetingController');
const auth = require('../middlewares/auth');

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}/meeting`;

    app.get(`${baseUrl}/:userId/view/all`, meetingController.getAllMeetingsbyUser);
    /**
      * @apiGroup Meeting
      * @apiVersion  1.0.0
      * @api {get} /api/v1/meeting/:userId/view/all Fetching all Meetings by User Id
      *
      * @apiParam {string} userId User Id of the user. (query params) (required)
      *
      * @apiSuccess {json} apiResponse Error, Message, Status, Data
      * 
      * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Meetings fetched",
            "status": 200,
            "data": [
                {
                    "meetingId": "GyRoh4v54",
                    "userId": "WARmEKY1b",
                    "emailAddress": "photosaver.x1@gmail.com",
                    "adminName": "velchandru-admin",
                    "title": "Meeting by Vel",
                    "startDate": "2020-07-02T01:56:30.000Z",
                    "endDate": "2020-07-02T02:56:34.000Z",
                    "location": "New place",
                    "description": "Something new!!",
                    "createdOn": "2020-07-01T19:56:48.000Z"
                }
            ]
        }    
     */

    app.post(`${baseUrl}/create`, auth.isAuthorized, meetingController.createMeetingAndNotify);
   /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/meeting/create Creating a New Meeting
     *
     * @apiParam {string} userId User Id of the user. (body params) (required)
     * @apiParam {string} adminName Name of the Admin. (body params) (required)
     * @apiParam {string} emailAddress Email Address of the user. (body params) (required)
     * @apiParam {string} title Title of the meeting. (body params) (required)
     * @apiParam {string} startDate Start Date of the meeting. (body params) (required)
     * @apiParam {string} endDate End Date of the meeting. (body params) (required)
     * @apiParam {string} location Location of the meeting. (body params) (optional)
     * @apiParam {number} description Descripiton of the meeting. (body params) (optional)
     * @apiParam {string} authToken Authorization Token of the user. (query/body/header params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Meeting created and email sent sucessfully",
            "status": 200,
            "data": null
        }
    */

    app.put(`${baseUrl}/:meetingId/update`, auth.isAuthorized, meetingController.updateMeetingAndNotify);
   /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {put} /api/v1/meeting/:meetingId/update Updating a Meeting
     *
     * @apiParam {string} meetingId Meeting Id of the user. (query params) (required)
     * @apiParam {string} adminName Name of the Admin. (body params) (required)
     * @apiParam {string} emailAddress Email Address of the user. (body params) (optional)
     * @apiParam {string} title Title of the meeting. (body params) (optional)
     * @apiParam {string} startDate Start Date of the meeting. (body params) (optional)
     * @apiParam {string} endDate End Date of the meeting. (body params) (optional)
     * @apiParam {string} location Location of the meeting. (body params) (optional)
     * @apiParam {number} description Descripiton of the meeting. (body params) (optional)
     * @apiParam {string} authToken Authorization Token of the user. (query/body/header params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Meeting updated and email sent sucessfully",
            "status": 200,
            "data": null
        }
    */

    app.post(`${baseUrl}/delete`, auth.isAuthorized, meetingController.deleteMeetingAndNotify);
   /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/meeting/delete Cancelling a Meeting
     *
     * @apiParam {string} meetingId Meeting Id of the user. (body params) (required)
     * @apiParam {string} adminName Name of the admin. (body params) (required)
     * @apiParam {string} authToken Authorization Token of the user. (query/body/header params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Meeting cancelled and email sent sucessfully",
            "status": 200,
            "data": null
        }
    */

    app.get(`${baseUrl}/calendar`, auth.isAuthorized, meetingController.setSchedule);
   /**
     * @apiGroup Meeting
     * @apiVersion  1.0.0
     * @api {get} /api/v1/meeting/calendar Reminding Users about the Meeting
     *
     * @apiParam {string} authToken Authorization Token of the user. (query/body/header params) (required)
     *
     * @apiSuccess {json} apiResponse Error, Message, Status, Data
     * 
     * @apiSuccessExample {json} Success:
        {
            "error": false,
            "message": "Reminder sent successfully",
            "status": 200,
            "data": null
        }
    */

}