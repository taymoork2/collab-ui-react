'use strict';

var MeetingsPage = function () {
  this.meetingPreviewLink = element(by.id('details-panel'));
  this.filterButtonArrow = element(by.css('.ngHeaderButtonArrow'));
  this.decrementDayButton = element(by.css('[ng-click="decrementDay()"]'));
  this.incrementDayButton = element(by.css('[ng-click="incrementDay()"]'));

  this.assertPage = function (page) {
    utils.expectText(this.currentPage, page);
  };

  this.assertResultsLength = function (results) {
    element.all(by.repeater('row in renderedRows')).then(function (rows) {
      if (results === 50) {
        expect(rows.length).toBeLessThanOrEqualTo(results);
      } else if (results === 0) {
        return expect(rows.length).toBeGreaterThan(results);
      } else if (results > 50) {
        return expect(rows.length).toBeGreaterThan(results);
      } else {
        expect(rows.length).toBe(results);
      }
    });
  };

  this.clickOnMeeting = function () {
    element.all(by.repeater('row in renderedRows')).get(0).click();
  };

  this.clickOnFilter = function () {
    element(by.css('.ngHeaderButtonArrow')).click();
  };

  this.provideFilterValues = function (valueToFilter) {
    element(by.model('filterText')).sendKeys(valueToFilter);
  };

  this.clearFilterValues = function () {
    element(by.model('filterText')).clear();
  };

  this.scrollToBottom = function () {
    browser.executeScript('window.scrollTo(0,1000);');
  };

  this.decrementDay = function () {
    utils.click(this.decrementDayButton);
  };

  this.incrementDay = function () {
    utils.click(this.incrementDayButton);
  };
};

module.exports = MeetingsPage;
