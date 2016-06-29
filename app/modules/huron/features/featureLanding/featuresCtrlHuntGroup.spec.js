/**
 * Created by sjalipar on 10/9/15.
 */
'use strict';

describe('Features Controller', function () {

  var featureCtrl, $rootScope, $scope, $modal, $q, $state, $translate, $filter, $timeout, Authinfo, HuntGroupService, TelephoneNumberService, Log, Notification, getDeferred, HuronFeaturesListService, AutoAttendantCeInfoModelService, AAModelService, FeatureToggleService;
  var listOfHGs = getJSONFixture('huron/json/features/huntGroup/hgList.json');
  var hg = getJSONFixture('huron/json/features/huntGroup/oneHg.json');
  var emptyListOfHGs = [];
  var getHGListSuccessResp = function (data) {
    return data;
  };
  var getHGListFailureResp = {
    'data': 'Internal Server Error',
    'status': 500,
    'statusText': 'Internal Server Error'
  };
  var huntGroups = [{
    'cardName': 'Technical Support',
    'numbers': ['5076', '4145551244'],
    'memberCount': 2,
    'id': 'abcd1234-abcd-abcd-abcddef123456',
    'featureName': 'huronHuntGroup.hg',
    'filterValue': 'HG',
    'toggle': 'huronHuntGroup'
  }, {
    cardName: 'Marketing',
    numbers: ['5076', '13026824905', '4145551244', '4145551245'],
    memberCount: 16,
    id: 'bbcd1234-abcd-abcd-abcddef123456',
    featureName: 'huronHuntGroup.hg',
    filterValue: 'HG',
    toggle: 'huronHuntGroup'
  }];

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$modal_, _$state_, _$filter_, _$timeout_, _Authinfo_, _HuntGroupService_, _TelephoneNumberService_, _HuronFeaturesListService_, _AutoAttendantCeInfoModelService_, _AAModelService_, _Log_, _Notification_, _FeatureToggleService_) {
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
    HuronFeaturesListService = _HuronFeaturesListService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAModelService = _AAModelService_;
    Log = _Log_;
    Notification = _Notification_;
    FeatureToggleService = _FeatureToggleService_;

    //create mock deferred object which will be used to return promises
    getDeferred = $q.defer();

    //Using a Jasmine Spy to return a promise when methods of the HuntGroupService are called
    spyOn(HuntGroupService, 'getListOfHuntGroups').and.returnValue(getDeferred.promise);
    spyOn(AutoAttendantCeInfoModelService, 'getCeInfosList').and.returnValue(getDeferred.promise);
    spyOn(AAModelService, 'newAAModel').and.returnValue(getDeferred.promise);
    spyOn(FeatureToggleService, 'supports').and.returnValue(getDeferred.promise);
    spyOn($state, 'go');
    spyOn(Notification, 'success');
    spyOn(Notification, 'errorResponse');

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

  //TODO: re-enable after feature toggles are removed
  xit('should get list of huntGroups and then store the data in listOfFeatures', function () {
    getDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.listOfFeatures).toEqual(jasmine.arrayContaining(huntGroups));
  });
  it('should get list of huntGroups and if there is any data, should change the pageState to showFeatures', function () {
    getDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });
  it('should get list of huntGroups and if data received is empty, should change the pageSate to newFeature', function () {
    getDeferred.resolve(getHGListSuccessResp(emptyListOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('NewFeature');
  });
  //TODO: re-enable after feature toggles are removed
  xit('should get list of huntGroups and if back end call fails should show error notification', function () {
    getDeferred.reject(getHGListFailureResp);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.errorResponse).toHaveBeenCalledWith(getHGListFailureResp,
      'huronFeatureDetails.failedToLoad', {
        featureType: 'huronFeatureDetails.hgName'
      });
  });

  //TODO : re-enable when feature toggle is removed
  xit('should set the pageState to Loading when controller is getting data from back-end', function () {
    expect(featureCtrl.pageState).toEqual('Loading');
    getDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });
  //TODO: re-enable after feature toggles are removed
  xit('should set the pageState to Reload when controller fails to load the data for all features from back-end', function () {
    expect(featureCtrl.pageState).toEqual('Loading');
    getDeferred.reject(getHGListFailureResp);
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('Reload');
  });

  it('should be able call delete a huntGroup function and call the $state service', function () {
    getDeferred.resolve(getHGListSuccessResp(emptyListOfHGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.deleteHuronFeature(huntGroups[0]);
    expect($state.go).toHaveBeenCalledWith('huronfeatures.deleteFeature', {
      deleteFeatureName: huntGroups[0].cardName,
      deleteFeatureId: huntGroups[0].id,
      deleteFeatureType: 'HG'
    });
  });

  it('should receive the HURON_FEATURE_DELETED event when a huntGroup gets deleted', function () {
    $rootScope.$broadcast('HURON_FEATURE_DELETED', {
      deleteFeatureName: huntGroups[0].cardName,
      deleteFeatureId: huntGroups[0].id,
      deleteFeatureType: 'HG'
    });
    expect(featureCtrl.listOfFeatures).not.toEqual(jasmine.arrayContaining([huntGroups[0]]));

  });

  //TODO : re-enable when feature toggle is removed
  xit('should receive the HURON_FEATURE_DELETED event and set pageState to newFeature if they are no features to show', function () {
    featureCtrl.listOfFeatures = [];
    expect(featureCtrl.pageState).toEqual('Loading');
    getDeferred.resolve(getHGListSuccessResp(hg));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
    $rootScope.$broadcast('HURON_FEATURE_DELETED', {
      deleteFeatureName: huntGroups[0].cardName,
      deleteFeatureId: huntGroups[0].id,
      deleteFeatureType: 'HG'
    });
    expect(featureCtrl.listOfFeatures).not.toEqual(jasmine.arrayContaining([huntGroups[0]]));
    expect(featureCtrl.pageState).toEqual('NewFeature');
  });
  //TODO: re-enable after feature toggles are removed
  xit('should set the view to huntGroups when HG filter is selected', function () {
    getDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.setFilter('HG');
    expect(featureCtrl.listOfFeatures).toEqual(jasmine.arrayContaining(huntGroups));
  });
  //TODO: re-enable after feature toggles are removed
  xit('should take search query and display the results according to search query', function () {
    getDeferred.resolve(getHGListSuccessResp(listOfHGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.searchData(huntGroups[0].cardName);
    expect(featureCtrl.listOfFeatures).toEqual([huntGroups[0]]);
  });
});
