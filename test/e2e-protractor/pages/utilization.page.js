'use strict'

var UtilizationPage = function() {

    this.overAllUtilization = element(by.model('average'));

    this.assertPage = function(page) {
        expect(this.currentPage.getText()).toBe(page);
    };

    this.assertAtleastOneResource = function(results) {
        element.all(by.repeater('utilization in utilizations')).then(function(rows) {
            expect(rows.length).toBeLessThanOrEqualTo(1);
        });
    };

    this.assertResourceUtilizationGtZero = function(results) {
        expect(element(by.repeater('utilization in utilizations').row(0).column('utilization'))).toBeGreaterThanOrEqualTo(0);
    };

    this.assertResourceUtilizationLsHundred = function(results) {
        expect(element(by.repeater('utilization in utilizations').row(0).column('utilization'))).toBeLessThanOrEqualTo(100);
    };

    this.assertAvgResourceUtilizationGtZero = function(results) {
        expect(this.overAllUtilization).toBeGreaterThanOrEqualTo(0);
    };

    this.assertAvgResourceUtilizationLsHundred = function(results) {
        expect(this.overAllUtilization).toBeLessThanOrEqualTo(100);
    };

};

module.exports = UtilizationPage;