/**
 * Created by sjalipar on 10/9/15.
 */
'use strict';

describe('Features Controller', function () {

  var featureCtrl, $rootScope, $scope, $modal, $q, $state, $translate, $filter, $timeout, Authinfo, HuntGroupService, Log, Notification;

  var getListOfHuntGroupsDeferred;

  var listOfHGs = {
    'url': 'https://test-hg.com/api/v2/customers/123/features/huntgroups',
    'items': [{
      'uuid': 'abcd1234-abcd-abcd-abcddef123456',
      'name': 'Technical Support',
      'numbers': ['5076', '(414) 555-1244'],
      'memberCount': 2
    }, {
      uuid: 'bbcd1234-abcd-abcd-abcddef123456',
      name: 'Marketing',
      numbers: ['5076', '(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
      memberCount: 16
    }]
  };

  var hg = {
    'url': 'https://test-hg.com/api/v2/customers/123/features/huntgroups',
    'items': [{
      'uuid': 'abcd1234-abcd-abcd-abcddef123456',
      'name': 'Technical Support',
      'numbers': ['5076', '(414) 555-1244'],
      'memberCount': 2
    }]
  };

  var emptyListOfHGs = {
    'url': 'https://test-hg.com/api/v2/customers/123/features/huntgroups',
    'items': []
  };

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
    'featureName': 'huronFeatureDetails.hg',
    'filterValue': 'HG',
    'memberCount': 2,
    'huntGroupId': 'abcd1234-abcd-abcd-abcddef123456'
  }, {

    cardName: 'Marketing',
    numbers: ['5076', '(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
    memberCount: 16,
    huntGroupId: 'bbcd1234-abcd-abcd-abcddef123456',
    featureName: 'huronFeatureDetails.hg',
    filterValue: 'HG'
  }];

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$modal_, _$state_, _$filter_, _$timeout_, _Authinfo_, _HuntGroupService_, _Log_, _Notification_) {
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();
    $modal = _$modal_;
    $state = _$state_;
    $filter = _$filter_;
    $timeout = _$timeout_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    HuntGroupService = _HuntGroupService_;
    Log = _Log_;
    Notification = _Notification_;

    //create mock deferred object which will be used to return promises
    getListOfHuntGroupsDeferred = $q.defer();

    //Using a Jasmine Spy to return a promise when methods of the HuntGroupService are called
    spyOn(HuntGroupService, 'getListOfHuntGroups').and.returnValue(getListOfHuntGroupsDeferred.promise);

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
      Log: Log,
      Notification: Notification
    });

  }));

  it('should get list of huntGroups and then store the data in listOfFeatures', function () {
    getListOfHuntGroupsDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.listOfFeatures).toEqual(jasmine.arrayContaining(huntGroups));
  });
  it('should get list of huntGroups and if there is any data, should change the pageState to showFeatures', function () {
    getListOfHuntGroupsDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });
  it('should get list of huntGroups and if data received is empty, should change the pageSate to newFeature', function () {
    getListOfHuntGroupsDeferred.resolve(getHGListSuccessResp(emptyListOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('NewFeature');
  });

  it('should get list of huntGroups and if back end call fails should show error notification', function () {
    getListOfHuntGroupsDeferred.reject(getHGListFailureResp);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
  });

  it('should set the pageState to Loading when controller is getting data from back-end', function () {
    expect(featureCtrl.pageState).toEqual('Loading');
    getListOfHuntGroupsDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });

  it('should be able call delete a huntGroup function and call the $state service', function () {
    getListOfHuntGroupsDeferred.resolve(getHGListSuccessResp(emptyListOfHGs));
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
    getListOfHuntGroupsDeferred.resolve(getHGListSuccessResp(hg));
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
    getListOfHuntGroupsDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.setFilter('HG');
    expect(featureCtrl.listOfFeatures).toEqual(jasmine.arrayContaining(huntGroups));
  });

  it('should take search query and display the results according to search query', function () {
    getListOfHuntGroupsDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.searchData(huntGroups[0].cardName);
    expect(featureCtrl.listOfFeatures).toEqual([huntGroups[0]]);
  });
});
