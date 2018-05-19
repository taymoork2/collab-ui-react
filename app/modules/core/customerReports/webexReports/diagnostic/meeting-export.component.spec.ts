import moduleName from './index';

describe('Component: dgcMeetingExport', () => {
  beforeAll(function() {
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$rootScope', '$timeout', 'MeetingExportService', 'Notification');
  });

  function initComponent(this) {
    this.compileComponent('dgcMeetingExport');
  }

  it('should assign a function definition to exportJSON function at init phase', function () {
    initComponent.call(this);
    expect(this.controller.exportJSON).toBeDefined();
  });

  it('should generate file url when export finished', function () {
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
