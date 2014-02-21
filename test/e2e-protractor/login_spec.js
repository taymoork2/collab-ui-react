'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global element */
/* global expect */
/* global beforeEach */

// var request = require('request');
// var base64Decode = require('base64').decode;
// var base64Encode = require('base64').encode;

// var authCode = null;
// var accessToken = null;

// function getAuthCode() {
//   request('https://idbrokerbeta.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C96d389d632c96d038d8f404c35904b5108988bd6d601d4b47f4eec88a569d5db&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&scope=webexsquare%3Aget_conversation&realm=1eb65fdf-9643-417f-9974-ad72cae0e10f&state=random-string',
//     function(error, response, body) {
//       if (!error && response.statusCode === 200) {
//         console.log(body);
//       }
//     });
// }

// function getAccessToken() {
//   var options = {
//     url: 'https://idbrokerbeta.webex.com/idb/oauth2/v1/access_token',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Authorization': 'Basic ' + base64Encode('C96d389d632c96d038d8f404c35904b5108988bd6d601d4b47f4eec88a569d5db:b11c3e96a0d51f66ff9686220b74e2c0f6c6c7636bba98b71ca5dbbf5d6896d6'),
//     },
//     body: 'grant_type=authorization_code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&code=' + 'OThhYTcyMTktNTMxOC00YjI4LWFhMTEtYWNiNjVhNTAzMjE5ODQ5Njk4ZmQtMDMx'
//   };

//   request(options, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       accessToken = JSON.parse(body).access_token;
//       console.log('Access Token: ' + accessToken);

//     } else {
//       console.log(response.statusCode);
//       console.log(body);
//     }
//   });

// }

describe('Login Page', function() {
  it('should contains Sign in button', function() {
    browser.get('#/login');
    browser.waitForAngular();
    var button = element(by.css('#loginBtn'));
    expect(button.getText()).toEqual('Sign in');
    expect(button.getText()).not.toEqual('123');
  });
});

describe('Login Process', function() {

  beforeEach(function() {

  });

  afterEach(function() {
  });

  it('should redirect to users page with authToken present', function() {
    browser.get('#/login');
  });

});
