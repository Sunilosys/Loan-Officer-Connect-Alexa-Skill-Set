/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
//This is a sample Loan Officer Connect Alexa Skill Set
//global variables
var https = require("https");
var hostName, authToken, clientID, userName, password, globalSessionId, userProfileObj, workingFolder;
var logOutMessage = 'You have been logged out from Encompass Loan Officer Connect';

var authPayload = {
    UserName: userName,
    Password: password,
    Realm: clientID
}
var defaultFields = [
    { 'Name': 'Messages.MessageCount' },
    { 'Name': 'Loan.BorrowerName' },  // 4000,4001,4002,4003
    { 'Name': 'Loan.DateCreated' },
    { 'Name': 'Loan.LockStatus' },
    { 'Name': 'Loan.LastModified' },
    { 'Name': 'Fields.MS.STATUS' },  // lastFinishedMilestone
    { 'Name': 'Fields.4000' },       // BorrowerFirstName
    { 'Name': 'Fields.4001' },       // BorrowerMiddleName
    { 'Name': 'Fields.4002' },       // BorrowerLastName
    { 'Name': 'Fields.4003' },       // suffix
    { 'Name': 'Fields.11' },         // Address1
    { 'Name': 'Fields.12' },         // City
    { 'Name': 'Fields.14' },         // State
    { 'Name': 'Fields.15' },         // Zip
    { 'Name': 'Fields.16' },         // No Of Units
    { 'Name': 'Fields.3' },          // InterestRate
    { 'Name': 'Fields.1401' },       // Program
    { 'Name': 'Fields.19' },         // Purpose
    { 'Name': 'Alerts.AlertCount' },
    { 'Name': 'Fields.136' },  // Purchase Price Property Value
    { 'Name': 'Fields.763' },  // Est. Closing Date
    { 'Name': 'Fields.748' },  // Closing Date
    { 'Name': 'Loan.LockAndRequestStatus' },
    { 'Name': 'Fields.762' },  // LockExpirationDate
    { 'Name': 'Fields.432' },  // RateLockDays
    { 'Name': 'Loan.CurrentMilestoneName' },
    { 'Name': 'NextMilestone.MilestoneName' },
    { 'Name': 'CurrentLoanAssociate.FullName' },
    { 'Name': 'Fields.1855' },        // Closer
    { 'Name': 'Fields.362' },         // Processor
    { 'Name': 'Fields.REGZGFE.X8' },  // underwriter
    { 'Name': 'Fields.364' },         // LoanNumber
    { 'Name': 'Fields.2' },           // Amount
    { 'Name': 'Fields.740' },         // dti
    { 'Name': 'Fields.742' },         // dti
    { 'Name': 'Fields.353' },         // ltv
    { 'Name': 'Loan.CLTV' },         // cltv
    { 'Name': 'Fields.VASUMM.X23' },         // Credit Score
    { 'Name': 'Fields.420' },               //Lien Position
    { 'Name': 'Fields.384' },               //Loan Purpose
    { 'Name': 'Fields.1109' },               //Base Loan Amount
    { 'Name': 'Fields.736' },               //Monthly Income
    { 'Name': 'Fields.MORNET.X67' },               //Documentation Types
    { 'Name': 'Fields.1041' },               //Property Type
    { 'Name': 'Fields.1811' },               //Occupany Type
    { 'Name': 'Fields.1172' },               //Loan Type
    { 'Name': 'Fields.608' }               //Amortization Type
];

