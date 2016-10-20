(function () {
  'use strict';

  /* @ngInject */
  function ReportUtilService() {

    var timeoutInSeconds = 180;

    function setTimeoutInSeconds(s) {
      timeoutInSeconds = s;
    }

    function ReportUtil(report) {
      this.report = report;
      this.reportInProgress = function () {
        return this.report.state === 'ACCEPTED' || this.report.state === 'RUNNING' || this.report.state === 'STORING';
      };

      this.tooLongSinceLastUpdate = function () {
        var lastUpdated = moment(this.report.lastUpdatedTime);
        var duration = moment().diff(lastUpdated);
        return duration > timeoutInSeconds * 1000;
      };

      this.hasNotExpired = function () {
        return !this.report.expiryTime || moment(this.report.expiryTime) > moment();
      };

      this.isDone = function () {
        return this.report.state === 'COMPLETED' || this.report.state === 'FAILED' || this.report.state === 'ABORTED';
      };

      this.hasExpired = function () {
        return !this.hasNotExpired();
      };

      this.expiresIn = function () {
        var e = moment(this.report.expiryTime);
        return e.fromNow();
      };

    }

    function tweakReport(report) {
      if (report) {
        var reportUtil = new ReportUtil(report);
        report.timeoutDetected = reportUtil.reportInProgress() && reportUtil.tooLongSinceLastUpdate();
        if (report.state === 'FAILED' && !report.failureReason) {
          report.failureReason = 'UNEXPECTED_FAILURE';
        }
        report.isDone = reportUtil.isDone();
        report.canBeCancelled = reportUtil.reportInProgress();
        report.canBeDownloaded = report.state === "COMPLETED" && reportUtil.hasNotExpired();
        report.hasExpired = reportUtil.hasExpired();
        report.expiresIn = reportUtil.expiresIn();
      }
      return report;
    }

    return {
      tweakReport: tweakReport,
      setTimeoutInSeconds: setTimeoutInSeconds
    };
  }

  angular.module('Ediscovery')
    .service('ReportUtilService', ReportUtilService);
}());
