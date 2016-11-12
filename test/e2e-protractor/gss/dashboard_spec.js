'use strict'

describe('GSS-(Global Service Status) Management', function () {

  it('should login as GSS test admin', function () {
    login.login('gss-testAdmin');
  }, 120000);

  //It will be ignored when push it to Jenkins. (We are not currently running this because the pages are behind feature toggle and sometime feature toggle doesn't loads fast. We will enable them when we remove feature toggle.)
  xdescribe('Dashboard page', function () {

    it('should navigate to dashboard page', function () {
      browser.sleep(5000);
      gssDashboard.clickDashboard();
    });

    it('should have the services selector displayed', function () {
      utils.expectIsDisplayed(gssDashboard.serviceSelector);
    });

    it('should contain both incident and component part', function () {
      utils.expectIsPresent(gssDashboard.incidentBlock);
      utils.expectIsPresent(gssDashboard.incidentTitle);
      utils.expectIsPresent(gssDashboard.componentBlock);
      utils.expectIsPresent(gssDashboard.componentTitle);
      utils.expectIsDisplayed(gssDashboard.createIncidentBtn);
    });

    it('should change the component\'s status', function () {
      browser.sleep(4000);
      navigation.navigateUsingIntegrationBackend('#/gss/dashboard');
      utils.click(gssDashboard.componentStatuses);
      utils.waitForPresence(gssDashboard.selectedStatus, 6000);
      utils.click(gssDashboard.selectedStatus);
      utils.isSelected(element(by.css('.components-list a.select-toggle')));
    });

  });

  describe('Login out', function () {

    it('should login out', function () {
      navigation.logout();
    });

  });
});
