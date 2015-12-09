'use strict';

describe('ExportUserStatusesController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Authinfo, service, controller, $scope, $httpBackend, UssService, UiStats;

  beforeEach(function () {
    module(function ($provide) {
      Authinfo = {
        getServices: function () {
          return [{
            "ciName": "squared-fusion-cal",
            "displayName": "myService"
          }];
        },
        getOrgId: sinon.stub().returns("5632-f806-org")
      };
      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(function (_$controller_, _$httpBackend_, _UiStats_) {
    $httpBackend = _$httpBackend_;
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    $scope = {
      $watch: sinon.stub()
    };

    UiStats = _UiStats_;

    controller = _$controller_('ExportUserStatusesController', {
      serviceId: 'squared-fusion-cal',
      Authinfo: Authinfo,
      UiStats: UiStats,
      UssService: UssService,
      $scope: $scope
    });
  }));

  it('column title for service name is based on authinfo displayname', function () {
    controller.selectedServiceId = "squared-fusion-cal";
    controller.getHeader();
    expect(controller.loading).toBe(true);
    expect(controller.getHeader()).toEqual(["User", "Connector", "myService State", "Message"]);
  });

  it('export multiple users', function () {

    controller.selectedServiceId = "squared-fusion-cal";

    var uss_request = "https://uss-integration.wbx2.com/uss/api/v1/userStatuses/summary?orgId=5632-f806-org";
    $httpBackend
      .when('GET', uss_request)
      .respond({
        "orgId": "5632-f806-org",
        "summary": [{
          "serviceId": "squared-fusion-cal",
          "total": 1,
          "notActivated": 2,
          "activated": 3,
          "error": 4,
          "deactivated": 5,
          "notEntitled": 6
        }]
      });

    uss_request = "https://uss-integration.wbx2.com/uss/api/v1/userStatuses?serviceId=squared-fusion-cal&limit=100000&orgId=5632-f806-org";
    $httpBackend
      .when('GET', uss_request)
      .respond({
        "userStatuses": [{
          "userId": "111",
          "orgId": "cisco",
          "serviceId": "squared-fusion-cal",
          "entitled": false,
          "state": "whatever1",
          "connectorId": "c_cal@aaa"
        }, {
          "userId": "222",
          "orgId": "cisco",
          "serviceId": "squared-fusion-cal",
          "entitled": true,
          "state": "notActivated",
          "connectorId": "c_cal@aaa"
        }, {
          "userId": "333",
          "orgId": "cisco",
          "serviceId": "squared-fusion-cal",
          "entitled": true,
          "state": "whatever3",
          "connectorId": "c_cal@bbb"
        }]
      });

    var connectorRequest1 = "https://hercules-integration.wbx2.com/v1/organizations/5632-f806-org/connectors/c_cal@aaa";
    $httpBackend
      .when('GET', connectorRequest1)
      .respond({
        "id": "c_cal@080716C6",
        "cluster_id": "69227262-1efe-11e5-9556-005056001397",
        "display_name": "Calendar Connector",
        "host_name": "myExpressway1.cisco.com",
        "cluster_name": "gwydlvm1397",
        "connector_type": "c_cal",
        "version": "8.6-1.0.1435",
        "serial": "080716C6",
        "status": {
          "state": "running",
          "alarms": [],
          "connectorStatus": {
            "services": {
              "onprem": [{
                "state": "ok",
                "version": "2013",
                "type": "exchange",
                "stateDescription": "Exchange server ok.",
                "address": "abc"
              }],
              "cloud": [{
                "mercury": {
                  "dataCenter": "CFA",
                  "route": "device.92cefb15ba7847119d75ce3018d82cf9"
                },
                "stateDescription": "Mercury ok.",
                "state": "ok",
                "address": "https://locus-integration.wbx2.com/locus/api/v1/devices/92cefb15-ba78-4711-9d75-ce3018d82cf9",
                "httpProxy": null,
                "type": "mercury"
              }, {
                "mercury": null,
                "stateDescription": "cal_service ok.",
                "state": "ok",
                "address": "https://calendar-monitor-integration.wbx2.com/v1",
                "httpProxy": null,
                "type": "cal_service"
              }]
            },
            "users": {
              "totalSubscribedCount": 4,
              "totalFaultyCount": 0,
              "assignedUserCount": 4
            },
            "operational": true
          },
          "startTimestamp": "2015-06-30T08:23:15Z"
        },
        "registered_by": "f0169cc1-1c09-4a7d-b6d4-0bd63801af61",
        "provisioning": {}
      });

    var connectorRequest2 = "https://hercules-integration.wbx2.com/v1/organizations/5632-f806-org/connectors/c_cal@bbb";
    $httpBackend
      .when('GET', connectorRequest2)
      .respond({
        "id": "c_cal@080716C6",
        "cluster_id": "69227262-1efe-11e5-9556-005056001397",
        "display_name": "Calendar Connector",
        "host_name": "myExpressway2.cisco.com",
        "cluster_name": "gwydlvm1397",
        "connector_type": "c_cal",
        "version": "8.6-1.0.1435",
        "serial": "080716C6",
        "status": {
          "state": "running",
          "alarms": [],
          "connectorStatus": {
            "services": {
              "onprem": [{
                "state": "ok",
                "version": "2013",
                "type": "exchange",
                "stateDescription": "Exchange server ok.",
                "address": "abc"
              }],
              "cloud": [{
                "mercury": {
                  "dataCenter": "CFA",
                  "route": "device.92cefb15ba7847119d75ce3018d82cf9"
                },
                "stateDescription": "Mercury ok.",
                "state": "ok",
                "address": "https://locus-integration.wbx2.com/locus/api/v1/devices/92cefb15-ba78-4711-9d75-ce3018d82cf9",
                "httpProxy": null,
                "type": "mercury"
              }, {
                "mercury": null,
                "stateDescription": "cal_service ok.",
                "state": "ok",
                "address": "https://calendar-monitor-integration.wbx2.com/v1",
                "httpProxy": null,
                "type": "cal_service"
              }]
            },
            "users": {
              "totalSubscribedCount": 4,
              "totalFaultyCount": 0,
              "assignedUserCount": 4
            },
            "operational": true
          },
          "startTimestamp": "2015-06-30T08:23:15Z"
        },
        "registered_by": "f0169cc1-1c09-4a7d-b6d4-0bd63801af61",
        "provisioning": {}
      });

    var ciUserFirstRequest = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111" or id eq "222"';
    $httpBackend
      .when('GET', ciUserFirstRequest)
      .respond({
        "Resources": [{
          "id": "111",
          "userName": "sparkuser1@gmail.com"
        }, {
          "id": "222",
          "userName": "sparkuser2@gmail.com"
        }]
      });

    var ciUserSecondRequest = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "333"';
    $httpBackend
      .when('GET', ciUserSecondRequest)
      .respond({
        "Resources": [{
          "id": "333",
          "userName": "sparkuser3@gmail.com"
        }]
      });

    var handler = jasmine.createSpy('success');
    controller.numberOfUsersPrCiRequest = 2;

    controller.test = true; // TODO: Remove special handling for unit test !!!

    var promise = controller.exportCSV();

    $httpBackend.flush();
    promise.then(handler);

    expect(handler).toHaveBeenCalledWith([{
      userName: 'sparkuser1@gmail.com',
      connector: '?',
      state: 'whatever1',
      message: '-'
    }, {
      userName: 'sparkuser2@gmail.com',
      connector: '?',
      state: 'Pending Activation',
      message: '-'
    }, {
      userName: 'sparkuser3@gmail.com',
      connector: 'myExpressway2.cisco.com',
      state: 'whatever3',
      message: '-'
    }]);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});
