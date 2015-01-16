'use strict'

var MeetingsPage = function() {
  this.searchButton = element(by.css('.header-search-toggle'));
  this.searchField = element(by.css('.search-form input'));
  this.settingsBar = element(by.id('setting-bar'));
  this.logoutButton = element(by.id('logout-btn'));
  this.iconSearch = element(by.id('icon-search'));
  this.statusField = element(by.id('statusField'));
  this.subjectField = element(by.id('subjectField'));
  this.dateField = element(by.id('dateField'));
  this.startTimeField = element(by.id('startTimeField'));
  this.resourceField = element(by.id('resourceField'));
  this.webexSiteField = element(by.id('webexSiteField'));
  
  
  this.assertPage = function (page) {
    expect(this.currentPage.getText()).toBe(page);
  };

  this.assertResultsLength = function (results) {
    element.all(by.repeater('row in renderedRows')).then(function (rows) {
      if (results === 20) {
        expect(rows.length).toBeLessThanOrEqualTo(results);
      } else if (results === 0) {
        return expect(rows.length).toBeGreaterThan(results);
      } else {
        expect(rows.length).toBe(results);
      }
    });
  };


};

module.exports = MeetingsPage;