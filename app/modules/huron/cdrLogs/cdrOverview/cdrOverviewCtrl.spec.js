'use strict';

describe('Controller: CdrOverviewCtrl', function () {
  beforeEach(angular.mock.module('uc.cdrlogsupport'));
  beforeEach(angular.mock.module('Huron'));

  var $scope, controller, $state, $stateParams, CdrService;
  var callLegs = getJSONFixture('huron/json/cdrLogs/callLegs.json');
  var cdr = getJSONFixture('huron/json/cdrLogs/cdr.json');
  var localSessionID = "6484a26700105000a00074a02fc0a840";
  var remoteSessionID = "46d23e9a00105000a00074a02fc0a7fe";

  var tableOptions = {
    cursorcolor: "#aaa",
    cursorborder: "0px",
    cursorwidth: "7px",
    railpadding: {
      top: 0,
      right: 3,
      left: 0,
      bottom: 0
    },
    autohidemode: "leave"
  };

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$stateParams_, _CdrService_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $stateParams = _$stateParams_;
    CdrService = _CdrService_;

    $stateParams.cdrData = callLegs[0][0][0];
    $stateParams.call = callLegs[0];

    spyOn(CdrService, 'createDownload').and.callFake(function () {
      return {
        jsonBlob: 'blob',
        jsonUrl: 'url'
      };
    });
    spyOn(CdrService, 'downloadInIE');
    spyOn($state, 'go');

    controller = $controller('CdrOverviewCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
      CdrService: CdrService
    });

    $scope.$apply();
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should start with all defaults set', function () {
    expect(controller.searchPlaceholder).toEqual('cdrLogs.searchPlaceholder');
    expect(controller.searchField).toEqual('');
    expect(controller.cdrTable).toEqual([]);
    expect(controller.filename).toEqual("cdr.json");
    expect(controller.jsonUrl).toContain("url");
    expect(controller.jsonBlob).toEqual('blob');

    expect(controller.localSessionID).toEqual(localSessionID);
    expect(controller.remoteSessionID).toEqual(remoteSessionID);
    expect(controller.tableOptions).toEqual(tableOptions);
    expect(controller.cdr).toEqual(cdr);
  });

  it('should change states on ladder diagram click', function () {
    expect($state.go).not.toHaveBeenCalled();
    controller.openLadderDiagram();
    expect($state.go).toHaveBeenCalledWith('cdrladderdiagram', {
      call: $stateParams.call,
      uniqueIds: $stateParams.uniqueIds,
      events: $stateParams.events,
      logstashPath: $stateParams.logstashPath
    });
  });

  it('should not call msSaveOrOpenBlob on cdr save', function () {
    expect(CdrService.downloadInIE).not.toHaveBeenCalled();
    controller.cdrClick();
    expect(CdrService.downloadInIE).toHaveBeenCalledWith('blob', "cdr.json");
  });
});
