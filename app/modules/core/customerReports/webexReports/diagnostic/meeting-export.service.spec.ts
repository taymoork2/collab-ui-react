import moduleName from './index';

describe('Service: MeetingExportService', () => {
  beforeAll(function () {
    this.meetingDetails = _.cloneDeep(getJSONFixture('core/json/customerReports/meetingDetails.json'));
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$q', '$window', 'MeetingExportService', 'SearchService');
    this.SearchService.data = this.meetingDetails;
  });

  it('should generate blob url after calling generateMeetingReport', function () {
    this.MeetingExportService.generateMeetingReport()
      .then( res => expect(res).toContain('Meeting Summary'))
      .catch(fail);
  });

  it('should get correct meeting name after calling searchByKey', function () {
    const res = this.MeetingExportService.searchByKey('meetingName', this.meetingDetails);
    expect(res).toBe('Bob Ryan\'s Personal Room');
  });

  it('should not get correct meeting name after calling searchByKey when the case of target key dose not match the source object when ignoreCase not set to true', function () {
    const res = this.MeetingExportService.searchByKey('meetingname', this.meetingDetails);
    expect(res).toBeUndefined();
  });

  it('should get correct meeting name after calling searchByKey when the case of target key does not match the source object when ignoreCase set to true', function () {
    const res = this.MeetingExportService.searchByKey('meetingname', this.meetingDetails, true);
    expect(res).toBe('Bob Ryan\'s Personal Room');
  });

  it('should get undefined value after calling searchByKey when target key does not exist in source object', function () {
    const res = this.MeetingExportService.searchByKey('notExistKey', this.meetingDetails, true);
    expect(res).toBeUndefined();
  });

  it('should get result in camel case when call normalizeKey', function () {
    const mockData = 'Host Name';
    const res = this.MeetingExportService.normalizeKey(mockData);
    expect(res).toBeUndefined('hostName');
  });

  it('should get result in camel case when call normalizeKey', function () {
    const res = this.MeetingExportService.normalizeKey('Host Name');
    expect(res).toBeUndefined('hostName');
  });
});
