'use strict';

var IncidentPage = function () {
  this.randomId = utils.randomId();
  this.incidentTabLink = element(by.css('a[href="#/gss/incidents"]'));
  this.newIncidentBtn = element(by.cssContainingText('button', 'New Incident'));
  this.serviceSelector = element(by.id('serviceSelector'));
  this.serviceSelector1stChild = element(by.css('.gss-iframe .select-options li:first-child a'));
  this.serviceSelector2ndChild = element(by.css('.gss-iframe .select-options li:nth-child(2) a'));

  this.createIncidentBtn = element(by.id('createIncidentBtn'));
  this.cancelBtnOnCreatepage = element(by.id('cancelBtn'));
  this.incidentNameField = element(by.model('createIncidentCtrl.incidentName'));
  this.newIncidentName = 'newIncident' + this.randomId;
  this.messageOnCreatePage = element(by.model('createIncidentCtrl.message'));
  this.newMessageOnCreatePage = 'newMessage' + this.randomId;
  this.createSuccessAlertMsg = 'Incident ' + this.newIncidentName + ' successfully created.';


  this.deleteIncidentLink = element.all(by.cssContainingText('.incident-list-page .incident-section ul li', this.newIncidentName))
    .first().element(by.cssContainingText('a', 'Delete'));
  this.deleteIncidentBtn = element(by.id('deleteIncidentBtn'));
  this.cancelBtnOnDelPage = element(by.id('cancelBtn'));
  this.confirmMsgField = element(by.model('deleteIncidentCtrl.deleteCommand'));
  this.confirmMsg = 'DELETE';
  this.deleteSuccessAlertMsg = 'Incident successfully deleted.';

  this.clickIncident = function () {
    navigation.clickGSSTab();
    utils.click(this.incidentTabLink);
    navigation.expectCurrentUrl('/gss/incidents');
  }

};
module.exports = IncidentPage;
