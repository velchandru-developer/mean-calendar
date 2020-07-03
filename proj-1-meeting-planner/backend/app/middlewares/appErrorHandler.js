const response = require('./../libs/responseLib')


let errorHandler = (err,req, res, next) => {

    let apiResponse = response.generate(true, 'Some error occured at global level',500, null)
    res.send(apiResponse)   
}

let notFoundHandler = (req,res,next)=>{

    let apiResponse = response.generate(true, 'Route not found in the application',404, null)
    res.status(404).send(apiResponse)

}

module.exports = {
    globalErrorHandler : errorHandler,
    globalNotFoundHandler : notFoundHandler
}
