'use strict';

//global variables
var https = require("https");
var process = require("process");
var querystring = require('querystring');
var OPEN_API_HOST_NAME = process.env.OPEN_API_URL;
var authToken;
var clientID = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET
var userName;
var globalSessionId;
var userProfileObj;
var workingFolder = 'Amazon Echo';
var logOutMessage = 'You have been logged out from Encompass Loan Officer Connect';

var defaultFields = [
    "Loan.LoanFolder",
    "Loan.LoanRate",
    "Fields.3",
    "Loan.LoanAmount",
    "Loan.BorrowerName",
    "Fields.4002",
    "Fields.1401",
    "Fields.762"
];

Array.prototype.hasMin = function (attrib) {
    return this.reduce(function (prev, curr) {
        return prev[attrib] < curr[attrib] ? prev : curr;
    });
}

function getTodayDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = mm + '/' + dd + '/' + yyyy;
    return today;
}

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);
    authToken = session.user.accessToken;
    validateAccessToken(callback, session, authToken);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    var lastName;
    // dispatch custom intents to handlers here
    switch (intentName) {
        case "RateLockExpIntent":
            var duration = getDurationFromIntent(intent);
            makeRateLockExpirationRequest(callback, duration);
            break;
        case "CurrentRateProgramIntent":
            lastName = getBorrowerNameFromIntent(intent, true);
            makeCurrentRateAndProgramRequest(lastName, callback);
            break;
        case "LogOutIntent":
            handleAnswerRequest(callback, logOutMessage, true);
            break;
        case "AMAZON.HelpIntent":
            handleGetHelpRequest(intent, session, callback);
            break;
        case "AMAZON.StopIntent":
            handleFinishSessionRequest(intent, session, callback);
            break;
        case "AMAZON.CancelIntent":
            handleFinishSessionRequest(intent, session, callback);
            break;
        default:
            handleAnswerRequest(callback, "I didn't get your question. Please try again", false);
            break;
    }

}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

var CARD_TITLE = "Loan Officer Connect";

function getWelcomeResponse(callback, fullName) {
    var sessionAttributes = {},
        whatDoYouLikeToKnowPrompt = " What do you like to know?",
        speechOutput = fullName + ", You are now logged into Encompass Loan Officer Connect. " + whatDoYouLikeToKnowPrompt,
        shouldEndSession = false;
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, null, shouldEndSession));
}

function getErrorResponse(callback, error) {
    var sessionAttributes = {};

    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, error.message, null, true));
}


function handleAnswerRequest(callback, speechOutput, shouldEndSession) {
    var sessionAttributes = {};
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, "What else would you like to know?", shouldEndSession));

}


function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the game is played. Then, continue the game
    // if there is one in progress, or provide the option to start another one.

    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    // Set a flag to track that we're in the Help state.
    session.attributes.userPromptedToContinue = true;

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = "You can ask about Rate Lock Expirations for this week, current rate and program for the loan and find the elligible product pricing program for a particular loan";

    var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, "What else would you like to know?", shouldEndSession));

}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}


// ------- Helper functions to build responses -------
function validateAccessToken(callback, session, authToken) {
    var postData = querystring.stringify({
        client_id: clientID,
        client_secret: clientSecret,
        token: authToken
    });
    var tokenDetails = '';
    var options = {
        hostname: OPEN_API_HOST_NAME,
        path: '/oauth2/v1/token/introspection',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    var req = https.request(options, function (res) {
        if (res.statusCode != 200) {
            console.log('Invalid or Expired Access Token');
            //getErrorResponse(callback, new Error('Invalid or Expired Access Token'));
            callback(session.attributes,
                showAccountLinkingCard(CARD_TITLE, "Access Token Expired. Please go to your Alexa app and link your account.", "", true));

        }
        res.on('data', function (chunk) {
            tokenDetails += chunk;

        });
        res.on('end', function () {
            var tokenObj = JSON.parse(tokenDetails);
            globalSessionId = tokenObj.bearer_token;
            userName = tokenObj.user_name;
            makeUserProfileRequest(callback);
        });

    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        getErrorResponse(callback, new Error('problem with request: ' + e.message));
    });
    // write data to request body
    req.write(postData);
    req.end();

}

//function to get the user profile details
function makeUserProfileRequest(callback) {
    var userProfile = '';
    var options = {
        hostname: OPEN_API_HOST_NAME,
        path: '/encompass/v1/users/' + userName,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + authToken
        }
    };
    var req = https.request(options, function (res) {
        if (res.statusCode != 200) {
            console.log('Non 200 Response');
            getErrorResponse(callback, new Error('Non 200 Response'));
        }

        res.on('data', function (chunk) {
            userProfile += chunk;

        });
        res.on('end', function () {
            userProfileObj = JSON.parse(userProfile);
            //getErrorResponse(callback, new Error(userProfileObj.toString()));
            if (userProfileObj != undefined) {
                workingFolder = userProfileObj.workingFolder;
                getWelcomeResponse(callback, userProfileObj.fullName);
            }
        });

    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);

    });
    req.end();

}
//End

