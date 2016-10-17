/**
 * Created by snzheng on 16/9/30.
 */
'use strict';
describe('update4 Incident', function () {

  describe('Log In', function () {
    it('should login to dashboard page', function () {
      login.login('sjsite14-test', '#/status/dashboard');
    });
  });


  describe('dashboard page', function () {
    it('should transfer to dashboard page', function () {
      utils.click(element(by.css('.status a.select-toggle')));
      browser.sleep(2000);
      navigation.navigateUsingIntegrationBackend('#/status/dashboard');
    });

    it('dashboard should contain both incident and component part', function () {
      utils.expectIsPresent(dashboardPage.incidentBlock);
      utils.expectIsPresent(dashboardPage.incidentTitle);
      utils.expectIsPresent(dashboardPage.componentBlock);
      utils.expectIsPresent(dashboardPage.componentTitle);
      //utils.waitForPresence(dashboardPage.incidentStatusRadio,6000000);
     // utils.expectIsDisplayed(dashboardPage.incidentStatusRadio);
      utils.expectIsDisplayed(dashboardPage.createIncidentBtn);
    });

    it('createIncident should be enabled', function () {
      //navigation.navigateUsingIntegrationBackend('#/status/dashboard');
      utils.click(dashboardPage.createIncidentBtn);
      utils.expectIsDisplayed(element(by.id('createIncidentPage')));
    });

    it('updateIncident should be enabled', function () {
      navigation.navigateUsingIntegrationBackend('#/status/dashboard');
      utils.click(dashboardPage.updateIncidentBtn);
      utils.expectIsDisplayed(dashboardPage.updateIncidentPage);
    });

    it('component status should can be changed', function () {
        browser.sleep(4000);
        navigation.navigateUsingIntegrationBackend('#/status/dashboard');
        utils.click(dashboardPage.componentStatuses);
        utils.waitForPresence(dashboardPage.selectedStatus, 6000);
        utils.click(dashboardPage.selectedStatus);
        utils.isSelected(element(by.css('.content-area2 a.select-toggle')));
        utils.waitForPresence(element(by.id('error')), 3000).then(function () {
        },function (){
        });
    });
  });
});
