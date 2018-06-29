import moduleName from './index';
import { SearchStorage } from './partner-meeting.enum';

describe('Component: DgcPartnerTab', () => {
  beforeAll(function() {
    this.meetingDetail = {
      meetingBasicInfo: {
        status: 2,
        duration: 11641,
        endTime: 1502270705000,
        numberOfParticipants: 1,
        startTime: 1502259064000,
        meetingName: 'Felix cao',
        meetingNumber: '150912949',
        createdTime: 1484789489000,
        conferenceId: '69162350665578622',
      },
      features: { chat: null, poll: 1, appShare: 1 },
      connection: { voIP: 'yes', video: 'no', nbr2: 'yes' },
      sessions: [{ sessionType: '4', duration: 4000 }],
    };
    this.nameSection = '.meeting-room-name h3';
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$q', 'FeatureToggleService', 'PartnerSearchService', 'WebexReportsUtilService');
    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.WebexReportsUtilService, 'isPartnerReportPage').and.returnValue(true);
    spyOn(this.PartnerSearchService, 'getMeetingDetail').and.returnValue(this.$q.resolve());
  }

  it('should get correct meetingName', function () {
    this.PartnerSearchService.getMeetingDetail.and.returnValue(this.$q.resolve(this.meetingDetail));
    this.compileComponent('dgcPartnerTab');

    expect(this.view.find(this.nameSection)).toHaveText('Felix cao');
  });

  it('should get Server time when the meeting status eq 1', function () {
    this.meetingDetail.meetingBasicInfo.status = 1;
    this.PartnerSearchService.getMeetingDetail.and.returnValue(this.$q.resolve(this.meetingDetail));
    spyOn(this.PartnerSearchService, 'getServerTime').and.returnValue(this.$q.resolve({ dateLong: 1513319154000 }));
    this.compileComponent('dgcPartnerTab');

    const meeting = this.WebexReportsUtilService.getStorage(SearchStorage.WEBEX_ONE_MEETING);
    expect(meeting.endTime).toBe(1513319154000);
  });

  it('should get the correct init data when call initCustomerRole', function () {
    this.WebexReportsUtilService.isPartnerReportPage.and.returnValue(false);
    spyOn(this.FeatureToggleService, 'diagnosticF8193UX3GetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'diagnosticF8194MeetingDetailsGetStatus').and.returnValue(this.$q.resolve(true));

    this.compileComponent('dgcPartnerTab');
    this.controller.initCustomerRole();
    expect(this.controller.isSupportExport).toBe(true);
    expect(this.controller.BACK_STATE).toBe('reports.webex-metrics.diagnostics');
  });

  it('should get the correct init data when call initPartnerRole', function () {
    spyOn(this.FeatureToggleService, 'diagnosticPartnerF8193TroubleshootingGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'diagnosticPartnerF8194MeetingDetailsGetStatus').and.returnValue(this.$q.resolve(true));

    this.compileComponent('dgcPartnerTab');
    this.controller.initPartnerRole();
    expect(this.controller.isSupportExport).toBe(true);
    expect(this.controller.BACK_STATE).toBe('partnerreports.tab.webexreports.diagnostics');
  });
});
