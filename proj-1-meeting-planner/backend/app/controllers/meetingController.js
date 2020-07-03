const mongoose = require('mongoose');
const shortId = require('shortid');
const time = require('../libs/timeLib');
const check = require('../libs/checkLib');
const logger = require('../libs/loggerLib');
const response = require('../libs/responseLib');
const mail = require('../libs/mailLib');
let schedule = require('node-schedule');
let jobs = [];

const MeetingModel = mongoose.model('Meeting');

let getAllMeetingsbyUser = (req, res) => {
    MeetingModel.find({ userId: req.params.userId }).select('-__v -_id').lean().exec((error, result) => {
        if (error) {
            logger.error(error.message, "meetingController.getAllMeetingsbyUser()", 10);
            let apiResponse = response.generate(true, "Failed to load all meetings", 500, null);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(false, "Meetings fetched", 200, result);
            res.send(apiResponse);
        }
    });
}

let createMeetingAndNotify = (req, res) => {
    let createMeeting = () => {
        return new Promise((resolve, reject) => {
            let newMeeting = new MeetingModel({
                meetingId: shortId.generate(),
                userId: req.body.userId,
                adminName: req.body.adminName,
                emailAddress: req.body.emailAddress,
                title: req.body.title,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                location: req.body.location,
                description: req.body.description,
                createdOn: time.now()
            });
            newMeeting.save((error, newMeeting) => {
                if (error) {
                    logger.error(error.message, "meetingController.createMeeting()", 10);
                    let apiResponse = response.generate(true, "Failed to create new meeting", 500, null);
                    reject(apiResponse);
                }
                else {
                    let newMeetingObj = newMeeting.toObject();
                    let mailOptions = {
                        from: '"Meeting Manager" <meetingmanager@email.com>',
                        to: newMeetingObj.emailAddress,
                        subject: newMeetingObj.title,
                        text: `A new meeting has been scheduled from ${formatDate(newMeetingObj.startDate)} to ${formatDate(newMeetingObj.endDate)} by ${newMeetingObj.adminName}`,
                        html: `A new meeting has been scheduled from <b>${formatDate(newMeetingObj.startDate)}</b> to <b>${formatDate(newMeetingObj.endDate)}</b> by ${newMeetingObj.adminName}`,
                    }
                    resolve(mailOptions);
                }
            });
        });
    }
    createMeeting(req, res).then(mail.sendMail).then(() => {
        let apiResponse = response.generate(false, "Meeting created and email sent sucessfully", 200, null);
        res.send(apiResponse);
    }).catch((error) => {
        res.send(error);
    });
}

let updateMeetingAndNotify = (req, res) => {
    let updateMeetingDetails = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.meetingId)) {
                let apiResponse = response.generate(true, "meetingId parameter is missing", 403, null)
                reject(apiResponse)
            } else {
                let options = req.body;
                MeetingModel.updateOne({ meetingId: req.params.meetingId }, options, { multi: true }).exec((error, result) => {
                    if (error) {
                        logger.error(error.message, "meetingController.updateMeetingDetails()", 10)
                        let apiResponse = response.generate(true, 'Error occured.', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info("No meeting found", "meetingController.updateMeetingDetails()");
                        let apiResponse = response.generate(true, "No meeting found", 404, null)
                        reject(apiResponse)
                    } else {
                        let mailOptions = {
                            from: '"Meeting Manager" <meetingmanager@email.com>',
                            to: options.emailAddress,
                            subject: options.title,
                            text: `Your meeting has been updated by ${req.body.adminName}`,
                            html: `Your meeting has been updated by ${req.body.adminName}`,
                        }
                        resolve(mailOptions);
                    }
                });
            }
        })
    }


    updateMeetingDetails(req, res).then(mail.sendMail).then(() => {
        let apiResponse = response.generate(false, "Meeting updated and email sent sucessfully", 200, null);
        res.send(apiResponse);
    }).catch((error) => {
        res.send(error);
    });
}


