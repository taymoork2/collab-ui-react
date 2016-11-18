'use strict';

/* global LONG_TIMEOUT */

describe('GSS-(Global Service Status) Management', function () {

  it('should login as GSS test admin', function () {
    login.login('gss-testAdmin');
  }, LONG_TIMEOUT);

  xdescribe('Incident page', function () {

    it('should display new incident button', function () {
      gssIncident.clickIncident();
      utils.expectIsDisplayed(gssIncident.newIncidentBtn);
    });

    it('should select the first service-select option', function () {
      utils.click(gssIncident.serviceSelector);
      utils.expectIsDisplayed(gssIncident.serviceSelector2ndChild);
      utils.expectIsDisplayed(gssIncident.serviceSelector1stChild);
      utils.click(gssIncident.serviceSelector1stChild);
      utils.isSelected(gssIncident.serviceSelector1stChild);
    });

    it('should add incident successfully', function () {
      utils.click(gssIncident.newIncidentBtn);
      utils.expectIsDisplayed(gssIncident.createIncidentBtn);
      utils.expectIsDisabled(gssIncident.createIncidentBtn);
      utils.expectIsDisplayed(gssIncident.cancelBtnOnCreatepage);
      utils.sendKeys(gssIncident.incidentNameField, gssIncident.newIncidentName);
      utils.sendKeys(gssIncident.messageOnCreatePage, gssIncident.newMessageOnCreatePage);
      utils.expectIsEnabled(gssIncident.createIncidentBtn);
      utils.click(gssIncident.createIncidentBtn);
      notifications.assertSuccess(gssIncident.createSuccessAlertMsg);
    });

    it('should delete incident successfully', function () {
      utils.expectIsDisplayed(gssIncident.newIncidentBtn);
      utils.click(gssIncident.deleteIncidentLink);
      utils.expectIsDisplayed(gssIncident.deleteIncidentBtn);
      utils.expectIsDisabled(gssIncident.deleteIncidentBtn);
      utils.expectIsDisplayed(gssIncident.cancelBtnOnDelPage);
      utils.sendKeys(gssIncident.confirmMsgField, gssIncident.confirmMsg);
      utils.expectIsEnabled(gssIncident.deleteIncidentBtn);
      utils.click(gssIncident.deleteIncidentBtn);
      notifications.assertSuccess(gssIncident.deleteSuccessAlertMsg);
    });

  });

  describe('Login out', function () {
    it('should login out', function () {
      navigation.logout();
    });
  });
});