var strProductPricingRequest = `{
  "REQUEST_GROUP": {
    "@EMVPSVersionID": "1.0",
    "@xmlns": "http://www.elliemae.com/evp/msgenvelop",
    "REQUEST": {
      "KEY": [
        {
          "@_Name": "ApplicationRecordUID",
          "@_Value": "5394f9a1-25e4-485d-8b5c-8f9586b1c517"
        },
        {
          "@_Name": "SiteID",
          "@_Value": ""
        }
      ],
      "REQUEST_DATA": {
        "EMOperations": {
          "@xmlns": "http://www.elliemae.com/evp/operations",
          "EMOperation": {
            "EMMethod": "ServiceMessage",
            "EMAction": "OrderService"
          }
        },
        "params": {
          "@xmlns": "http://www.elliemae.com/evp/params",
          "param": [
            {
              "name": "ApplicationID",
              "value": "_borrower1",
              "type": "string"
            },
            {
              "name": "UIInputData",
              "value": {
                "structs": {
                  "name": "UIInputData",
                  "struct": [
                    {
                      "name": "UIInputData",
                      "member": [
                        {
                          "name": "RequestType",
                          "value": "GetPricing",
                          "type": "string"
                        },
                        {
                          "name": "RepresentativeCreditScore",
                          "value": 800,
                          "type": "string"
                        },
                        {
                          "name": "LoanType",
                          "value": {
                            "list": {
                              "name": "LoanType",
                              "values": {
                                "value": [
                                  "Conventional"
                                ]
                              }
                            }
                          },
                          "type": "list"
                        },
                        {
                          "name": "LoanDocumentationType",
                          "value": "FullDocumentation",
                          "type": "string"
                        },
                        {
                          "name": "LoanPurpose",
                          "value": "Purchase",
                          "type": "string"
                        },
                        {
                          "name": "PurposeofRefinance",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "PurchasePrice",
                          "value": 900000,
                          "type": "string"
                        },
                        {
                          "name": "EstimatedValue",
                          "value": 900000,
                          "type": "string"
                        },
                        {
                          "name": "AppraisedValue",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "LockPeriod",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "SubordinateFinancingBalance",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "BaseLoanAmount",
                          "value": 720000,
                          "type": "string"
                        },
                        {
                          "name": "MI_MIP_FF_Financed",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "TotalLoanAmount",
                          "value": 720000,
                          "type": "string"
                        },
                        {
                          "name": "LTV",
                          "value": 80,
                          "type": "string"
                        },
                        {
                          "name": "CLTV",
                          "value": 80,
                          "type": "string"
                        },
                        {
                          "name": "SubjectPropertyState",
                          "value": "CA",
                          "type": "string"
                        },
                        {
                          "name": "PostalCode",
                          "value": "95051",
                          "type": "string"
                        },
                        {
                          "name": "NumberofUnits",
                          "value": "1",
                          "type": "string"
                        },
                        {
                          "name": "PropertyType",
                          "value": "Attached",
                          "type": "string"
                        },
                        {
                          "name": "OccupancyType",
                          "value": "PrimaryResidence",
                          "type": "string"
                        },
                        {
                          "name": "TotalMonthlyIncome",
                          "value": 15000,
                          "type": "string"
                        },
                        {
                          "name": "Assets",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "AUS_Engine",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "Recommendation_LP",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "Recommendation_DU",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "ImpoundWaiver",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "SelfEmployed",
                          "value": false,
                          "type": "string"
                        },
                        {
                          "name": "PrepaymentPenalty",
                          "value": true,
                          "type": "string"
                        },
                        {
                          "name": "12moHousingPaymentHistory",
                          "value": false,
                          "type": "string"
                        },
                        {
                          "name": "InterestOnly",
                          "value": false,
                          "type": "string"
                        },
                        {
                          "name": "LOCompensationPaidBy",
                          "value": "Lender Paid",
                          "type": "string"
                        },
                        {
                          "name": "TargetPrice",
                          "value": "",
                          "type": "string"
                        },
                        {
                          "name": "TargetRate",
                          "value": 4,
                          "type": "string"
                        },
                        {
                          "name": "LienPosition",
                          "value": "FirstLien",
                          "type": "string"
                        },
                        {
                          "name": "AmortizationType",
                          "value": {
                            "list": {
                              "name": "AmortizationType",
                              "values": {
                                "value": [
                                  "Fixed",
                                  "Fixed"
                                ]
                              }
                            }
                          },
                          "type": "list"
                        },
                        {
                          "name": "LoanTerm",
                          "value": {
                            "list": {
                              "name": "LoanTerm",
                              "values": {
                                "value": [
                                  360,
                                  240
                                ]
                              }
                            }
                          },
                          "type": "list"
                        },
                        {
                          "name": "NoLoanGUID",
                          "value": true,
                          "type": "string"
                        },
                        {
                          "name": "EPPSLoanID",
                          "value": "",
                          "type": "string"
                        }
                      ]
                    }
                  ]
                }
              },
              "type": "structs"
            },
            {
              "name": "CompanySetting",
              "value": {
                "struct": {
                  "name": "CompanySetting",
                  "member": [
                    {
                      "name": "UsePredefined",
                      "value": "True",
                      "type": "string"
                    }
                  ]
                }
              },
              "type": "struct"
            },
            {
              "name": "UserSetting",
              "value": {
                "struct": {
                  "name": "UserSetting",
                  "member": [
                    {
                      "name": "UsePredefined",
                      "value": false,
                      "type": "string"
                    },
                    {
                      "name": "UserName",
                      "value": "evp_admin",
                      "type": "string"
                    },
                    {
                      "name": "Password",
                      "value": "XXXXXXX",
                      "type": "string"
                    },
                    {
                      "name": "SavePassword",
                      "value": 1,
                      "type": "string"
                    }
                  ]
                }
              },
              "type": "struct"
            }
          ]
        }
      }
    },
    "EXTENSION": {
      "MESSAGE_GROUP_EXTENSION": {
        "@xmlns": "http://www.elliemae.com/evp/extension",
        "TransactionData": {
          "ApplicationRecordUID": "5394f9a1-25e4-485d-8b5c-8f9586b1c517",
          "ClientIdentifier": "3010000024",
          "CompanyCode": "20002001",
          "ConsumerApplication": "ENC.ENCW",
          "MessageID": "411a3240-ec30-11e6-885a-294fe01cbf81",
          "UserName": "echoloanofficer",
          "VendorEnvironment": "",
          "VendorKey": "VPS.PPE.CustomEPPS",
          "ServiceMode": 1
        }
      }
    }
  }
}`

