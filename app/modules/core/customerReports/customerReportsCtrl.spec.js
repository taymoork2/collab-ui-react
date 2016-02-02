'use strict';

describe('Controller: Customer Reports Ctrl', function () {
  var controller, $scope, $stateParams, $q, $translate, $timeout, Log, Authinfo, Config, CustomerReportService, DummyCustomerReportService, CustomerGraphService, WebexReportService, WebExUtilsFact, Userservice;
  var activeUsersSort = ['userName', 'numCalls', 'sparkMessages', 'totalActivity'];
  var ABORT = 'ABORT';
  var REFRESH = 'refresh';
  var SET = 'set';
  var EMPTY = 'empty';

  var dummyData = getJSONFixture('core/json/partnerReports/dummyReportData.json');
  var activeData = getJSONFixture('core/json/customerReports/activeUser.json');
  var responseActiveData = activeData.activeResponse;
  var responseMostActiveData = activeData.mostActiveResponse;
  var roomData = getJSONFixture('core/json/customerReports/roomData.json');
  var fileData = getJSONFixture('core/json/customerReports/fileData.json');
  var mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
  var metricsData = getJSONFixture('core/json/customerReports/callMetrics.json');
  var dummyMetrics = angular.copy(metricsData);
  dummyMetrics.dummy = true;

  var headerTabs = [{
    title: 'reportsPage.engagement',
    state: 'reports'
  }, {
    title: 'reportsPage.sparkReports',
    state: 'devReports'
  }];
  var timeOptions = [{
    value: 0,
    label: 'reportsPage.week',
    description: 'reportsPage.week2'
  }, {
    value: 1,
    label: 'reportsPage.month',
    description: 'reportsPage.month2'
  }, {
    value: 2,
    label: 'reportsPage.threeMonths',
    description: 'reportsPage.threeMonths2'
  }];

  beforeEach(module('Core'));

  describe('CustomerReportsCtrl - Expected Responses', function () {
    beforeEach(inject(function ($rootScope, $controller, _$stateParams_, _$q_, _$translate_, _$timeout_, _Log_, _Config_, _CustomerReportService_, _DummyCustomerReportService_, _CustomerGraphService_) {
      $scope = $rootScope.$new();
      $stateParams = _$stateParams_;
      $q = _$q_;
      $translate = _$translate_;
      $timeout = _$timeout_;
      Log = _Log_;
      Config = _Config_;
      CustomerReportService = _CustomerReportService_;
      DummyCustomerReportService = _DummyCustomerReportService_;
      CustomerGraphService = _CustomerGraphService_;

      // Service Spies
      spyOn(CustomerGraphService, 'setActiveUsersGraph').and.returnValue({
        'dataProvider': dummyData.activeUser.one
      });
      spyOn(CustomerGraphService, 'setAvgRoomsGraph').and.returnValue({
        'dataProvider': roomData.response
      });
      spyOn(CustomerGraphService, 'setFilesSharedGraph').and.returnValue({
        'dataProvider': fileData.response
      });
      spyOn(CustomerGraphService, 'setMediaQualityGraph').and.returnValue({
        'dataProvider': mediaData.response
      });
      spyOn(CustomerGraphService, 'setMetricsGraph').and.returnValue({
        'dataProvider': metricsData.dataProvider
      });

      spyOn(DummyCustomerReportService, 'dummyActiveUserData').and.returnValue(dummyData.activeUser.one);
      spyOn(DummyCustomerReportService, 'dummyAvgRoomData').and.returnValue(dummyData.avgRooms.one);
      spyOn(DummyCustomerReportService, 'dummyFilesSharedData').and.returnValue(dummyData.filesShared.one);
      spyOn(DummyCustomerReportService, 'dummyMediaData').and.returnValue(dummyData.mediaQuality.one);
      spyOn(DummyCustomerReportService, 'dummyMetricsData').and.returnValue(dummyMetrics);

      spyOn(CustomerReportService, 'getActiveUserData').and.returnValue($q.when(responseActiveData));
      spyOn(CustomerReportService, 'getMostActiveUserData').and.returnValue($q.when(responseMostActiveData));
      spyOn(CustomerReportService, 'getAvgRoomData').and.returnValue($q.when(roomData.response));
      spyOn(CustomerReportService, 'getFilesSharedData').and.returnValue($q.when(fileData.response));
      spyOn(CustomerReportService, 'getMediaQualityData').and.returnValue($q.when(mediaData.response));
      spyOn(CustomerReportService, 'getCallMetricsData').and.returnValue($q.when(metricsData));

      // Webex Requirements
      WebexReportService = {
        initReportsObject: function (input) {}
      };

      WebExUtilsFact = {
        isSiteSupportsIframe: function (url) {
          var defer = $q.defer();
          defer.resolve({
            siteUrl: url
          });
          return defer.promise;
        }
      };

      Authinfo = {
        getPrimaryEmail: function () {
          return "some@email.com";
        },
        getConferenceServicesWithoutSiteUrl: function () {
          return [{
            license: {
              siteUrl: 'fakesite1'
            }
          }, {
            license: {
              siteUrl: 'fakesite2'
            }
          }, {
            license: {
              siteUrl: 'fakesite3'
            }
          }];
        },

        getOrgId: function () {
          return '1';
        },
        isPartner: function () {
          return false;
        }
      };

      Userservice = {
        getUser: function (user, innerFunction) {
          expect(user).toBe('me');
        }
      };

      controller = $controller('CustomerReportsCtrl', {
        $stateParams: $stateParams,
        $scope: $scope,
        $q: $q,
        $translate: $translate,
        Log: Log,
        Config: Config,
        CustomerReportService: CustomerReportService,
        DummyCustomerReportService: DummyCustomerReportService,
        CustomerGraphService: CustomerGraphService,
        WebexReportService: WebexReportService,
        WebExUtilsFact: WebExUtilsFact,
        Userservice: Userservice
      });
      $scope.$apply();
    }));

    describe('Initializing Controller', function () {
      it('should be created successfully and all expected calls completed', function () {
        expect(controller).toBeDefined();
        $timeout(function () {
          expect(CustomerGraphService.setActiveUsersGraph).toHaveBeenCalled();
          expect(CustomerGraphService.setAvgRoomsGraph).toHaveBeenCalled();

          expect(DummyCustomerReportService.dummyActiveUserData).toHaveBeenCalledWith(timeOptions[0]);
          expect(DummyCustomerReportService.dummyAvgRoomData).toHaveBeenCalledWith(timeOptions[0]);
          expect(DummyCustomerReportService.dummyFilesSharedData).toHaveBeenCalledWith(timeOptions[0]);
          expect(DummyCustomerReportService.dummyMediaData).toHaveBeenCalledWith(timeOptions[0]);
          expect(DummyCustomerReportService.dummyMetricsData).toHaveBeenCalled();

          expect(CustomerReportService.getActiveUserData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getMostActiveUserData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getAvgRoomData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getFilesSharedData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getMediaQualityData).toHaveBeenCalledWith(timeOptions[0]);
          expect(CustomerReportService.getCallMetricsData).toHaveBeenCalledWith(timeOptions[0]);
        }, 30);
      });

      it('should set all page variables', function () {
        expect(controller.showWebexTab).toBeFalsy();

        expect(controller.activeUserDescription).toEqual('activeUsers.customerPortalDescription');
        expect(controller.mostActiveTitle).toEqual('activeUsers.mostActiveUsers');
        expect(controller.activeUserStatus).toEqual(REFRESH);
        expect(controller.displayMostActive).toBeFalsy();
        expect(controller.mostActiveUsers).toEqual([]);
        expect(controller.activeUserReverse).toBeTruthy();
        expect(controller.activeUsersTotalPages).toEqual(0);
        expect(controller.activeUserCurrentPage).toEqual(0);
        expect(controller.activeUserPredicate).toEqual(activeUsersSort[3]);
        expect(controller.activeButton).toEqual([1, 2, 3]);

        expect(controller.avgRoomsDescription).toEqual('avgRooms.avgRoomsDescription');
        expect(controller.avgRoomStatus).toEqual(REFRESH);
        expect(controller.filesSharedDescription).toEqual('filesShared.filesSharedDescription');
        expect(controller.filesSharedStatus).toEqual(REFRESH);
        expect(controller.mediaQualityStatus).toEqual(REFRESH);
        expect(controller.deviceDescription).toEqual('registeredEndpoints.description');
        expect(controller.deviceStatus).toEqual(REFRESH);
        expect(controller.metricsDescription).toEqual('callMetrics.customerDescription');
        expect(controller.metricStatus).toEqual(REFRESH);
        expect(controller.metrics).toEqual({});

        expect(controller.headerTabs).toEqual(headerTabs);
        expect(controller.timeOptions).toEqual(timeOptions);
        expect(controller.timeSelected).toEqual(timeOptions[0]);
      });
    });

    describe('filter changes', function () {
      it('All graphs should update on time filter changes', function () {
        controller.timeSelected = timeOptions[1];
        controller.timeUpdate();
        expect(controller.timeSelected).toEqual(timeOptions[1]);

        expect(DummyCustomerReportService.dummyActiveUserData).toHaveBeenCalledWith(timeOptions[1]);
        expect(DummyCustomerReportService.dummyAvgRoomData).toHaveBeenCalledWith(timeOptions[1]);
        expect(DummyCustomerReportService.dummyFilesSharedData).toHaveBeenCalledWith(timeOptions[1]);
        expect(DummyCustomerReportService.dummyMediaData).toHaveBeenCalledWith(timeOptions[1]);
        expect(DummyCustomerReportService.dummyMetricsData).toHaveBeenCalled();

        expect(CustomerReportService.getActiveUserData).toHaveBeenCalledWith(timeOptions[1]);
        expect(CustomerReportService.getAvgRoomData).toHaveBeenCalledWith(timeOptions[1]);
        expect(CustomerReportService.getFilesSharedData).toHaveBeenCalledWith(timeOptions[1]);
        expect(CustomerReportService.getMediaQualityData).toHaveBeenCalledWith(timeOptions[1]);
        expect(CustomerReportService.getCallMetricsData).toHaveBeenCalledWith(timeOptions[1]);
      });
    });

    describe('helper functions', function () {
      describe('activePage', function () {
        it('should return true when called with the same value as activeUserCurrentPage', function () {
          controller.activeUserCurrentPage = 1;
          expect(controller.activePage(controller.activeUserCurrentPage)).toBeTruthy();
        });

        it('should return false when called with a different value as activeUserCurrentPage', function () {
          expect(controller.activePage(7)).toBeFalsy();
        });
      });

      describe('changePage', function () {
        it('should change the value of activeUserCurrentPage', function () {
          controller.changePage(3);
          expect(controller.activeUserCurrentPage).toEqual(3);
        });
      });

      describe('isRefresh', function () {
        it('should return true when sent "refresh"', function () {
          expect(controller.isRefresh('refresh')).toBeTruthy();
        });

        it('should return false when sent "set" or "empty"', function () {
          expect(controller.isRefresh('set')).toBeFalsy();
          expect(controller.isRefresh('empty')).toBeFalsy();
        });
      });

      describe('isEmpty', function () {
        it('should return true when sent "empty"', function () {
          expect(controller.isEmpty('empty')).toBeTruthy();
        });

        it('should return false when sent "set" or "refresh"', function () {
          expect(controller.isEmpty('set')).toBeFalsy();
          expect(controller.isEmpty('refresh')).toBeFalsy();
        });
      });

      describe('mostActiveSort', function () {
        it('should sort by userName', function () {
          controller.mostActiveSort(0);
          expect(controller.activeUserPredicate).toBe(activeUsersSort[0]);
          expect(controller.activeUserReverse).toBeFalsy();
        });

        it('should sort by calls', function () {
          controller.mostActiveSort(1);
          expect(controller.activeUserPredicate).toBe(activeUsersSort[1]);
          expect(controller.activeUserReverse).toBeTruthy();
        });

        it('should sort by posts', function () {
          controller.mostActiveSort(2);
          expect(controller.activeUserPredicate).toBe(activeUsersSort[2]);
          expect(controller.activeUserReverse).toBeTruthy();
        });
      });

      describe('pageForward', function () {
        it('should change carousel button numbers', function () {
          controller.activeUsersTotalPages = 4;
          controller.activeUserCurrentPage = 1;

          controller.pageForward();
          expect(controller.activeButton[0]).toBe(1);
          expect(controller.activeButton[1]).toBe(2);
          expect(controller.activeButton[2]).toBe(3);
          expect(controller.activeUserCurrentPage).toBe(2);

          controller.pageForward();
          expect(controller.activeButton[0]).toBe(2);
          expect(controller.activeButton[1]).toBe(3);
          expect(controller.activeButton[2]).toBe(4);
          expect(controller.activeUserCurrentPage).toBe(3);
        });
      });

      describe('pageBackward', function () {
        it('should change carousel button numbers', function () {
          controller.activeUsersTotalPages = 4;
          controller.activeButton[0] = 2;
          controller.activeButton[1] = 3;
          controller.activeButton[2] = 4;
          controller.activeUserCurrentPage = 3;

          controller.pageBackward();
          expect(controller.activeButton[0]).toBe(1);
          expect(controller.activeButton[1]).toBe(2);
          expect(controller.activeButton[2]).toBe(3);
          expect(controller.activeUserCurrentPage).toBe(2);

          controller.pageBackward();
          expect(controller.activeButton[0]).toBe(1);
          expect(controller.activeButton[1]).toBe(2);
          expect(controller.activeButton[2]).toBe(3);
          expect(controller.activeUserCurrentPage).toBe(1);
        });
      });
    });

    describe('webex tests', function () {
      it('should show engagement as well as webex reports as true', function () {
        expect(controller.showEngagement).toEqual(true);
        expect(controller.showWebexReports).toEqual(false);
      });

      it('should not have anything in the dropdown for webex reports', function () {
        expect($scope.webexOptions.length).toBe(0);
      });
    });
  });
});
