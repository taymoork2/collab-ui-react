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

  this.emailAddress = element(by.binding('log.emailAddress'));
  this.locusId = element(by.binding('log.locusId'));
  this.callStart = element(by.binding('log.callStart'));

  this.callInfoIcon = element(by.id('callInfo-icon'));
  this.closeCallInfo = element(by.id('closeCallInfo'));

  this.getRowCount = function() {
    return this.rowCount.then(function(rows){
      return rows.length;
    });
  };

};

module.exports = SupportPage;