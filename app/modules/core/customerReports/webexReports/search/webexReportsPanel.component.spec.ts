import testModule from './index';
import * as moment from 'moment';

describe('Component: custWebexReportsPanel', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', '$state', 'SearchService', 'Notification');

    initSpies.apply(this);
  });

  beforeAll(function () {
    this.overview = { status_ : 'In Proccess', meetingNumber: 12345678, meetingName: 'webexMeeting' };
    this.webexMeeting = {
      features: { chat: '1', flash: null },
      session: { endTime: '', startTime: '2017-06-19 07:40:43', createTime: '' },
      connection: { regularTelephony: 'no', hybridTelephony: 'yes' },
    };
  });

  function initComponent() {
    this.$state.current.data = {};
    this.compileComponent('custWebexReportsPanel', {});
    this.$scope.$apply();
  }

  function utdDateByTimezone(date) {
    const offset = '+08:00';
    return moment.utc(date).utcOffset(offset).format('MMMM Do, YYYY h:mm:ss A');
  }

  function initSpies() {
    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.SearchService, 'getStorage').and.returnValue(this.overview);
    spyOn(this.SearchService, 'getMeeting').and.returnValue(this.$q.resolve());
    spyOn(this.SearchService, 'utcDateByTimezone').and.callFake(utdDateByTimezone);
  }

  it('Should call $state.go', function () {
    this.SearchService.getMeeting.and.returnValue(this.$q.resolve(this.webexMeeting));

    initComponent.call(this);
    this.view.find('.sessionMore').click();

    expect(this.$state.go).toHaveBeenCalled();
  });

  it('Should show correct meeting name', function () {
    this.SearchService.getMeeting.and.returnValue(this.$q.reject({ status: 404 }));

    initComponent.call(this);
    expect(this.view.find('.feature-name').get(0)).toContainText(this.overview.meetingName);
  });
});
