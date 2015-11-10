'use strict';

var ManagementServicePage = function () {

  this.assertPage = function (page) {
    utils.expectText(this.currentPage, page);
  };

  this.assertResultsLength = function (results) {
    element.all(by.repeater('row in renderedRows')).then(function (rows) {
      if (results === 0) {
        return expect(rows.length).toBeGreaterThan(results);
      } else {
        expect(rows.length).toBe(results);
      }
    });
  };

};

module.exports = ManagementServicePage;
