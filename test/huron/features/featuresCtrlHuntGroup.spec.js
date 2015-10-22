/**
 * Created by sjalipar on 10/9/15.
 */
'use strict';

describe('Features Controller', function () {

  var featureCtrl, $rootScope, $scope, $modal, $q, $state, $translate, $filter, $timeout, Authinfo, HuntGroupService, TelephoneNumberService, Log, Notification, getHGListDeferred;
  var listOfHGs = getJSONFixture('huron/json/features/huntGroup/hgList.json');
  var hg = getJSONFixture('huron/json/features/huntGroup/oneHg.json');
  var emptyListOfHGs = getJSONFixture('huron/json/features/huntGroup/emptyHgList.json');
  var getHGListSuccessResp = function (data) {
    return {
      'data': data,
      'status': 200,
      'statusText': 'OK'
    };
  };
  var getHGListFailureResp = {
    'data': 'Internal Server Error',
    'status': 500,
    'statusText': 'Internal Server Error'
  };
  var huntGroups = [{
    'cardName': 'Technical Support',
    'numbers': ['5076', '(414) 555-1244'],
    'featureName': 'huronHuntGroup.hg',
    'filterValue': 'HG',
    'memberCount': 2,
    'huntGroupId': 'abcd1234-abcd-abcd-abcddef123456'
  }, {
    cardName: 'Marketing',
    numbers: ['5076', '(302) 682-4905', '(414) 555-1244', '(414) 555-1245'],
    memberCount: 16,
    huntGroupId: 'bbcd1234-abcd-abcd-abcddef123456',
    featureName: 'huronHuntGroup.hg',
    filterValue: 'HG'
  }];

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$modal_, _$state_, _$filter_, _$timeout_, _Authinfo_, _HuntGroupService_, _TelephoneNumberService_, _Log_, _Notification_) {
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();
    $modal = _$modal_;
    $state = _$state_;
    $filter = _$filter_;
    $timeout = _$timeout_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    HuntGroupService = _HuntGroupService_;
    TelephoneNumberService = _TelephoneNumberService_;
    Log = _Log_;
    Notification = _Notification_;

    //create mock deferred object which will be used to return promises
    getHGListDeferred = $q.defer();

    //Using a Jasmine Spy to return a promise when methods of the HuntGroupService are called
    spyOn(HuntGroupService, 'getListOfHuntGroups').and.returnValue(getHGListDeferred.promise);

    spyOn($state, 'go');
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');

    featureCtrl = $controller('HuronFeaturesCtrl', {
      $scope: $scope,
      $modal: $modal,
      $state: $state,
      $filter: $filter,
      $timeout: $timeout,
      Authinfo: Authinfo,
      HuntGroupService: HuntGroupService,
      TelephoneNumberService: TelephoneNumberService,
      Log: Log,
      Notification: Notification
    });

  }));

  it('should get list of huntGroups and then store the data in listOfFeatures', function () {
    getHGListDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.listOfFeatures).toEqual(jasmine.arrayContaining(huntGroups));
  });
  it('should get list of huntGroups and if there is any data, should change the pageState to showFeatures', function () {
    getHGListDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });
  it('should get list of huntGroups and if data received is empty, should change the pageSate to newFeature', function () {
    getHGListDeferred.resolve(getHGListSuccessResp(emptyListOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('NewFeature');
  });

  it('should get list of huntGroups and if back end call fails should show error notification', function () {
    getHGListDeferred.reject(getHGListFailureResp);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
  });

  it('should set the pageState to Loading when controller is getting data from back-end', function () {
    expect(featureCtrl.pageState).toEqual('Loading');
    getHGListDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });

  it('should be able call delete a huntGroup function and call the $state service', function () {
    getHGListDeferred.resolve(getHGListSuccessResp(emptyListOfHGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.deleteHuronFeature(huntGroups[0]);
    expect($state.go).toHaveBeenCalledWith('huronfeatures.deleteHuntGroup', {
      deleteHuntGroupName: huntGroups[0].cardName,
      deleteHuntGroupId: huntGroups[0].huntGroupId
    });
  });

  it('should receive the HUNT_GROUP_DELETED event when a huntGroup gets deleted', function () {
    $rootScope.$broadcast('HUNT_GROUP_DELETED', {
      deleteHuntGroupName: huntGroups[0].cardName,
      deleteHuntGroupId: huntGroups[0].huntGroupId
    });
    expect(featureCtrl.listOfFeatures).not.toEqual(jasmine.arrayContaining([huntGroups[0]]));

  });

  it('should receive the HUNT_GROUP_DELETED event and set pageState to newFeature if they are no features to show', function () {
    featureCtrl.listOfFeatures = [];
    expect(featureCtrl.pageState).toEqual('Loading');
    getHGListDeferred.resolve(getHGListSuccessResp(hg));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
    $rootScope.$broadcast('HUNT_GROUP_DELETED', {
      deleteHuntGroupName: hg.cardName,
      deleteHuntGroupId: hg.huntGroupId
    });
    expect(featureCtrl.listOfFeatures).not.toEqual(jasmine.arrayContaining([huntGroups[0]]));
    expect(featureCtrl.pageState).toEqual('NewFeature');
  });

  it('should set the view to huntGroups when HG filter is selected', function () {
    getHGListDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.setFilter('HG');
    expect(featureCtrl.listOfFeatures).toEqual(jasmine.arrayContaining(huntGroups));
  });

  it('should take search query and display the results according to search query', function () {
    getHGListDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.searchData(huntGroups[0].cardName);
    expect(featureCtrl.listOfFeatures).toEqual([huntGroups[0]]);
  });
});
