var aws     = require('aws-sdk');

const dpbutil = require('../../server/db/dpbutils.js');

// Load your AWS credentials and try to instantiate the object.
const configDirectory = '/home/daniel/Projects/partake/server/config'
console.log('>>>>> ' + configDirectory);
aws.config.loadFromPath(configDirectory + '/awsconfig.json');
var ses = new aws.SES();  // Instantiate SES.

// Get file name to use with dpbutil logging
const filename = dpbutil.pluckFilename(__filename, __dirname);

/* ===================================================================================== */
/* SEND MAIL SERVICE                                                                     */
/* ===================================================================================== */

// SendEmail service sends a mail to user's email using inline HTML mail template
// Inputs: is a params Object that current can set from/to address, and pass in
// urls that may be need as part of email.


function sendMailWithBodyInline(params) {
    var self = this;
    var from = params.from;
    var to   = params.to;
    var resetPasswordUrl = params.urls.resetPasswordUrl;
    var subject = 'Reset Password - from "Pitch-In" Club';
    var bodyText = '';  /* body text is empty */
    var bodyHtml = '';

    var promise = new Promise(function resolver(resolve, reject) {
          // Save HTML to be sent in email in the bodyHtml variable
          self.bodyHtml = '<!DOCTYPE HTML> \n';
          bodyHtml += '<html lang="en"> \n';
          bodyHtml += '<head> \n';
          bodyHtml += '   <title>Pitch-In Club</title> \n';
          bodyHtml += '   <meta charset="UTF-8" /> \n';
          bodyHtml += '   <style> \n';
          bodyHtml += '      * { box-sizing: border-box;  } \n';
          bodyHtml += '      header { \n';
          bodyHtml += '         background-color: grey; \n';
          bodyHtml += '         text-align: center; \n';
          bodyHtml += '         font-size: 20px; \n';
          bodyHtml += '         padding: 2px; \n';
          bodyHtml += '      } \n';
          bodyHtml += '      p, h1 {  text-align: center; } \n';
          bodyHtml += '      section {padding: 30px; text-align: center;} \n';
          bodyHtml += '      footer { \n';
          bodyHtml += '          background-color: grey; \n';
          bodyHtml += '          padding: 5px; \n';
          bodyHtml += '      } \n';
          bodyHtml += '   </style> \n';
          bodyHtml += '</head> \n';
          bodyHtml += '<body> \n';
          bodyHtml += '		<header> <h2>"Pitch In" Club</h2> </header> \n';
          bodyHtml += '    <section> \n';
          bodyHtml += '      <h1>Reset Password Request</h1> \n';
          bodyHtml += '			 <p>You have elected  to reset your password. Please click link below to reset password.</p> \n';
          bodyHtml += `      <a href=${resetPasswordUrl}>RESET PASSWORD<a> \n`;
          bodyHtml += '  	</section> \n';
          bodyHtml += '	  <footer> 	<p>Copyright 2018 PitchInClub</p>	</footer> \n';
          bodyHtml += '</body> \n';
          bodyHtml += '</html> ';

          //Construct params object
          var params = {
           Source: from,
           Destination: { ToAddresses: to },
           Message: {
             Subject: {
               Data: subject
             },
             Body: {
               Html: {
                    Data: bodyHtml
               },
               Text: {
                 Data:   bodyText
               }
             }
           }
          }

          // Call send email
          ses.sendEmail(params, function(err, data) {
          if (err) {
            dpbutil.logerror(filename, err); // an error occurred
            reject({errmsg: err});
          } else {
            dpbutil.loginfo(filename, `(email: ${to}) ${JSON.stringify(data,null,2)} `);  // successful response
            resolve({message: `Email Sent Successfully for ${to}`});
          }
          });
    });  // End of Promise
    return promise;
};

module.exports = {
  sendMailWithBodyInline
}
