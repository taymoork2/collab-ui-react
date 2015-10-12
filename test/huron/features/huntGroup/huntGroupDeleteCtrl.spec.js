/**
 * Created by sjalipar on 10/10/15.
 */

'use strict';

describe('HuntGroup DeleteCtrl', function () {

  var hgDeleteCtrl, rootScope, $scope, $stateParams, $q, $translate, Authinfo, huntGroupService, Notification, Log;

  var deleteHGDeferred;

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var successResponse = {
    'status': 200,
    'statusText': 'OK'
  };
  var failureResponse = {
    'data': 'Internal Server Error',
    'status': 500,
    'statusText': 'Internal Server Error'
  };

  beforeEach(module('Huron'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $controller, _$translate_, _$q_, Authinfo, _HuntGroupService_, _Notification_, _Log_) {

    rootScope = _$rootScope_;
    $scope = rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    Authinfo = Authinfo;
    huntGroupService = _HuntGroupService_;
    Notification = _Notification_;
    Log = _Log_;

    deleteHGDeferred = $q.defer();
    spyOn(huntGroupService, 'deleteHuntGroup').and.returnValue(deleteHGDeferred.promise);
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(rootScope, '$broadcast').and.callThrough();

    $stateParams = {
      deleteHuntGroupName: 'Technical Support',
      deleteHuntGroupId: 123
    };

    hgDeleteCtrl = $controller('HuntGroupDeleteCtrl', {
      $rootScope: rootScope,
      $scope: $scope,
      $stateParams: $stateParams,
      $translate: $translate,
      Authinfo: Authinfo,
      HuntGroupService: huntGroupService,
      Log: Log,
      Notification: Notification
    });

  }));

  it('should broadcast HUNT_GROUP_DELETED event when hunt group is deleted successfully', function () {
    hgDeleteCtrl.deleteHuntGroup();
    deleteHGDeferred.resolve(successResponse);
    $scope.$apply();
    expect(rootScope.$broadcast).toHaveBeenCalledWith('HUNT_GROUP_DELETED');

  });

  it('should give a successful notification when hunt group is deleted successfully', function () {
    hgDeleteCtrl.deleteHuntGroup();
    deleteHGDeferred.resolve(successResponse);
    $scope.$apply();
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      huntGroupName: $stateParams.deleteHuntGroupName
    });
  });

  it('should give the an error notification when hunt group deletion fails', function () {
    hgDeleteCtrl.deleteHuntGroup();
    deleteHGDeferred.reject(failureResponse);
    $scope.$apply();
    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
  });

});
