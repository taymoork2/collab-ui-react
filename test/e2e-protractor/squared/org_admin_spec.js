// 'use strict';
// /*jshint loopfunc: true */

// /* global describe */
// /* global it */
// /* global browser */
// /* global by */
// /* global expect */
// /* global element */

// var testuser = {
//   username: 'pbr-test-admin@squared2webex.com',
//   password: 'C1sc0123!',
// };

// var testuser2 = {
//   username: 'pbr-test-user@squared2webex.com',
//   password: 'C1sc0123!',
// };

// // Logging in. Write your tests after the login flow is complete.
// describe('Org admin flow', function() {
//   describe('Check squared team member entitlements', function() {
//     it('should login as squared team member admin user', function(){
//       login.login(testuser.username, testuser.password);
//     });

//     it('clicking on users tab should change the view', function() {
//       navigation.clickUsers();
//     });

//     it('click on add button should show entitlements the admin can use', function () {
//       users.addUsers.click();
//       expect(users.managePanel.isDisplayed()).toBeTruthy();

//       users.assertEntitlementListSize(8);
//       expect(users.manageSquaredTeamMember.isDisplayed()).toBeTruthy();
//     });

//     it('should log out', function() {
//       navigation.logout();
//     });
//   });



//   describe('Check non squared team member entitlements', function() {
//     it('should login as non squared team member admin user', function(){
//       login.login(testuser2.username, testuser2.password);
//     });

//     it('clicking on users tab should change the view', function() {
//       navigation.clickUsers();
//     });

//     it('click on add button should show entitlements the admin can use', function () {
//       users.addUsers.click();
//       expect(users.managePanel.isDisplayed()).toBeTruthy();

//       users.assertEntitlementListSize(7);
//       expect(users.manageSquaredTeamMember.isPresent()).toBeFalsy();
//     });

//     it('should log out', function() {
//       navigation.logout();
//     });
//   });
// });