var productPricingRequestObj = JSON.parse(strProductPricingRequest);

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
    if (useScript)
        getWelcomeResponse(callback, defaultWelcomeGreetingName)
    else
        AuthenticateUser(callback);

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
            useScript ? handleAnswerRequest(callback, defaultRateLockExpirationAnswer, false) : makeRateLockExpirationRequest(callback, duration);
            break;
        case "CurrentRateProgramIntent":
            lastName = getBorrowerNameFromIntent(intent, true);
            useScript ? handleAnswerRequest(callback, defaultCurrentRateProgramAnswer, false) : makeCurrentRateAndProgramRequest(lastName, callback);
            break;
        case "FindProgramIntent":
            lastName = getBorrowerNameFromIntent(intent, true);
            useScript ? handleAnswerRequest(callback, defaultProductPricingAnswer, false) : makeGetLoanRequest(lastName, callback);
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

var CARD_TITLE = "LO Connect";

/**
 * Called when the user logins to Loan Officer Connect.
 */
function getWelcomeResponse(callback, fullName) {
    var sessionAttributes = {},
        whatDoYouLikeToKnowPrompt = " What do you like to know?",
        speechOutput = fullName + ", You are now logged into Encompass Loan Officer Connect. " + whatDoYouLikeToKnowPrompt,
        shouldEndSession = false;
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, null, shouldEndSession));
}

/**
 * Called if there is any error.
 */
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

/**
 * Called when the user invokes help intent.
 */
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

/**
 * Called to handle session end request.
 */
function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}


// ------- EBS API Call Requests -------
function AuthenticateUser(callback) {
    var options = {
        hostname: hostName,
        path: '/v2/auth/sessions',
        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        }
    };
    var req = https.request(options, function (res) {
        if (res.statusCode != 201) {
            console.log('Non 201 Response');
            getErrorResponse(callback, new Error('Non 201 Response'));
        }
        else {
            var location = JSON.parse(JSON.stringify(res.headers)).location;
            globalSessionId = location.split('/').pop();
            //getWelcomeResponse(callback);
            makeUserProfileRequest(callback);
        }

    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        getErrorResponse(callback, new Error('problem with request: ' + e.message));
    });
    // write data to request body
    req.write(JSON.stringify(authPayload));
    req.end();

}

