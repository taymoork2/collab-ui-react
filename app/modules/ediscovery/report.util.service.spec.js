'use strict';

describe('Service: ReportUtilService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service;

  beforeEach(inject(function (_ReportUtilService_) {
    Service = _ReportUtilService_;
  }));

  describe('tweaking', function () {

    it('report completed, failed or aborted will be marked as done', function () {
      var report = {
        state: "RUNNNING"
      };

      var tweakedReport = Service.tweakReport(report);
      expect(tweakedReport.timeoutDetected).toBe(false);
      expect(tweakedReport.hasExpired).toBe(false);
      expect(tweakedReport.isDone).toBe(false);

      var report = {
        state: "FAILED"
      };
      var tweakedReport = Service.tweakReport(report);
      expect(tweakedReport.isDone).toBe(true);

      var report = {
        state: "ABORTED"
      };
      var tweakedReport = Service.tweakReport(report);
      expect(tweakedReport.isDone).toBe(true);
    });

    it('report not updated last x minutes will be marked as timed out', function () {
      Service.setTimeoutInSeconds = 180;

      var report = {
        state: "RUNNING",
        lastUpdatedTime: moment().subtract(150, 'seconds').utc().format()
      };
      expect(Service.tweakReport(report).timeoutDetected).toBe(false);

      var report = {
        state: "RUNNING",
        lastUpdatedTime: moment().subtract(200, 'seconds').utc().format()
      };
      expect(Service.tweakReport(report).timeoutDetected).toBe(true);
    });

    it('report reaching expiry time will be marked as expired', function () {
      var report = {
        state: "COMPLETED",
        expiryTime: moment().subtract(1, 'minute').utc().format()
      };
      expect(Service.tweakReport(report).hasExpired).toBe(true);
    });

    it('report completed and not expired will be marked as downloadable', function () {
      var report = {
        state: "COMPLETED",
        expiryTime: moment().add(1, 'minute').utc().format()
      };
      expect(Service.tweakReport(report).hasExpired).toBe(false);
      expect(Service.tweakReport(report).canBeDownloaded).toBe(true);

    });

    it('report accepted or running will be marked as cancable', function () {
      var report = {
        state: "COMPLETED"
      };
      expect(Service.tweakReport(report).canBeCancelled).toBe(false);

      var report = {
        state: "ACCEPTED"
      };
      expect(Service.tweakReport(report).canBeCancelled).toBe(true);

      var report = {
        state: "RUNNING"
      };
      expect(Service.tweakReport(report).canBeCancelled).toBe(true);

    });

  });

});
