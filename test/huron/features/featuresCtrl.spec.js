/**
 * Created by sjalipar on 10/9/15.
 */
'use strict';

describe('Features Controller', function() {

  var controller, $scope, $modal, $state, $translate, $filter, $timeout, Authinfo, HuntGroupService, Log, Notification;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$modal_, _$state_, _$filter_, _$timeout_, _Authinfo_, _HuntGroupService_, _Log_, _Notification_) {
    $scope = $rootScope.$new();
    $modal = _$modal_;
    $state = _$state_;
    $filter = _$filter_;
    $timeout = _$timeout_;
    Authinfo = _Authinfo_;
    HuntGroupService = _HuntGroupService_;
    Log = _Log_;
    Notification = _Notification_;

    controller = $controller('HuronFeaturesCtrl', {
      $scope: $scope,
      $modal: $modal,
      $state: $state,
      $filter: $filter,
      $timeout: $timeout,
      Authinfo: Authinfo,
      HuntGroupService: HuntGroupService,
      Log: Log,
      Notification: Notification
    });
  }));

  it('should GetListOfHuntGroups', function(){
    it('then store the data in listOfFeatures', function(){

    });
    it('if there is any data, should change the pageState to showFeatures', function(){

    });
    it('if data received is empty, should change the pageSate to newFeature', function(){

    });
  });

  it('should call the state service when delete huntGroup option is chosen', function(){

  });






});
