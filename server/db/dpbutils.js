var   _        = require("lodash");
const moment   = require("moment");
// require("moment-timezone");

const loginfo_enabled = true;
const logmsg_enabled  = true;

/* ********************************************************************* */
/* New Logging functions                                                 */
/* ********************************************************************* */
const loginfo = (fn, info) => {
  if (loginfo_enabled) {
    var logformat = "YYYY-MM-DD hh:mm:ss SSSS";
    console.info(`Info:  ${moment().format(logformat)} - (fn:${fn}) ${info} `);
  }
}

const logerror = (fn, errortext, errorstack) =>  {
  var logformat = "YYYY-MM-DD hh:mm:ss SSSS";
  if (!errorstack) errorstack = "";
  console.error(`ERROR: ${moment().format(logformat)} (fn:${fn}) - ${errortext} ${errorstack}  `);
}


/* ********************************************************************* */
/* Logging related functions                                             */
/* ********************************************************************* */

//  used to pluck just the filename from global variables
const pluckFilename = (filename, directory) =>  {
  return filename.substring(directory.length+1, filename.length);
}

/* ********************************************************************* */
/* Date related functions                                             */
/* ********************************************************************* */

function currentDateTimestamp(dateString) {
  // return moment.utc().utcOffset(-05:00);
  if (dateString) {
    return moment(dateString).format('YYYY-MM-DDTHH:mm:ss.SSS');
  }
  return moment().format('YYYY-MM-DDTHH:mm:ss.SSS'); //.utcOffset('-05:00').format();
}


function getErrorType(err) {
  var errorType = "UncaughtException";

  if (err.message.includes('NoRecordFound')) {
     errorType =  'NoRecordFound';
     return errorType;
  }

  if (err.message.includes('AuthFailure')) {
     errorType =  'AuthFailure';
     return errorType;
  }

  if (err.message.includes('E11000')) {
    return 'DuplicateRecord';
  }

  if (err.message.includes('users validation failed')) {
     if (err.errors.email.message.includes('not a valid email')) {
         errorType =  'EmailValidationError';
     }
     return errorType;
  }

  if (err.message.includes('EmailValidationError')) {
     errorType =  'EmailValidationError';
     return errorType;
  }

  if (err.message.includes('InvalidAuthToken')) {
     errorType =  'InvalidAuthToken';
     return errorType;
  }

  return errorType;
};

function convertDateToTicks(dateString) {
  epochTicks = 621355968000000000;
  ticksPerMillesecond = 10000;
  date = new Date(dateString);
  dateInTicks =  epochTicks + (date.getTime() * ticksPerMillesecond);
  return dateInTicks;
};





/* ********************************************************************* */
/* Error Messages: takes an error message name and message extension       */
/* ********************************************************************* */
// Pass in name value pairs related to type error
// const getErrMsg = function getErrMsg(msgName, msgExt )  {
//     var errorTable = {
//         DuplicateRecord: "DuplicateRecord: Record already exist in database for " + msgExt,
//         MissingParms:    "MissingParms: Missing parameters: " + msgExt,
//         NotSingleton :   "NotSingleton: Did not get back a Singleton result as expected: " + msgExt,
//         NoRecordsFound:  "NoRecordsFound: Lookup returned no results " + msgExt,
//         SystemException:   "SystemException: system error or uncaught exception "  + msgExt,
//     }
//     return errorTable[msgName];
// }

// function DuplicateRecordError(message) {
//     this.name = "DuplicateRecordError";
//     this.message = message;
// }
// DuplicateRecordError.protype = new Error();



module.exports = {
  pluckFilename,
  loginfo,
  logerror,
  getErrorType,
  loginfo_enabled,
  convertDateToTicks,
  currentDateTimestamp
}
