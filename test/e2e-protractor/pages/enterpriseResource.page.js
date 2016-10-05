'use strict';

var EnterpriseResourcePage = function () {
  //details-panel
  this.enterpriseResourceLink = element(by.id('entire-slide'));

  this.assertResultsLength = function (results) {
    element.all(by.repeater('col in renderedColumns')).then(function (rows) {
      if (results === 20) {
        expect(rows.length).toBeLessThanOrEqualTo(results);
      } else if (results === 0) {
        return expect(rows.length).toBeGreaterThan(results);
      } else {
        expect(rows.length).toBe(results);
      }
    });
  };

  this.clickOnResource = function () {
    element.all(by.repeater('col in renderedColumns')).get(2).click();
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

};
module.exports = EnterpriseResourcePage;
