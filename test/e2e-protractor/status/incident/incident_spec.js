/**
 * Created by snzheng on 16/9/27.
 */

'use strict';

describe('incident list', function () {

  describe('Log In', function () {
    it('should login to incidentPage page', function () {
      login.login('sjsite14-test', '#/status/incidents');
    });
  });

  describe('new incident', function () {
    it('site should be set first', function () {
      //utils.selectDropdown('.status', 'Cisco Spark');
      utils.click(element(by.css('.status a.select-toggle')));
      browser.sleep(2000);

      navigation.navigateUsingIntegrationBackend('#/status/incidents');
      //utils.click(element(by.css('.status .select-options li a:nth-child')));
      // utils.click(element(by.cssContainingText('.status .select-options li a', 'Cisco Spark')));
    });

    it('should jump to create a new incident', function () {
      utils.click(incidentPage.newIncident);
      utils.expectIsDisplayed(incidentPage.createIncident);
      utils.sendKeys(incidentPage.newIncidentName, 'helloWorld');
      utils.click(incidentPage.createIncidentBtn);
    });


  });

  describe('update incident', function () {

    it('addMsg should be shown', function () {
      //utils.click(incidentPage.updateIt);
      utils.click(element(by.cssContainingText('.operationHref div a', 'Update')));
      //navigation.navigateUsingIntegrationBackend('#/status/incidents/update?incidentName=INC003&incidentId=507');
      utils.expectIsDisplayed(incidentPage.addMsg);
    });

    it('incident status should can be edited', function () {
      browser.sleep(2000);
      utils.click(incidentPage.updateStatus);
      utils.expectIsDisplayed(incidentPage.showComponent);
      utils.click(element.all(by.css('.componentSelect a.select-toggle')).first());
      utils.click(element(by.cssContainingText('.componentSelect .select-options a', 'Partial Outage')));
      browser.sleep(1000);
    });

    //it('incident name should can be edited', function () {
    //  utils.click(incidentPage.edit);
    //  utils.expectIsDisplayed(incidentPage.editIncidentName);
    //  utils.click(incidentPage.cancleEditName);
    //  utils.expectIsDisplayed(incidentPage.edit);
    //});

    it('updateIncidentBtn should exist', function () {
      utils.expectIsDisplayed(incidentPage.updateIncidentBtn);
    });

    //it('msgStatus can be edited', function () {
    //  utils.click(incidentPage.msgStatusEdit);
    //  utils.expectIsDisplayed(incidentPage.editMsg);
    //  utils.click(incidentPage.cancleEditMsg);
    //  utils.expectIsDisplayed(incidentPage.msgStatusEdit);
    //});

    it('affected component should can be listed', function () {
      //utils.click(incidentPage.updateIt);
      utils.waitUntilEnabled(incidentPage.showorhideComponent);
      utils.click(incidentPage.showorhideComponent);
      utils.expectIsDisplayed(incidentPage.affectedCompList);
    });

  });

  describe('view incident', function () {
    it('page should be healthy', function () {
      navigation.navigateTo('#/status/incidents');
      utils.click(element(by.cssContainingText('.operationHref div a', 'View Incident')));
      utils.click(incidentPage.showorhideComponent);
      utils.waitForPresence(incidentPage.affectedCompList, 10000);
      utils.expectIsDisplayed(incidentPage.affectedCompList);
    });
  });
  describe('delete incident', function () {
    it('delete incident should be success', function () {
      navigation.navigateTo('#/status/incidents')
      utils.click(element.all(by.cssContainingText('.operationHref div a', 'Delete')).first());
     // utils.expectValueToContain(element(by.css('.pageTitle')), 'Delete helloWorld');
      utils.sendKeys(incidentPage.DELETEInput, 'DELETE');
      utils.click(incidentPage.deleteBtn);
      utils.waitForPresence(element(by.css('.incidentListPage')), 10000);

    });
  });
});
