// 'use strict';
// /*jshint loopfunc: true */

// /* global describe */
// /* global it */
// /* global browser */
// /* global by */
// /* global expect */
// /* global element */

// // Notes:
// // - State is conserved between each despribe and it blocks.
// // - When a page is being loaded, use wait() to check if elements are there before asserting.

// describe('Org Info flow', function() {
//   beforeEach(function() {
//     this.addMatchers({
//       toBeLessThanOrEqualTo: function() {
//         return {
//           compare: function(actual, expected) {
//             return {
//               pass: actual < expected || actual === expected,
//               message: 'Expected ' + actual + 'to be less than or equal to ' + expected
//             };
//           }
//         };
//       }
//     });
//   });

//   describe('Navigating to organization tab', function() {
//     it('clicking on orgs tab should show the org info', function() {
//       browser.driver.wait(function() {
//         browser.waitForAngular();
//       }).then (function() {
//         browser.driver.findElement(by.css('li[heading="Organizations"]')).click();
//         browser.driver.wait(function() {
//           return browser.driver.isElementPresent(by.id('tabs'));
//         }).then(function() {
//           expect(browser.getCurrentUrl()).toContain('/orgs');
//           expect(element(by.css('h2')).getText()).toContain('MANAGE ORGANIZATIONS');
//           expect(element(by.id('displayName')).isDisplayed()).toEqual(true);
//           expect(element(by.id('estimatedSize')).isDisplayed()).toEqual(true);
//           expect(element(by.id('totalUsers')).isDisplayed()).toEqual(true);
//           expect(element(by.id('sso')).isDisplayed()).toEqual(true);
//           expect(element(by.id('btnSave')).isDisplayed()).toEqual(false);
//           expect(element(by.id('btnReset')).isDisplayed()).toEqual(true);
//         });
//       });
//     });
//   });


// });
