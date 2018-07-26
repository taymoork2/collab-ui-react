import moduleName from './index';

describe('Service: MeetingExportService', () => {
  beforeAll(function () {
    this.meetingDetails = _.cloneDeep(getJSONFixture('core/json/customerReports/meetingDetails.json'));
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$q', '$window', 'MeetingExportService', 'WebexReportsUtilService');
    this.WebexReportsUtilService.data = this.meetingDetails;
  });

  it('should generate report in string format after calling generateMeetingReport', function (this, done) {
    this.MeetingExportService.generateMeetingReport(this.WebexReportsUtilService)
      .then(res => {
        expect(res).toContain('Meeting Summary');
        _.defer(done);
      })
      .catch(fail);
    this.$scope.$apply();
  });

  it('should return the value found of the first property that matches the given key name', function () {
    const res = this.MeetingExportService.searchByKey('meetingName', this.meetingDetails);
    expect(res).toBe('Bob Ryan\'s Personal Room');
  });

  it('should return undefined after calling searchByKey when the case of target key dose not match the source object when ignoreCase not set to true', function () {
    const res = this.MeetingExportService.searchByKey('meetingname', this.meetingDetails);
    expect(res).toBeUndefined();
  });

  it('should return the value found of the first property when ignoreCase set to true', function () {
    const res = this.MeetingExportService.searchByKey('meetingname', this.meetingDetails, true);
    expect(res).toBe('Bob Ryan\'s Personal Room');
  });

  it('should return undefined value after calling searchByKey when target key does not exist in source object', function () {
    const res = this.MeetingExportService.searchByKey('notExistKey', this.meetingDetails, true);
    expect(res).toBeUndefined();
  });

  it('should return the camel case format of the input parameter when call normalizeKey', function () {
    const mockData = 'Host Name';
    const res = this.MeetingExportService.normalizeKey(mockData);
    expect(res).toBe('hostName');
  });

  it('should contain sharing sessions in generated MeetingReport', function (this, done) {
    this.MeetingExportService.generateMeetingReport(this.WebexReportsUtilService)
      .then(res => {
        expect(res).toContain('ApplicationSharing');
        _.defer(done);
      })
      .catch(fail);
    this.$scope.$apply();
  });

  it('should contain role change sessions in generated MeetingReport', function (this, done) {
    this.MeetingExportService.generateMeetingReport(this.WebexReportsUtilService)
      .then(res => {
        expect(res).toContain('Role Type');
        _.defer(done);
      })
      .catch(fail);
    this.$scope.$apply();
  });
});
