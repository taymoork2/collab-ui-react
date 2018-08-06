import moduleName from './index';

describe('Component: MeetingExport', () => {
  beforeAll(function() {
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$rootScope', '$timeout', 'MeetingExportService', 'Notification');
  });

  function initComponent(this) {
    this.compileComponent('meetingExport');
  }

  it('should assign a function definition to exportJSON function at init phase', function () {
    initComponent.call(this);
    expect(this.controller.exportJSON).toBeDefined();
  });

  it('should set the correct reportData corresponding to the return value of generateMeetingReport api', function () {
    const mockData = '{"Meeting Summary": {"Meeting Number": "340564904"}}';
    spyOn(this.MeetingExportService, 'generateMeetingReport').and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.exportJSON();
    this.$timeout.flush();
    expect(this.controller.reportData).toBe(mockData);
  });

  it('should clear reportData property after calling restoreToOriginalState', function () {
    const mockData = '{"Meeting Summary": {"Meeting Number": "340564904"}}';
    spyOn(this.MeetingExportService, 'generateMeetingReport').and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.exportJSON();
    this.$timeout.flush();
    this.controller.restoreToOriginalState();
    expect(this.controller.reportData).toBe('');
  });
});
