// 'use strict';

// /* global describe */
// /* global it */
// /* global browser */
// /* global by */
// /* global expect */
// /* global element */
// /* global protractor */

// // Notes:
// // - State is conserved between each describe and it blocks.
// // - When a page is being loaded, use wait() to check if elements are there before asserting.

// var utils = require('./testUtils.js');
// var config = require('./testConfig.js');

// var token = null;
// var testEmail = utils.randomTestGmail();
// var deviceUserAgent = config.deviceUserAgent.iPhone;
// var encryptedQueryParam = null;

// var resentEqp = null;


// var testBody = {
//   'email': testEmail,
//   'pushId': utils.randomId(),
//   'deviceName': utils.randomId(),
//   'deviceId': utils.randomId()
// };

// function getToken() {
//   console.log('getting token');
//   var options = {
//     method: 'post',
//     url: config.oauth2Url + 'access_token',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     auth: {
//       'user': config.oauthClientRegistration.id,
//       'pass': config.oauthClientRegistration.secret,
//       'sendImmediately': true
//     },
//     body: 'grant_type=client_credentials&scope=' + config.oauthClientRegistration.scope
//   };

//   return utils.sendRequest(options).then(function(data) {
//     var resp = JSON.parse(data);
//     console.log('access token', resp.access_token);
//     token = resp.access_token;
//   });
// }

// function verifyEmail() {
//   var options = {
//     method: 'post',
//     url: config.adminServiceUrl.integration + 'users/email/verify',
//     headers: {
//       'User-Agent': deviceUserAgent,
//       'Content-Type': 'application/json',
//       Authorization: 'Bearer ' + token
//     },
//     body: JSON.stringify(testBody)
//   };

//   return utils.sendRequest(options).then(function(data) {
//     var resp = JSON.parse(data);
//     console.log('encrypted param', resp.eqp);
//     encryptedQueryParam = resp.eqp;
//   });
// }

// function setup(deviceUA) {
//   deviceUserAgent = deviceUA;
//   var flow = protractor.promise.controlFlow();
//   flow.execute(getToken);
//   flow.execute(verifyEmail);
// }

// setup(config.deviceUserAgent.iPhone);

// describe('Self Registration Activation Page', function() {

//   // beforeEach(function() {
//   //   setup();
//   // });

//   describe('Desktop activation for iOS device', function() {

//     it('should display without admin controls on navigation bar', function() {

//       expect(encryptedQueryParam).not.toBe(null);

//       browser.get('#/activate?eqp=' + encryptedQueryParam);

//       expect(element(by.id('logout-btn')).isDisplayed()).toBe(false);
//       expect(element(by.id('icon-search')).isDisplayed()).toBe(false);
//       expect(element(by.id('search-input')).isDisplayed()).toBe(false);
//       expect(element(by.id('setting-bar')).isDisplayed()).toBe(false);

//     });

//     it('should activate user and display android download info', function() {

//       expect(element(by.id('provisionSuccess')).isDisplayed()).toBe(true);
//       expect(element(by.id('codeExpired')).isDisplayed()).toBe(false);
//       expect(element(by.id('resendSuccess')).isDisplayed()).toBe(false);
//       expect(element(by.id('androidDownload')).isDisplayed()).toBe(true);
//       expect(element(by.id('iosDownload')).isDisplayed()).toBe(false);

//       // setting up next test
//       setup(config.deviceUserAgent.androidHTC1);
//     });
//   });


//   describe('Desktop activation for android device', function() {

//     it('should display without admin controls on navigation bar', function() {

//       browser.get('#/activate?eqp=' + encryptedQueryParam);

//       expect(element(by.id('logout-btn')).isDisplayed()).toBe(false);
//       expect(element(by.id('icon-search')).isDisplayed()).toBe(false);
//       expect(element(by.id('search-input')).isDisplayed()).toBe(false);
//       expect(element(by.id('setting-bar')).isDisplayed()).toBe(false);

//       // run = false;
//     });

//     it('should activate user and display ios download info', function() {
//       expect(element(by.id('provisionSuccess')).isDisplayed()).toBe(true);
//       expect(element(by.id('codeExpired')).isDisplayed()).toBe(false);
//       expect(element(by.id('resendSuccess')).isDisplayed()).toBe(false);
//       expect(element(by.id('androidDownload')).isDisplayed()).toBe(false);
//       expect(element(by.id('iosDownload')).isDisplayed()).toBe(true);

//       // run = false;
//     });
//   });

//   describe('Desktop activation after code is invalidated', function() {
//     it('should display without admin controls on navigation bar', function() {

//       browser.get('#/activate?eqp=' + encryptedQueryParam);

//       expect(element(by.id('logout-btn')).isDisplayed()).toBe(false);
//       expect(element(by.id('icon-search')).isDisplayed()).toBe(false);
//       expect(element(by.id('search-input')).isDisplayed()).toBe(false);
//       expect(element(by.id('setting-bar')).isDisplayed()).toBe(false);
//     });

//     it('should display code expired with user email', function() {
//       expect(element(by.id('provisionSuccess')).isDisplayed()).toBe(false);
//       expect(element(by.id('codeExpired')).isDisplayed()).toBe(true);
//       expect(element(by.id('resendSuccess')).isDisplayed()).toBe(false);
//       expect(element(by.binding('userEmail')).getText()).toContain(testEmail);
//     });

//     it('should request new code when link is clicked', function() {
//       element(by.id('sendCodeLink')).click().then(function() {
//         expect(element(by.id('provisionSuccess')).isDisplayed()).toBe(false);
//         expect(element(by.id('codeExpired')).isDisplayed()).toBe(false);
//         expect(element(by.id('resendSuccess')).isDisplayed()).toBe(true);
//         element(by.id('testdata')).getAttribute('eqp').then(function(eqp) {
//           expect(eqp).not.toBe(null);
//           resentEqp = eqp;
//         });
//       });
//     });
//   });

//   describe('Desktop activation using resent activation link', function() {
//     it('should activate successfully', function() {
//       browser.get('#/activate?eqp=' + resentEqp);
//       expect(element(by.id('provisionSuccess')).isDisplayed()).toBe(true);
//       expect(element(by.id('codeExpired')).isDisplayed()).toBe(false);
//       expect(element(by.id('resendSuccess')).isDisplayed()).toBe(false);
//     });
//   });

// });
