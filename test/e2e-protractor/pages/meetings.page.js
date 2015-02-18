'use strict'

var MeetingsPage = function() {
  
  this.meetingPreviewLink = element(by.id('details-panel'));
  this.searchButton = element( by.css('[ng-click="searchMeetingList()"]'));
  this.searchField = element(by.model('searchString'));
  this.filterButtonArrow = element(by.css('.ngHeaderButtonArrow'));


  this.assertPage = function (page) {
    expect(this.currentPage.getText()).toBe(page);
  };

  this.assertResultsLength = function (results) {
    element.all(by.repeater('row in renderedRows')).then(function (rows) {
      if (results === 50) {
        expect(rows.length).toBeLessThanOrEqualTo(results);
      } else if (results === 0) {
        return expect(rows.length).toBeGreaterThan(results);
      } else if (results > 50 ) {
        return expect(rows.length).toBeGreaterThan(results);
      } else {
        expect(rows.length).toBe(results);
      }
    });
  };

  this.clickOnMeeting = function () {
    element.all(by.repeater('row in renderedRows')).get(0).click();
  };

  this.clickOnFilter = function(){
    element(by.css('.ngHeaderButtonArrow')).click();
  };

  this.provideFilterValues = function(valueToFilter) {
    element(by.model('filterText')).sendKeys(valueToFilter);
  };

  this.clearFilterValues = function() {
    element(by.model('filterText')).clear();
  };

  this.search = function (query) {
    this.searchButton.click();
    utils.expectIsDisplayed(this.searchField);
    this.searchField.clear();
    browser.sleep(1000);
    if (query) {
      this.searchField.sendKeys(query);
      browser.sleep(1000);
      element.all(by.repeater('row in renderedRows')).then(function (rows) {
        expect(rows.length).toBeGreaterThan(0);
      });
    }
  };

  this.searchEmpty = function (query) {
    this.searchButton.click();
    utils.expectIsDisplayed(this.searchField);
    this.searchField.clear();
    browser.sleep(1000);
    if (typeof query == 'string' || query instanceof String) {
      this.searchField.sendKeys(query);
      browser.sleep(1000);
      element.all(by.repeater('row in renderedRows')).then(function (rows) {
        expect(rows.length).toBeGreaterThan(0);
      });
    }
  };

  this.scrollToBottom = function() {
    browser.executeScript('window.scrollTo(0,1000);');
  };

};

module.exports = MeetingsPage;