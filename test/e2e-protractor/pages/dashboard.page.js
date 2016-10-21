'use strict';

var DashboardPage = function () {
  this.incidentBlock = element(by.css('.status-dashboard')).element(by.css('.first-block'));
  this.incidentTitle = element(by.css('.incidentListPageHeader h2'));
  this.componentBlock = element(by.css('.status-dashboard')).element(by.css('.second-block'));
  this.componentTitle = element(by.id('title2'));
  this.incidentStatusRadio = element(by.css('.incidentStatus label input'));
  this.createIncidentBtn = element(by.css('.btn--primary'));

  this.updateIncidentBtn = element(by.css('.incidentInfo a'));
  this.updateIncidentPage = element(by.id('incidentInfo'));

  this.componentStatuses = element.all(by.css('.testDropdown a.select-toggle')).first();
  this.selectedStatus = element.all(by.css('.testDropdown .select-options li a')).first();
};

module.exports = DashboardPage;
