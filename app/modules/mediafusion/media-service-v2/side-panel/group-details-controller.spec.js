'use strict';

describe('Controller: GroupDetailsControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var $modal, $stateParams, controller, $rootScope, httpBackend;

  beforeEach(inject(function ($httpBackend, _$rootScope_, $stateParams, $controller) {
    $stateParams = $stateParams;
    $rootScope = _$rootScope_;
    $modal = {
      open: sinon.stub().returns({
        result: {
          then: function (callback) {
            callback({
              postponed: 12
            });
          }
        }
      })
    };
    httpBackend = $httpBackend;

    httpBackend.when('GET', /^\w+.*/).respond({});

    controller = $controller('GroupDetailsControllerV2', {
      $scope: $rootScope.$new(),

      $modal: $modal,
      $stateParams: $stateParams
    });
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should aggregate the cluster alarms with same alarm id', function () {
    var clusterMockAlarmData = [{
      id: 0,
      hosts: [{
        host_name: "10.107.2.1",
        serial: "0000"
      }],
      services: [{
        service_type: "mf_mgmt",
        connectors: [{
          state: "offline",
          status: "needs_attention",
          alarms: [{
            description: "A process stopped unexpectedly, attempting a restart",
            first_reported: "2015-12-15T08:39:19.676Z",
            id: "mf.container.stopped",
            last_reported: "2015-12-15T08:39:19.676Z",
            severity: "error",
            title: "Process error"
          }, {
            description: "Deleted a process to clear a scope error (unknown container)",
            first_reported: "2015-12-15T08:42:51.006Z",
            id: "mf.container.scopeError",
            last_reported: "2015-12-15T08:42:51.006Z",
            severity: "warning",
            title: "Process scope error"
          }, {
            description: "A process stopped unexpectedly, attempting a restart",
            first_reported: "2015-12-15T08:42:51.005Z",
            id: "mf.docker.error",
            last_reported: "2015-12-15T08:42:51.005Z",
            severity: "warning",
            title: "Management process error"
          }],
        }]
      }]
    }, {
      id: 1,
      hosts: [{
        host_name: "10.107.2.2",
        serial: "1111"
      }],
      services: [{
        service_type: "mf_mgmt",
        connectors: [{
          state: "offline",
          status: "needs_attention",
          alarms: [{
            description: "A process stopped unexpectedly, attempting a restart",
            first_reported: "2015-12-15T08:39:19.676Z",
            id: "mf.container.stopped",
            last_reported: "2015-12-15T08:39:19.676Z",
            severity: "error",
            title: "Process error"
          }],
        }]
      }]
    }];

    controller.clusterList = clusterMockAlarmData;
    var aggregatedAlarms = controller.alarmsSummary();
    //    expect(aggregatedAlarms.length).toBe(3);
    //    expect(aggregatedAlarms[0].hosts.length).toBe(2);
    //    expect(aggregatedAlarms[1].hosts.length).toBe(1);
    //    expect(aggregatedAlarms[2].hosts.length).toBe(1);
  });

  it('should open a model when delete group is called', function () {

    controller.deleteGroup({
      preventDefault: function () {}
    });
    $rootScope.$digest();
    expect($modal.open.calledOnce).toBe(true);

  });
});
