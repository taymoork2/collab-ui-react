import testModule from './index';
import * as moment from 'moment-timezone';

describe('Component: webexReportsSearch', () => {
  beforeAll(function () {
    this.meetingSearch = [
      {
        conferenceID: 50190706068695610,
        status: 2,
        meetingName: 'mcmeeting_20161017075425',
        endTime_: '2017-08-09 10:30:33',
        StartTime_: '2017-08-07 10:30:33',
      },
      {
        conferenceID: 1011112787,
        status: 1,
        meetingName: 'zhan xuguangs Webex Meeting',
        endTime_: '2017-08-09 10:30:33',
        StartTime_: '2017-08-07 10:30:33',
      },
    ];
    this.item = {
      conferenceID: 50190706068695610,
      status: 2,
      meetingName: 'mcmeeting_20161017075425',
    };
    this.gridApi = {
      selection: {
        on: {
          rowSelectionChanged: [
            {
              entity: {
                conferenceID: 50190706068695610,
                status: 2,
                siteID: 700243772,
              },
            },
          ],
        },
      },
    };
    this.input = 'input#searchFilter';
    this.gridSection = '.ui-grid-canvas .ui-grid-row';
    this.isDatePickerShow = '.data-icon-i';
    this.endDatePicker = '.end-time .cs-datapicker-normal';
    this.startDatePicker = '.start-time .cs-datapicker-normal';
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$state', '$timeout', '$translate', 'SearchService', 'Notification');
    moment.tz.setDefault('America/Chicago');

    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.SearchService, 'getMeetings').and.returnValue(this.$q.resolve());
  }

  function initComponent() {
    this.compileComponent('dgcWebexReportsSearch');
    this.$scope.$apply();
  }

  it('should show the correct data for the grid when search with enter keyup', function () {
    const $event = { type: 'keyup', keyCode: 13, which: 13 };
    this.SearchService.getMeetings.and.returnValue(this.$q.resolve(this.meetingSearch));
    initComponent.call(this);

    this.view.find(this.input).val('355602502').change().triggerHandler($event);
    expect(this.controller.gridData.length).toBe(2);

    this.view.find(this.input).val('355602502').change().triggerHandler('blur');
    expect(this.controller.storeData.searchStr).toEqual('355602502');
  });

  it('should show the correct data for the grid when search with email and then trigger blur event', function () {
    this.$timeout.flush();
    this.SearchService.getMeetings.and.returnValue(this.$q.resolve(this.meetingSearch));

    initComponent.call(this);
    this.view.find(this.input).val('zoncao@cisco.com').change().triggerHandler('blur');
    spyOn(this.controller.gridOptions, 'data').and.returnValue(this.controller.gridData);

    const fakeGridApi = {
      infiniteScroll: {
        dataLoaded: jasmine.createSpy('dataLoaded'),
        on: {
          needLoadMoreData: jasmine.createSpy('needLoadMoreData'),
        },
      },
      selection: {
        on: {
          rowSelectionChanged: (() => {

          }),
        },
      },
    };

    this.controller.gridOptions.onRegisterApi(fakeGridApi);
  });

  it('should show the empty data for the grid when search with incorrect email or incorrect meeting number then trigger blur event', function () {
    spyOn(this.$translate, 'instant').and.returnValue('Please enter the correct email or meeting number');

    initComponent.call(this);
    this.controller.errMsg = {};
    this.view.find(this.input).val('23423432ad').change().triggerHandler('blur');
    expect(this.controller.errMsg.search).toEqual('<i class="icon icon-warning"></i> Please enter the correct email or meeting number');
  });

  it('should updata when change date', function () {
    spyOn(this.$translate, 'instant').and.returnValue('The start date must not be greater than the end date');

    this.SearchService.getMeetings.and.returnValue(this.$q.resolve(this.meetingSearch));

    initComponent.call(this);
    this.view.find(this.input).val('355602502').change().triggerHandler('blur');

    this.view.find(this.isDatePickerShow).change().click();
    this.view.find(this.endDatePicker).change().click();
    this.view.find(this.endDatePicker).next().find('.day.today').change().click();
    expect(this.controller.errMsg.datePicker).toEqual('');

    this.view.find(this.endDatePicker).change().click();
    this.view.find(this.endDatePicker).next().find('.day.today').parent().prev().find('.day').change().click();
    expect(this.controller.gridData.length).toBe(2);

    this.view.find(this.endDatePicker).change().click();
    this.view.find(this.endDatePicker).next().find('.day.today').parent().prev().find('.day').change().click();
    expect(this.controller.gridData.length).toBe(2);

    this.controller.errMsg = {};
    this.controller.endDate = '2017-06-01';
    this.controller.startDate = '2017-06-05';
    this.controller.onChangeDate();
    this.controller.searchStr = '355602502';
    this.controller.startSearch();
    expect(this.controller.errMsg.datePicker).toEqual('<i class="icon icon-warning"></i> The start date must not be greater than the end date');
  });

  it('should notify in message for non 200 http status', function() {
    this.SearchService.getMeetings.and.returnValue(this.$q.reject({ status: 404 }));

    initComponent.call(this);
    this.view.find(this.input).val('23423432').change().triggerHandler('blur');
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('should change timeZone: onChangeTz', function () {
    initComponent.call(this);
    this.controller.gridData = this.meetingSearch;
    this.controller.onChangeTz('Asia/Shanghai');
    expect(this.controller.gridData[0].startTime_).toBeDefined();
  });

  it('should call $state.go', function () {
    initComponent.call(this);
    this.controller.showDetail({ id: 111 });
    expect(this.$state.go).toHaveBeenCalled();
  });
});
