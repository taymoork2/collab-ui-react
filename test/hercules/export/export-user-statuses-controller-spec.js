'use strict';

describe('ExportUserStatusesController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Authinfo, service, controller, $scope, $httpBackend, UssService, UiStats;

  beforeEach(inject(function (_$controller_, _$httpBackend_, _UiStats_) {

    $httpBackend = _$httpBackend_;
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    $scope = {
      $watch: sinon.stub()
    };

    UiStats = _UiStats_;

    Authinfo = {
      getServices: function () {
        return [{
          "ciName": "squared-fusion-cal",
          "displayName": "myService"
        }];
      },
      getOrgId: sinon.stub().returns("5632-f806-org")
    };

    controller = _$controller_('ExportUserStatusesController', {
      Authinfo: Authinfo,
      UiStats: UiStats,
      UssService: UssService,
      $scope: $scope
    });
  }));

  it('column title for service name is based on authinfo displayname', function () {
    $scope.selectedServiceId = "squared-fusion-cal";
    $scope.getHeader();
    expect($scope.loading).toBe(true);
    expect($scope.getHeader()).toEqual(["id", "email", "myService state", "message"]);
  });

  it('export multiple users', function () {

    $scope.selectedServiceId = "squared-fusion-cal";

    var uss_request = "https://uss-integration.wbx2.com/uss/api/v1/userStatuses/summary";
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

    uss_request = "https://uss-integration.wbx2.com/uss/api/v1/userStatuses?serviceId=squared-fusion-cal&limit=1000";
    $httpBackend
      .when('GET', uss_request)
      .respond({
        "userStatuses": [{
          "userId": "111",
          "orgId": "cisco",
          "serviceId": "squared-fusion-cal",
          "entitled": false,
          "state": "whatever1"
        }, {
          "userId": "222",
          "orgId": "cisco",
          "serviceId": "squared-fusion-cal",
          "entitled": true,
          "state": "notActivated"
        }, {
          "userId": "333",
          "orgId": "cisco",
          "serviceId": "squared-fusion-cal",
          "entitled": true,
          "state": "whatever3"
        }]
      });

    var ciUserFirstRequest = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111" and id eq "222"';
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
    $scope.numberOfUsersPrCiRequest = 2;

    $scope.test = true; // TODO: Remove special handling for unit test !!!

    var promise = $scope.exportCSV();

    $httpBackend.flush();
    promise.then(handler);

    expect(handler).toHaveBeenCalledWith([{
      id: '111',
      userName: 'sparkuser1@gmail.com',
      //entitled: 'Not Entitled',
      state: 'whatever1',
      message: '-'
    }, {
      id: '222',
      userName: 'sparkuser2@gmail.com',
      //entitled: 'Entitled',
      state: 'Pending Activation',
      message: '-'
    }, {
      id: '333',
      userName: 'sparkuser3@gmail.com',
      //entitled: 'Entitled',
      state: 'whatever3',
      message: '-'
    }]);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});
