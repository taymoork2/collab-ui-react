'use strict';

var IncidentPage = function () {
  this.randomId = utils.randomId();
  this.newIncidentName = 'newIncident' + this.randomId;
  this.newMsg = 'newMsg' + this.randomId;
  this.updateIncidentName = 'updateIncident' + this.randomId;
  this.updateMsg = 'updateMsg' + this.randomId;
  this.editMsg = 'editMsg' + this.randomId;
  this.createSuccessAlertMsg = 'Incident ' + this.newIncidentName + ' create succeed.';
  this.updateSuccessAlertMsg = 'Incident ' + this.updateIncidentName + ' update succeed.';
  this.updateIncidentNameAlertMsg = 'Incident ' + this.newIncidentName + ' update succeed.';
  this.editMsgAlertMsg = 'Message successfully modified.';
  this.deleteSuccessAlertMsg = 'Incident ' + this.updateIncidentName + ' delete succeed.';
  this.confirmMsg = 'DELETE';

  this.incidentTabLink = element(by.css('a[href="/gss/incidents"]'));
  this.newIncidentBtn = element(by.id('newIncidentBtn'));
  this.serviceSelector = element(by.id('serviceSelector'));
  this.serviceSelector1stChild = element(by.css('.gss-iframe .select-options li:first-child a'));
  this.serviceSelector2ndChild = element(by.css('.gss-iframe .select-options li:nth-child(2) a'));

  this.createIncidentBtn = element(by.id('createIncidentBtn'));
  this.cancelBtnOnCreatepage = element(by.id('cancelBtn'));
  this.incidentNameField = element(by.id('create-incident-name'));
  this.newMsgField = element(by.model('createIncidentCtrl.message'));

  this.updateIncidentLink = element.all(by.cssContainingText('.incident-list-page .incident-section ul li', this.newIncidentName))
    .first().element(by.css('.row:last-child .columns:last-child a:last-child'));
  this.editIncidentNameLink = element(by.id('editTitle'));
  this.saveBtn = element(by.id('saveModifyIncidentBtn'));
  this.incidentImpactStatusSelector = element(by.id('editIncidentImpactStatus'));
  this.incidentImpactStatusSelector2ndChild = element(by.css('#editIncidentImpactStatus .select-options li:nth-child(2)'));
  this.updateIncidentNameField = element(by.id('editIncidentName'));
  this.updateMsgField = element(by.id('updateIncidentMessage'));
  this.updateStatusOnRadio = element(by.css('.update-incident-page .update-incident-section .cs-radio-group .cs-input-group:last-child label'));
  this.isOverriddenLink = element(by.css('.component-list li:first-child .row .columns:nth-child(2) a:not(.ng-hide)'));
  this.updateIncidentBtn = element(by.id('updateIncidentBtn'));
  this.msgUnderPreviousUpdates = element(by.cssContainingText('.update-incident-page .content-common-style .messages-section ul li', this.newMsg));
  this.updatedMsgUnderPreviousUpdates = element(by.cssContainingText('.update-incident-page .content-common-style .messages-section ul li', this.updateMsg));
  this.updatedMsgEditLink = element.all(by.cssContainingText('.update-incident-page .content-common-style .messages-section ul li', this.updateMsg))
    .first().element(by.css('a.edit-message-link'));
  this.saveBtnUnderPreviousUpdates = element.all(by.cssContainingText('.update-incident-page .content-common-style .messages-section ul li', this.updateMsg))
    .first().element(by.css('.saveModifyMessageBtn'));
  this.editMsgField = element(by.model('message.editMessage'));

  this.updateIncidentForStatusLink = element.all(by.cssContainingText('.incident-list-page .incident-section ul li', this.updateIncidentName))
    .first().element(by.css('.row:last-child .columns:last-child a:last-child'));
  this.viewIncidentLink = element.all(by.cssContainingText('.incident-list-page .incident-section ul li', this.updateIncidentName))
    .first().element(by.css('.row:last-child .columns:last-child a:last-child'));
  this.titleSection = element(by.css('.title-section'));
  this.updateIncidentSection = element(by.css('.update-incident-section'));
  this.messageSection = element(by.css('.messages-section'));

  this.deleteIncidentLink = element.all(by.cssContainingText('.incident-list-page .incident-section ul li', this.updateIncidentName))
    .first().element(by.css('.row:last-child .columns:last-child a:first-child'));
  this.deleteIncidentBtn = element(by.id('deleteIncidentBtn'));
  this.confirmMsgField = element(by.model('deleteIncidentCtrl.deleteCommand'));

  this.clickIncident = function () {
    navigation.clickGSSTab();
    utils.click(this.incidentTabLink);
    navigation.expectCurrentUrl('/gss/incidents');
  }
};
module.exports = IncidentPage;