//Function to get Rate Lock Expirations
function makeRateLockExpirationRequest(callback, duration) {
   var precision = "day";
   var durationStr = "today";
    if (duration == 'CurrentMonth')
    {
        durationStr = "for this month";
        precision = "month";
    }
    else if (duration == 'Today')
    {
        durationStr = "today";
        precision = "day";
    }
    var last7DaysRateLockExpPayload = {
        'Fields': defaultFields,
        'Filter': {

            "terms": [
                {
                    "canonicalName": "Loan.LoanFolder",
                    "value": workingFolder,
                    "matchType": "exact"
                },
                {
                    "operator": "and",
                    "terms": [
                        {
                            "canonicalName": "Fields.762",
                            "value": getTodayDate,
                            "matchType": "equals",
                            "precision": precision
                        }
                    ]
                }
            ]
        }
    }
   
    var pipelineData = '';
     var options = {
        hostname: OPEN_API_HOST_NAME,
        path: '/encompass/v1/loanPipeline?limit=5',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + authToken
        }
    };
    var req = https.request(options, function (res) {

        if (res.statusCode != 200) {
            console.log('Non 200 Response');
            getErrorResponse(callback, new Error('Non 201 Response'));
        }
        res.on('data', function (chunk) {
            pipelineData += chunk;

        });
        res.on('end', function () {
            var speechOutput = "";
            var loanObj = JSON.parse(pipelineData);
            var loanCount = loanObj.length > 5 ? 5 : loanObj.length;
            if (loanCount > 0) {
                for (var i = 0; i < loanCount; i++) {
                    if (i == 0)
                        speechOutput += loanObj[i].fields["Fields.4002"];
                    else {
                        if (i == (loanCount - 1))
                            speechOutput += ", and " + loanObj[i].fields["Fields.4002"] + " ";
                        else
                            speechOutput += "," + loanObj[0].fields["Fields.4002"] + " ";
                    }
                }

                speechOutput = "The " + speechOutput + " loans have Rate Lock Expirations " + durationStr;
                handleAnswerRequest(callback, speechOutput, false);
            }
            else {
                getErrorResponse(callback, new Error('There are no loans which has rate expirations ' + durationStr));
            }
        });

    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        getErrorResponse(callback, new Error('problem with request: ' + e.message));
    });
    //last7DaysRateLockExpPayload.LoanFolder = workingFolder;
    // write data to request body
    req.write(JSON.stringify(last7DaysRateLockExpPayload));
    req.end();
}
//End

//Function to get the current rate and program
function makeCurrentRateAndProgramRequest(borrowerLastName, callback) {
    var borrowNameSearchPayload = {
        'Fields': defaultFields,
        'Filter': {
            "terms": [
                {
                    "canonicalName": "Loan.LoanFolder",
                    "value": workingFolder,
                    "matchType": "exact"
                },
                {
                    "operator": "and",
                    "terms": [
                        {
                            "canonicalName": "Fields.4002",
                            "matchType": "exact",
                            "value": borrowerLastName
                        }
                    ]
                }
            ]
        }

    }
    var pipelineData = '';
    var options = {
        hostname: OPEN_API_HOST_NAME,
        path: '/encompass/v1/loanPipeline?limit=1',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + authToken
        }
    };
    var req = https.request(options, function (res) {

        if (res.statusCode != 200) {
            console.log('Non 200 Response');
            getErrorResponse(callback, new Error('Non 201 Response'));
        }
        res.on('data', function (chunk) {
            pipelineData += chunk;

        });
        res.on('end', function () {
            var speechOutput = "”";
            var currentRate;
            var currentProgram;
            var loanObj = JSON.parse(pipelineData);
            if (loanObj.length > 0) {
                currentProgram = loanObj[0].fields["Fields.1401"];
                currentRate = loanObj[0].fields["Fields.3"];;
                speechOutput = "The " + borrowerLastName + " loan has a " + currentProgram + " with an " + Number(currentRate) + "% APR";
                handleAnswerRequest(callback, speechOutput, false);
            }
            else {
                getErrorResponse(callback, new Error('There are no loans with given borrower name'));
            }


        });

    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        getErrorResponse(callback, new Error('problem with request: ' + e.message));
    });
    // write data to request body
    req.write(JSON.stringify(borrowNameSearchPayload));
    req.end();
}
//End
//Helper Functions
function getBorrowerNameFromIntent(intent, assignDefault) {

    var nameSlot = intent.slots.LastName;

    if (!nameSlot || !nameSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            }
        } else {

            return 'Johnson';
        }
    } else {

        return nameSlot.value;
    }
}

function getDurationFromIntent(intent) {

    var durationSlot = intent.slots.Duration;

    if (!durationSlot || !durationSlot.value) {
        return 'CurrentWeek';
    } else {
        var duration = 'CurrentWeek';
        if (durationSlot.value.toLowerCase().indexOf('month') != -1)
            duration = 'CurrentMonth';
        else if (durationSlot.value.toLowerCase().indexOf('today') != -1)
            duration = 'Today';
        return duration;
    }
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function showAccountLinkingCard(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "LinkAccount",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
//End

