'use strict';

var SupportPage = function () {

  this.searchValidEmail = 'pbr-org-admin@squared2webex.com';
  this.searchValidUuid = 'c4753c5f-886a-42f9-a0d8-002d0b7fdf2d';
  this.searchValidLocusid = '';
  this.searchNonexistentMetadata = 'qqt7y812twuiy900909-2jijeqbd,,.mjmj123qwsah77&89%$3wesa@54a';

  this.logSearchField = element(by.id('logsearchfield'));
  this.logSearchBtn = element(by.id('logSearchBtn'));
  this.logsPanel = element(by.id('logs-panel'));
  this.noResults = element(by.id('noResults'));

  this.rowCount = element.all(by.repeater('log in userLogs'));

  this.emailAddressHeading = element(by.id('emailAddressHeading'));
  this.locusIdHeading = element(by.id('locusIdHeading'));
  this.callStartHeading = element(by.id('callStartHeading'));
  this.dateHeading = element(by.id('dateHeading'));

  this.supportTable = element(by.id('supportTable'));

  this.emailAddress = element(by.cssContainingText('.ui-grid-header-cell-label', 'Email Address'));
  this.locusId = element(by.cssContainingText('.ui-grid-header-cell-label', 'Locus ID'));
  this.callStart = element(by.cssContainingText('.ui-grid-header-cell-label', 'Call Start Time'));
  this.rowContents = element(by.css('.ui-grid-row'));

  this.callInfoIcon = element.all(by.repeater('row in renderedRows')).first().element(by.id('callInfo-icon'));
  this.downloadCallflowChartsIcon = element(by.id('download-callflowCharts-icon'));
  this.closeCallInfo = element(by.id('closeCallInfo'));
  this.closeCallFlow = element(by.id('closeCallFlow'));

  this.locusIdSort = element(by.cssContainingText('.ui-grid-header-cell-label', 'Locus ID'));

  this.orderListAction = element(by.id('actionsButton'));
  this.resendCustomerEmail = element(by.css('#resendCustomerEmail a'));
  this.resendPartnerEmail = element(by.css('#resendPartnerEmail a'));

  this.getRowCount = function () {
    return this.rowCount.then(function (rows) {
      return rows.length;
    });
  };

  this.assertResultsLength = function (size) {
    element.all(by.repeater('row in renderedRows')).then(function (rows) {
      expect(rows.length).toBeGreaterThan(size);
    });
  };

  this.searchAndVerifyResult = function (query, assertion) {
    assertion = assertion || query;
    utils.clear(support.logSearchField);
    utils.sendKeys(support.logSearchField, query);
    utils.click(support.logSearchBtn);
    utils.expectIsDisplayed(element(by.cssContainingText('.ui-grid .ui-grid-row .ui-grid-cell-contents', assertion)));
  };

  this.retrieveLocusId = function () {
    return this.locusId.getText().then(function (locusId) {
      expect(locusId).not.toBeNull();
      return locusId;
    });
  };

};

module.exports = SupportPage;
