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
      this.acceptedOrRunning = function () {
        return this.report.state === 'ACCEPTED' || this.report.state === 'RUNNING';
      };

      this.tooLongSinceLastUpdate = function () {
        var now = new Date().getTime();
        var lastUpdated = new Date(this.report.lastUpdatedTime).getTime();
        var duration = now - lastUpdated;
        return duration > timeoutInSeconds * 1000;
      };

      this.hasNotExpired = function () {
        return !this.report.expiryTime || this.currentTime() < new Date(this.report.expiryTime).getTime();
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

      this.currentTime = function () {
        return new Date().getTime();
      };
    }

    function tweakReport(report) {
      if (report) {
        var reportUtil = new ReportUtil(report);
        report.timeoutDetected = reportUtil.acceptedOrRunning() && reportUtil.tooLongSinceLastUpdate();
        if (report.state === 'FAILED' && !report.failureReason) {
          report.failureReason = 'UNEXPECTED_FAILURE';
        }
        report.isDone = reportUtil.isDone();
        report.canBeCancelled = report.state === 'ACCEPTED' || report.state === 'RUNNING';
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
