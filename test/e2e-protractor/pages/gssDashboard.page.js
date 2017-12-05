'use strict'

var GSSDashboardPage = function () {
  this.serviceSelector = element(by.css('.service-selector'));
  this.tabLink = element(by.css('a[href="/gss/dashboard"]'));
  this.incidentBlock = element(by.css('.status-dashboard')).element(by.css('.incident-section'));
  this.incidentTitle = element(by.css('.incident-section h3'));
  this.componentBlock = element(by.css('.status-dashboard')).element(by.css('.component-section'));
  this.componentTitle = element(by.css('.component-section h3'));
  this.createIncidentBtn = element(by.css('.btn-primary'));

  this.componentStatuses = element.all(by.css('.component-section a.select-toggle')).first();
  this.selectedStatus = element.all(by.css('.component-section .select-options li a')).first();

  this.clickDashboard = function () {
    navigation.clickGSSTab();
    navigation.expectCurrentUrl('/gss/dashboard');
  }
}

module.exports = GSSDashboardPage;
