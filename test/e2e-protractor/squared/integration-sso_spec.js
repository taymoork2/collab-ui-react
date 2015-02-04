// 'use strict';

// /* global describe */
// /* global it */
// /* global browser */
// /* global by */
// /* global expect */
// /* global element */

// var testuser = {
//   username: 'pbr-sso-org-admin@squared2webex.com',
//   password: 'C1sc0123!'
// };

// describe('Enabling SSO flow', function() {
//   it('should login as sso admin user', function(){
//     //because we already logged in as SSO user in the previous spec
//     login.loginSSOSecondTime(testuser.username, testuser.password);
//   });

//   it('clicking on manage tab should change the view', function() {
//     navigation.clickOrganization();
//     navigation.expectCurrentUrl('/orgs');
//   });

//   it('should display setup SSO button and clicking it should launch the wizard', function() {
//     utils.expectIsDisplayed(ssowizard.btnSSO);
//     ssowizard.btnSSO.click();
//     utils.expectIsDisplayed(ssowizard.ssoModalHeader);
//   });

//   it('should display the Import IDP metadata step when the wizard launches', function() {
//     utils.expectIsDisplayed(ssowizard.fileToUploadText);
//     utils.expectIsDisplayed(ssowizard.fileToUploadBtn);
//     utils.expectIsNotDisplayed(ssowizard.fileToUploadTextHolder);
//     utils.expectIsNotDisplayed(ssowizard.fileToUploadBtnHolder);
//     utils.expectIsDisplayed(ssowizard.importCancelBtn);
//     utils.expectIsDisplayed(ssowizard.importNextBtn);
//   });

//   it('should close the wizard when Cancel button is clicked', function() {
//     ssowizard.importCancelBtn.click();
//     utils.expectIsDisplayed(ssowizard.btnSSO);
//   });

//   it('should navigate steps by clicking on Next and Previous buttons', function() {
//     ssowizard.btnSSO.click();
//     utils.expectIsDisplayed(ssowizard.ssoModalHeader);

//     ssowizard.importNextBtn.click();
//     utils.expectIsDisplayed(ssowizard.downloadMeta);
//     utils.expectIsDisplayed(ssowizard.exportCancelBtn);
//     utils.expectIsDisplayed(ssowizard.exportBackBtn);
//     utils.expectIsDisplayed(ssowizard.ssoModalHeader);

//     ssowizard.exportNextBtn.click();
//     utils.expectIsDisplayed(ssowizard.ssoTestBtn);
//     utils.expectIsDisplayed(ssowizard.testssoCancelBtn);
//     utils.expectIsDisplayed(ssowizard.testssoBackBtn);
//     utils.expectIsDisplayed(ssowizard.testssoNextBtn);
//     utils.expectIsDisplayed(ssowizard.ssoModalHeader);

//     ssowizard.testssoNextBtn.click();
//     utils.expectIsDisplayed(ssowizard.enablessoCancelBtn);
//     utils.expectIsDisplayed(ssowizard.enablessoBackBtn);
//     utils.expectIsDisplayed(ssowizard.enablessoFinishBtn);
//     utils.expectIsDisplayed(ssowizard.ssoModalHeader);

//     ssowizard.enablessoBackBtn.click();
//     utils.expectIsDisplayed(ssowizard.ssoTestBtn);
//     utils.expectIsDisplayed(ssowizard.testssoCancelBtn);
//     utils.expectIsDisplayed(ssowizard.testssoBackBtn);
//     utils.expectIsDisplayed(ssowizard.testssoNextBtn);
//     utils.expectIsDisplayed(ssowizard.ssoModalHeader);

//     ssowizard.testssoBackBtn.click();
//     utils.expectIsDisplayed(ssowizard.downloadMeta);
//     utils.expectIsDisplayed(ssowizard.exportCancelBtn);
//     utils.expectIsDisplayed(ssowizard.exportBackBtn);
//     utils.expectIsDisplayed(ssowizard.ssoModalHeader);

//     ssowizard.exportBackBtn.click();
//     utils.expectIsDisplayed(ssowizard.fileToUploadText);
//     utils.expectIsDisplayed(ssowizard.fileToUploadBtn);
//     utils.expectIsNotDisplayed(ssowizard.fileToUploadTextHolder);
//     utils.expectIsNotDisplayed(ssowizard.fileToUploadBtnHolder);
//     utils.expectIsDisplayed(ssowizard.importCancelBtn);
//     utils.expectIsDisplayed(ssowizard.importNextBtn);
//   });

//   it('should close the wizard when clicking on the X mark', function() {
//     ssowizard.closeSSOModal.click();
//     utils.expectIsDisplayed(ssowizard.btnSSO);
//   });

//   it('should log out', function() {
//     navigation.logout();
//   });
// });