let deleteMeetingAndNotify = (req, res) => {
    let deleteMeeting = () => {
        return new Promise((resolve, reject) => {
            MeetingModel.findOneAndRemove({ meetingId: req.body.meetingId }).exec((error, result) => {
                if (error) {
                    logger.error(error.message, "meetingController.deleteMeeting()", 10);
                    let apiResponse = response.generate(true, `Error occured: ${error.message}`, 500, null);
                    reject(apiResponse);
                } else if (check.isEmpty(result)) {
                    logger.info("No meeting found", "meetingController.deleteMeeting()");
                    let apiResponse = response.generate(true, "No meeting found", 404, null); //why 404
                    reject(apiResponse);
                } else {
                    let mailOptions = {
                        from: '"Meeting Manager" <meetingmanager@email.com>',
                        to: result.emailAddress,
                        subject: result.title,
                        text: `Your meeting has been cancelled by ${req.body.adminName}`,
                        html: `Your meeting has been cancelled by ${req.body.adminName}`,
                    }
                    resolve(mailOptions);
                }
            });
        });
    }

    deleteMeeting(req, res).then(mail.sendMail).then(() => {
        let apiResponse = response.generate(false, "Meeting cancelled and email sent sucessfully", 200, null);
        res.send(apiResponse);
    }).catch((error) => {
        res.send(error);
    });
}

let setSchedule = (req, res) => {

    let getAllUserMeetings = () => {
        return new Promise((resolve, reject) => {
            MeetingModel.find({}, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    let scheduleToAllUsers = (data) => {
        let schedularData = [];
        schedularData = data.map((e) => ({ date: e.startDate, mailId: e.emailAddress, title: e.title }));
        jobs.forEach((x) => {
            if (x) x.cancel()
        });
        schedularData.forEach((e, i) => {
            let mailOptions = {
                from: '"Meeting Manager" <meetingmanager@email.com>',
                to: e.mailId,
                subject: e.title,
                text: `Reminder: Your meeting will be starting by ${formatDate(e.date, true)}`,
                html: `<b>Reminder:</b> Your meeting will be starting by ${formatDate(e.date, true)}`
            }
            if (e.mailId) {
                jobs[i] = schedule.scheduleJob(getOneMinuteBeforeCurrent(e.date), function () {
                    mail.sendMail(mailOptions).then().catch((error) => res.send(error));
                });
            }
        })
    }

    getAllUserMeetings().then(scheduleToAllUsers).then(() => {
        let apiResponse = response.generate(false, "Reminder sent successfully", 200, null);
        res.send(apiResponse);
    }).catch((error) => {
        res.send(error);
    });
}

function getOneMinuteBeforeCurrent(date) {
    let dateFormat = new Date(date);
    dateFormat.setMinutes(dateFormat.getMinutes() - 1)
    return new Date(dateFormat);
}

function formatDate(date, onlyTime = false) {
    let dateFormat = new Date(date);
    let hours = dateFormat.getHours();
    let minutes = dateFormat.getMinutes();
    let monthDate = dateFormat.getDate();
    let amPm = hours >= 12 ? 'PM' : 'AM';
    let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    hours = hours % 12;
    hours = hours ? hours : 12;
    let stringDate = monthDate < 10 ? `0${monthDate}` : monthDate;
    let stringMinutes = minutes < 10 ? `0${minutes}` : minutes;
    let stringTime = `${hours}:${stringMinutes} ${amPm}`;
    if (onlyTime) return stringTime;
    return `${monthNames[dateFormat.getMonth()]} ${stringDate} ${dateFormat.getFullYear()}  ${stringTime}`;
}

module.exports = {
    getAllMeetingsbyUser: getAllMeetingsbyUser,
    createMeetingAndNotify: createMeetingAndNotify,
    updateMeetingAndNotify: updateMeetingAndNotify,
    deleteMeetingAndNotify: deleteMeetingAndNotify,
    setSchedule: setSchedule
}