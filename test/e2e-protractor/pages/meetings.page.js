'use strict'

var MeetingsPage = function() {
  
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