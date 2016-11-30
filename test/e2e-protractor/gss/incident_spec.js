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

    it('should update incident name and impact status successfully', function () {
      notifications.clearNotifications();
      utils.click(gssIncident.updateIncidentLink);
      utils.expectIsDisplayed(gssIncident.editIncidentNameLink);
      utils.click(gssIncident.editIncidentNameLink);
      utils.expectIsDisplayed(gssIncident.saveBtn);
      utils.expectIsDisplayed(gssIncident.updateIncidentNameField);
      utils.click(gssIncident.incidentImpactStatusSelector);
      utils.click(gssIncident.incidentImpactStatusSelector2ndChild);
      utils.clear(gssIncident.updateIncidentNameField);
      utils.sendKeys(gssIncident.updateIncidentNameField, gssIncident.updateIncidentName);
      utils.click(gssIncident.saveBtn);
      notifications.assertSuccess(gssIncident.updateIncidentNameAlertMsg);
    });

    it('should update incident message successfully', function () {
      notifications.clearNotifications();
      utils.expectIsDisplayed(gssIncident.updateMsgField);
      utils.expectIsDisplayed(gssIncident.updateIncidentBtn);
      utils.expectIsDisabled(gssIncident.updateIncidentBtn);
      utils.click(gssIncident.updateStatusOnRadio);
      utils.clear(gssIncident.updateMsgField);
      utils.sendKeys(gssIncident.updateMsgField, gssIncident.updateMsg);
      utils.click(gssIncident.isOverriddenLink);
      utils.expectIsEnabled(gssIncident.updateIncidentBtn);
      utils.click(gssIncident.updateIncidentBtn).then(function () {
        notifications.assertSuccess(gssIncident.updateSuccessAlertMsg);
      });
    });

    it('should update incident message on previous updated successfully', function () {
      notifications.clearNotifications();
      utils.expectIsDisplayed(gssIncident.msgUnderPreviousUpdates);
      utils.expectIsDisplayed(gssIncident.updatedMsgUnderPreviousUpdates);
      utils.expectIsDisplayed(gssIncident.updatedMsgEditLink);
      utils.click(gssIncident.updatedMsgEditLink);
      utils.expectIsDisplayed(gssIncident.saveBtnUnderPreviousUpdates);
      utils.click(gssIncident.saveBtnUnderPreviousUpdates);
      utils.clear(gssIncident.editMsgField);
      utils.sendKeys(gssIncident.editMsgField, gssIncident.editMsg);
      utils.click(gssIncident.saveBtnUnderPreviousUpdates);
      notifications.assertSuccess(gssIncident.editMsgAlertMsg);
    });

    it('should navigate to view incident page', function () {
      gssIncident.clickIncident();
      utils.click(gssIncident.viewIncidentLink);
      utils.expectIsDisplayed(gssIncident.titleSection);
      utils.expectIsDisplayed(gssIncident.messageSection);
      utils.expectIsNotPresent(gssIncident.updateIncidentSection);
    });

    it('should delete incident successfully', function () {
      notifications.clearNotifications();
      gssIncident.clickIncident();
      utils.click(gssIncident.deleteIncidentLink);
      utils.expectIsDisplayed(gssIncident.deleteIncidentBtn);
      utils.expectIsDisabled(gssIncident.deleteIncidentBtn);
      utils.sendKeys(gssIncident.confirmMsgField, gssIncident.confirmMsg);
      utils.expectIsEnabled(gssIncident.deleteIncidentBtn);
      utils.click(gssIncident.deleteIncidentBtn).then(function () {
        notifications.assertSuccess(gssIncident.deleteSuccessAlertMsg);
      });
    });

  });

  describe('Login out', function () {
    it('should login out', function () {
      navigation.logout();
    });
  });
});
