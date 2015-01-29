'use strict'

var SupportPage = function(){

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

  this.emailAddress = element(by.binding('emailAddress'));
  this.locusId = element(by.binding('locusId'));
  this.callStart = element(by.binding('callStart'));

  this.callInfoIcon = element(by.id('callInfo-icon'));
  this.downloadCallflowChartsIcon = element(by.id('download-callflowCharts-icon'));
  this.closeCallInfo = element(by.id('closeCallInfo'));
  this.closeCallFlow = element(by.id('closeCallFlow'));

  this.locusIdSort = element(by.css('.colt1'));

  this.getRowCount = function() {
    return this.rowCount.then(function(rows){
      return rows.length;
    });
  };

  this.assertResultsLength = function(size) {
    //utils.expectIsDisplayed(element(by.binding('row.entity')));
    element.all(by.repeater('row in renderedRows')).then(function(rows) {
      console.log(rows.length);
      expect(rows.length).toBeGreaterThan(size);
    });
  };

};

module.exports = SupportPage;