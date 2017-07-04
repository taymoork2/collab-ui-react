'use strict';

var UtilizationPage = function () {
  this.overAllUtilization = element(by.model('average'));

  this.assertPage = function (page) {
    utils.expectText(this.currentPage, page);
  };

  this.assertAtleastOneResource = function () {
    element.all(by.repeater('utilization in utilizations')).then(function (rows) {
      expect(rows.length).toBeLessThanOrEqualTo(1);
    });
  };

  this.assertResourceUtilizationGtZero = function () {
    expect(element(by.repeater('utilization in utilizations').row(0).column('utilization'))).toBeGreaterThanOrEqualTo(0);
  };

  this.assertResourceUtilizationLsHundred = function () {
    expect(element(by.repeater('utilization in utilizations').row(0).column('utilization'))).toBeLessThanOrEqualTo(100);
  };

  this.assertAvgResourceUtilizationGtZero = function () {
    expect(this.overAllUtilization).toBeGreaterThanOrEqualTo(0);
  };

  this.assertAvgResourceUtilizationLsHundred = function () {
    expect(this.overAllUtilization).toBeLessThanOrEqualTo(100);
  };
};

module.exports = UtilizationPage;
