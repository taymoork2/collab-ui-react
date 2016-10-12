/**
 * Created by snzheng on 16/9/30.
 */
'use strict';

var dashboardPage = function () {
 this.incidentBlock = element(by.css('.status-dashboard')).element(by.css('.first-block'));
  this.incidentTitle = element(by.css('.incidentListPageHeader h2'));
  this.componentBlock = element(by.css('.status-dashboard')).element(by.css('.second-block'));
  this.componentTitle = element(by.id('title2'));
  this.incidentStatusRadio = element(by.css('.incidentStatus label input'));
  this.createIncidentBtn = element(by.css('.btn--primary'));

  this.updateIncidentBtn = element(by.css('.incidentInfo a'));
  this.updateIncidentPage = element(by.id('incidentInfo'));

  this.componentStatuses = element.all(by.css('.content-area2 a.select-toggle')).last();
  this.selectedStatus = element.all(by.css('.content-area2 .select-options li a')).last();
};

module.exports = dashboardPage;
