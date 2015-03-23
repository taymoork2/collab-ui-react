'use strict';

describe('Service: Partner Reports Service', function () {
  var $httpBackend, PartnerReportService, Config, Notification;
  var managedOrgs, activeUsers, dummyUrl;

  beforeEach(module('Core'));

  var testData = {
    'orgId': "db554da8-b5f5-44e2-84cb-90433040948e",
    'graphData': {
      'date': 'Feb 17, 2015',
      'count': 19,
      'totalUsers': 25,
      'percentage': 76
    },
    'chartData': {
      'userId': '57541132-0f02-445c-bcce-3b13bfb39085',
      'userName': '',
      'totalCalls': 3,
      totalPosts: 0,
      'orgName': 'Dummy Customer db554da8-b5f5-44e2-84cb-90433040948e',
      'orgId': 'db554da8-b5f5-44e2-84cb-90433040948e'
    }
  };
  var dateFormat = "MMM DD, YYYY";

  var activeUserData = getJSONFixture('core/json/partnerReports/fullActiveUserReport.json');
  var customerData = {
    "organizations": getJSONFixture('core/json/partnerReports/customerResponse.json')
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var Auth = jasmine.createSpyObj('Auth', ['handleStatus']);

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
    $provide.value("Auth", Auth);
  }));

  beforeEach(inject(function (_$httpBackend_, _PartnerReportService_, _Config_, _Notification_) {
    $httpBackend = _$httpBackend_;
    PartnerReportService = _PartnerReportService_;
    Config = _Config_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');

    managedOrgs = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';
    activeUsers = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/fullReports/timeCharts/managedOrgs/activeUsers?&intervalCount=1&intervalType=week&spanCount=7&spanType=day&cache=true';
    dummyUrl = 'modules/core/partnerReports/dummyData.json';
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(PartnerReportService).toBeDefined();
  });

  describe('Active User Services', function () {
    it('should return getMostRecentUpdate', function () {
      var date = PartnerReportService.getMostRecentUpdate();
      expect(date).toBe("");
    });

    it('should return getPreviousFilter', function () {
      var filter = PartnerReportService.getPreviousFilter();
      expect(filter).toBe(undefined);
    });

    it('should return getSavedActiveUsers', function () {
      var data = PartnerReportService.getSavedActiveUsers();
      expect(data).toEqual([]);
    });

    it('should return getCombinedActiveUsers', function () {
      var data = PartnerReportService.getCombinedActiveUsers();
      expect(data).toBe(undefined);
    });

    it('should return getCustomerList', function () {
      var data = PartnerReportService.getCustomerList();
      expect(data).toBe(null);
    });

    it('should return getUserName', function () {
      var name = PartnerReportService.getUserName('0', '0');
      expect(name).toBe("Dummy User 0");
    });

    it('should return getActiveUsersData for a week', function () {
      $httpBackend.whenGET(managedOrgs).respond(customerData);
      $httpBackend.whenGET(activeUsers).respond(activeUserData);
      $httpBackend.whenGET(dummyUrl).respond(activeUserData);
      PartnerReportService.getActiveUsersData({
        "id": 0
      }).then(function (response) {
        expect(response[0].orgId).toBe(testData.orgId);
        expect(response[0].graphData[0]).toEqual(testData.graphData);
        expect(response[0].chartData[0]).toEqual(testData.chartData);
        expect(response[0].totalPercentage).toBe(75);
        expect(response[0].totalActivity).toEqual(NaN);

        var date = PartnerReportService.getMostRecentUpdate();
        expect(date).toBe(moment().format(dateFormat));
        var filter = PartnerReportService.getPreviousFilter();
        expect(filter).toEqual({
          "id": 0
        });
        var data = PartnerReportService.getCustomerList();
        expect(data).toEqual(customerData.organizations);

        var savedUserData = PartnerReportService.getSavedActiveUsers();
        expect(savedUserData[0].orgId).toBe(testData.orgId);
        expect(savedUserData[0].graphData[0]).toEqual(testData.graphData);
        expect(savedUserData[0].chartData[0]).toEqual(testData.chartData);
        expect(savedUserData[0].totalPercentage).toBe(75);
        expect(savedUserData[0].totalActivity).toEqual(NaN);
      });
      $httpBackend.flush();
    });

  });
});