function makeUserProfileRequest(callback) {
    var userProfile = '';
    var options = {
        hostname: hostName,
        path: '/users/' + userName,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'elli-session': globalSessionId
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
                workingFolder = userProfileObj.GetUserPersonaRightsResponse.UserProfile.WorkingFolder;
                getWelcomeResponse(callback, userProfileObj.GetUserPersonaRightsResponse.UserProfile.FullName);
            }
        });

    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);

    });
    req.end();

}

function makeRateLockExpirationRequest(callback, duration) {

    var last7DaysRateLockExpPayload = {
        'Fields': { 'PipelineField': defaultFields },
        'Filter': { 'FilterCriterion': { 'DataType': 'IsDate', 'EvaluationOperator': duration, 'Field': 'Fields.762' } },
        'MaxCount': 5,
        'OrgType': 'Internal',
        'Ownership': 'All',
        'PageIndex': 0,
        'PageSize': 5,
        'LoanFolder': workingFolder

    }
    var durationStr = "for this week";
    if (duration == 'CurrentMonth')
        durationStr = "for this month";
    else if (duration == 'Today')
        durationStr = "today";
    var pipelineData = '';
    var options = {
        hostname: hostName,
        path: '/loans/pipeline/paged',
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'elli-session': globalSessionId
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
            var loanCount = loanObj.GetLoanPipelinePagedResponse.LoanCount > 5 ? 5 : loanObj.GetLoanPipelinePagedResponse.LoanCount;
            if (loanCount > 0) {
                for (var i = 0; i < loanCount; i++) {
                    var borrower = loanCount == 1 ? loanObj.GetLoanPipelinePagedResponse.Items.PipelineItem.FieldData.PipelineItemData.filter(function (el) {
                        return (el.Name === "Fields.4002");
                    }) : loanObj.GetLoanPipelinePagedResponse.Items.PipelineItem[i].FieldData.PipelineItemData.filter(function (el) {
                        return (el.Name === "Fields.4002");
                    });
                    if (i == 0)
                        speechOutput += borrower[0].Value;
                    else {
                        if (i == (loanCount - 1))
                            speechOutput += ", and " + borrower[0].Value + " ";
                        else
                            speechOutput += "," + borrower[0].Value + " ";
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

function makeCurrentRateAndProgramRequest(borrowerLastName, callback) {
    var borrowNameSearchPayload = {
        'Fields': { 'PipelineField': defaultFields },
        'Filter': { 'FilterCriterion': { 'DataType': 'IsString', 'EvaluationOperator': 'IsExact', 'Field': 'Fields.4002', 'MinRange': borrowerLastName } },
        'MaxCount': 1,
        'OrgType': 'Internal',
        'Ownership': 'All',
        'PageIndex': 0,
        'PageSize': 1,
        'LoanFolder': workingFolder
    }
    var pipelineData = '';
    var options = {
        hostname: hostName,
        path: '/loans/pipeline/paged',
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'elli-session': globalSessionId
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
            if (loanObj.GetLoanPipelinePagedResponse.LoanCount > 0) {
                var currentProgramObj = loanObj.GetLoanPipelinePagedResponse.Items.PipelineItem.FieldData.PipelineItemData.filter(function (el) {
                    return (el.Name === "Fields.1401");
                });
                var currentRateObj = loanObj.GetLoanPipelinePagedResponse.Items.PipelineItem.FieldData.PipelineItemData.filter(function (el) {
                    return (el.Name === "Fields.3");
                });
                currentProgram = currentProgramObj[0].Value;
                currentRate = currentRateObj[0].Value;
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

function makeGetLoanRequest(borrowerLastName, callback) {
    var borrowNameSearchPayload = {
        'Fields': { 'PipelineField': defaultFields },
        'Filter': { 'FilterCriterion': { 'DataType': 'IsString', 'EvaluationOperator': 'IsExact', 'Field': 'Fields.4002', 'MinRange': borrowerLastName } },
        'MaxCount': 1,
        'OrgType': 'Internal',
        'Ownership': 'All',
        'PageIndex': 0,
        'PageSize': 1,
        'LoanFolder': workingFolder


    }
    var pipelineData = '';
    var options = {
        hostname: hostName,
        path: '/loans/pipeline/paged',
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'elli-session': globalSessionId
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
            var sppechOutput = "”";
            var currentRate;
            var currentProgram;

            var loanObj = JSON.parse(pipelineData);

            console.log(loanObj.GetLoanPipelinePagedResponse.Items.PipelineItem.FieldData.PipelineItemData);
            if (loanObj.GetLoanPipelinePagedResponse.LoanCount > 0) {
                searchProductPricingRequest(loanObj.GetLoanPipelinePagedResponse.Items.PipelineItem.FieldData.PipelineItemData, callback);
                //handleAnswerRequest(callback,loanObj.GetLoanPipelinePagedResponse.LoanCount,false);
            }
            else {
                getErrorResponse(callback, new Error('There are no loans with borrower last name ' + borrowerLastName));
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


function searchProductPricingRequest(pipelineData, callback) {
    var loanData = [];
    loanData.push({ "name": "RequestType", "value": "GetPricing", "type": "string" });
    loanData.push({ "name": "RepresentativeCreditScore", "value": Number(pipelineData.filter(function (el) { return (el.Name === "Fields.VASUMM.X23"); })[0].Value), "type": "string" });
    loanData.push({ "name": "LoanType", "value": { "list": { "name": "LoanType", "values": { "value": [pipelineData.filter(function (el) { return (el.Name === "Fields.1172"); })[0].Value] } } }, "type": "list" });
    loanData.push({ "name": "LoanDocumentationType", "value": pipelineData.filter(function (el) { return (el.Name === "Fields.MORNET.X67"); })[0].Value == null ? "FullDocumentation" : pipelineData.filter(function (el) { return (el.Name === "Fields.MORNET.X67"); })[0].Value, "type": "string" });
    loanData.push({ "name": "LoanPurpose", "value": pipelineData.filter(function (el) { return (el.Name === "Fields.19"); })[0].Value, "type": "string" });
    loanData.push({ "name": "PurposeofRefinance", "value": "", "type": "string" });
    loanData.push({ "name": "PurchasePrice", "value": Number(pipelineData.filter(function (el) { return (el.Name === "Fields.136"); })[0].Value), "type": "string" });
    loanData.push({ "name": "EstimatedValue", "value": Number(pipelineData.filter(function (el) { return (el.Name === "Fields.136"); })[0].Value), "type": "string" });
    loanData.push({ "name": "AppraisedValue", "value": "", "type": "string" });
    loanData.push({ "name": "LockPeriod", "value": "", "type": "string" });
    loanData.push({ "name": "SubordinateFinancingBalance", "value": "", "type": "string" });
    loanData.push({ "name": "BaseLoanAmount", "value": Number(pipelineData.filter(function (el) { return (el.Name === "Fields.1109"); })[0].Value), "type": "string" });
    loanData.push({ "name": "MI_MIP_FF_Financed", "value": "", "type": "string" });
    loanData.push({ "name": "TotalLoanAmount", "value": Number(pipelineData.filter(function (el) { return (el.Name === "Fields.2"); })[0].Value), "type": "string" });
    loanData.push({ "name": "LTV", "value": Number(pipelineData.filter(function (el) { return (el.Name === "Fields.353"); })[0].Value), "type": "string" });
    loanData.push({ "name": "CLTV", "value": Number(pipelineData.filter(function (el) { return (el.Name === "Loan.CLTV"); })[0].Value), "type": "string" });
    loanData.push({ "name": "SubjectPropertyState", "value": pipelineData.filter(function (el) { return (el.Name === "Fields.14"); })[0].Value, "type": "string" });
    loanData.push({ "name": "PostalCode", "value": pipelineData.filter(function (el) { return (el.Name === "Fields.15"); })[0].Value, "type": "string" });
    loanData.push({ "name": "NumberofUnits", "value": Number(pipelineData.filter(function (el) { return (el.Name === "Fields.16"); })[0].Value) < 1 ? "1" : Number(pipelineData.filter(function (el) { return (el.Name === "Fields.16"); })[0].Value), "type": "string" });
    loanData.push({ "name": "PropertyType", "value": pipelineData.filter(function (el) { return (el.Name === "Fields.1041"); })[0].Value, "type": "string" });
    loanData.push({ "name": "OccupancyType", "value": pipelineData.filter(function (el) { return (el.Name === "Fields.1811"); })[0].Value, "type": "string" });
    loanData.push({ "name": "TotalMonthlyIncome", "value": Number(pipelineData.filter(function (el) { return (el.Name === "Fields.736"); })[0].Value), "type": "string" });
    loanData.push({ "name": "Assets", "value": "", "type": "string" });
    loanData.push({ "name": "AUS_Engine", "value": "", "type": "string" });
    loanData.push({ "name": "Recommendation_LP", "value": "", "type": "string" });
    loanData.push({ "name": "Recommendation_DU", "value": "", "type": "string" });
    loanData.push({ "name": "ImpoundWaiver", "value": "", "type": "string" });
    loanData.push({ "name": "SelfEmployed", "value": false, "type": "string" });
    loanData.push({ "name": "PrepaymentPenalty", "value": true, "type": "string" });
    loanData.push({ "name": "12moHousingPaymentHistory", "value": true, "type": "string" });
    loanData.push({ "name": "InterestOnly", "value": false, "type": "string" });
    loanData.push({ "name": "LOCompensationPaidBy", "value": "Lender Paid", "type": "string" });
    loanData.push({ "name": "TargetPrice", "value": "", "type": "string" });
    loanData.push({ "name": "TargetRate", "value": 4, "type": "string" });
    loanData.push({ "name": "LienPosition", "value": pipelineData.filter(function (el) { return (el.Name === "Fields.420"); })[0].Value == null ? "FirstLien" : pipelineData.filter(function (el) { return (el.Name === "Fields.420"); })[0].Value.replace(' ', ''), "type": "string" });
    loanData.push({ "name": "AmortizationType", "value": { "list": { "name": "AmortizationType", "values": { "value": ["Fixed"] } } }, "type": "list" });
    loanData.push({ "name": "LoanTerm", "value": { "list": { "name": "LoanTerm", "values": { "value": [360] } } }, "type": "list" });
    loanData.push({ "name": "NoLoanGUID", "value": true, "type": "string" });
    loanData.push({ "name": "EPPSLoanID", "value": "", "type": "string" });

    productPricingRequestObj.REQUEST_GROUP.REQUEST.REQUEST_DATA.params.param[1].value.structs.struct[0].member = loanData;
    var productPricingData = '';
    var options = {
        hostname: hostName,
        path: '/v2/vendor/transactions',
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'elli-session': globalSessionId
        }
    };
    var req = https.request(options, function (res) {

        if (res.statusCode != 200) {
            console.log('Non 200 Response');
            getErrorResponse(callback, new Error('Non 201 Response'));
        }
        res.on('data', function (chunk) {
            productPricingData += chunk;

        });
        res.on('end', function () {

            var productPricingObj = JSON.parse(productPricingData);
            if (productPricingObj != null) {
                console.log(productPricingObj.RESPONSE_GROUP.RESPONSE.STATUS['@_Condition']);
                if (productPricingObj.RESPONSE_GROUP.RESPONSE.STATUS['@_Condition'] == 'Success') {
                    var transactionData = productPricingObj.RESPONSE_GROUP.EXTENSION.MESSAGE_GROUP_EXTENSION.TransactionData;
                    console.log(transactionData);
                    makeProductPricingDetailsRequest(transactionData, callback);
                }
            }
        });

    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);

    });

    req.write(JSON.stringify(productPricingRequestObj));
    req.end();
}

function makeProductPricingDetailsRequest(transactionData, callback) {
    var productPricingData = '';
    var queryString = '?clientIdentifier=' + transactionData.ClientIdentifier +
        '&companyCode=' + transactionData.CompanyCode + '&messageId=' + transactionData.MessageID +
        '&transactionId=' + transactionData.TransactionID + '&vendorEnvirnoment=' + transactionData.VendorEnvironment +
        '&vendorKey=' + transactionData.VendorKey;

    var options = {
        hostname: hostName,
        path: '/v2/vendor/transactions' + queryString,
        method: 'GET',

        headers: {
            'Content-Type': 'application/json',
            'elli-session': globalSessionId
        }
    };
    console.log(queryString);
    var req = https.request(options, function (res) {

        if (res.statusCode != 200) {

        }
        res.on('data', function (chunk) {
            productPricingData += chunk;

        });
        res.on('end', function () {
            var productPricingObj = JSON.parse(productPricingData);
            if (Array.isArray(productPricingObj.RESPONSE_GROUP.RESPONSE.STATUS)) {
                for (var k = 0; k < productPricingObj.RESPONSE_GROUP.RESPONSE.STATUS.length; k++) {
                    getErrorResponse(callback, new Error(productPricingObj.RESPONSE_GROUP.RESPONSE.STATUS[k]['@_Description']));
                }
            }

            else if (productPricingObj.RESPONSE_GROUP.RESPONSE.STATUS['@_Condition'] != 'Success') {
                if (productPricingObj.RESPONSE_GROUP.RESPONSE.STATUS['@_Condition'] == 'Error')
                    getErrorResponse(callback, new Error(productPricingObj.RESPONSE_GROUP.RESPONSE.STATUS['@_Description']));
                else
                    makeProductPricingDetailsRequest(transactionData, callback);
                // setTimeout(function() { makeProductPricingDetailsRequest(transactionData,callback) }, 1500);
            }
            else {
                //console.log(productPricingObj.RESPONSE_GROUP.RESPONSE.RESPONSE_DATA.EPPSLoanPrograms.LoanProgram);
                var speechOutput = 'No Program Found for this loan';
                var selectedProgram;
                if (Array.isArray(productPricingObj.RESPONSE_GROUP.RESPONSE.RESPONSE_DATA.EPPSLoanPrograms.LoanProgram)) {
                    var elligiblePrograms = productPricingObj.RESPONSE_GROUP.RESPONSE.RESPONSE_DATA.EPPSLoanPrograms.LoanProgram.filter(function (el) {
                        return (el['@Deleted'] === '0');
                    });
                    var filteredLoanPrograms = [];
                    for (var i = 0; i < elligiblePrograms.length; i++) {
                        var loanProgram = elligiblePrograms[i];
                        filteredLoanPrograms.push({ Program: loanProgram['@Program'], Term: loanProgram['@Term'], Rate: loanProgram.LoanProgamRate.hasMin('@Rate')['@Rate'], Price: loanProgram.LoanProgamRate.hasMin('@Price')['@Price'] });
                    }
                    selectedProgram = filteredLoanPrograms.hasMin('Rate');
                }
                else {
                    var elligibleProgram = productPricingObj.RESPONSE_GROUP.RESPONSE.RESPONSE_DATA.EPPSLoanPrograms.LoanProgram;
                    if (elligibleProgram['@Deleted'] === '0')
                        selectedProgram = { Program: elligibleProgram['@Program'], Term: elligibleProgram['@Term'], Rate: elligibleProgram.LoanProgamRate.hasMin('@Rate')['@Rate'], Price: elligibleProgram.LoanProgamRate.hasMin('@Price')['@Price'] };

                }
                if (selectedProgram)
                    speechOutput = selectedProgram.Program + ' is ' + selectedProgram.Term + ' years program with an ' + selectedProgram.Rate + '% APR';
                handleAnswerRequest(callback, speechOutput, false);
            }
        });


    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);

    });


    req.end();
}
// ------- End EBS API Call Requests -------

// ------- Helper Functions to build speech output -------
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

// ------- End Helper Functions to build speech output -------

// ------- Helper Functions -------
Array.prototype.hasMin = function (attrib) {
    return this.reduce(function (prev, curr) {
        return prev[attrib] < curr[attrib] ? prev : curr;
    });
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
// ------- End Helper Functions -------

