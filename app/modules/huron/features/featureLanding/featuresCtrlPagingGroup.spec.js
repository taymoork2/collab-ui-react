'use strict';

describe('Features Controller', function () {
  var featureCtrl, $scope, $modal, $q, $state, $filter, $timeout, Authinfo, HuntGroupService, PhoneNumberService, Log, Notification, getDeferred, AutoAttendantCeInfoModelService, AAModelService, FeatureToggleService, CallParkService, PagingGroupSettingsService, CallPickupGroupService;
  var listOfPGs = getJSONFixture('huron/json/features/pagingGroup/pgList.json');
  var emptyListOfPGs = [];
  var getPGListSuccessResp = function (data) {
    return data;
  };
  var getPGListFailureResp = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };
  var pagingGroups = {
    paginggroups: [{
      id: 'bbcd1234-abcd-abcd-abcddef123456',
      cardName: 'Test1',
      pgNumber: '5010',
      memberCount: 2,
      featureName: 'huronFeatureDetails.pg',
      filterValue: 'PG',
    }, {
      id: 'abcd1234-abcd-abcd-abcddef123456',
      cardName: 'Test2',
      pgNumber: '5011',
      memberCount: 3,
      featureName: 'huronFeatureDetails.pg',
      filterValue: 'PG',
    }],
  };

  var $event = {
    preventDefault: function () {},
    stopImmediatePropagation: function () {},
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$modal_, _$state_, _$filter_, _$timeout_, _Authinfo_, _HuntGroupService_, _PhoneNumberService_, _AutoAttendantCeInfoModelService_, _AAModelService_, _Log_, _Notification_, _FeatureToggleService_, _CallParkService_, _PagingGroupSettingsService_, _CallPickupGroupService_) {
    $scope = _$rootScope_.$new();
    $modal = _$modal_;
    $state = _$state_;
    $filter = _$filter_;
    $timeout = _$timeout_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    HuntGroupService = _HuntGroupService_;
    CallParkService = _CallParkService_;
    PagingGroupSettingsService = _PagingGroupSettingsService_;
    CallPickupGroupService = _CallPickupGroupService_;
    PhoneNumberService = _PhoneNumberService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAModelService = _AAModelService_;
    Log = _Log_;
    Notification = _Notification_;
    FeatureToggleService = _FeatureToggleService_;

    //create mock deferred object which will be used to return promises
    getDeferred = $q.defer();

    //Using a Jasmine Spy to return a promise when methods of the PagingGroupService are called
    spyOn(HuntGroupService, 'getHuntGroupList').and.returnValue($q.resolve([]));
    spyOn(CallParkService, 'getCallParkList').and.returnValue($q.resolve([]));
    spyOn(CallPickupGroupService, 'getListOfPickupGroups').and.returnValue($q.resolve());
    spyOn(PagingGroupSettingsService, 'listPagingGroupsWithNumberData').and.returnValue(getDeferred.promise);
    spyOn(AutoAttendantCeInfoModelService, 'getCeInfosList').and.returnValue($q.resolve([]));
    spyOn(AAModelService, 'newAAModel').and.returnValue(getDeferred.promise);
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
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
      PagingGroupService: PagingGroupSettingsService,
      PhoneNumberService: PhoneNumberService,
      Log: Log,
      Notification: Notification,
    });
  }));

  //TODO: re-enable after feature toggles are removed
  it('should get list of pagingGroups and then store the data in listOfFeatures', function () {
    getDeferred.resolve(getPGListSuccessResp(listOfPGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.listOfFeatures).toEqual(pagingGroups.paginggroups);
  });

  it('should get list of pagingGroups and if there is any data, should change the pageState to showFeatures', function () {
    getDeferred.resolve(getPGListSuccessResp(listOfPGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });
  it('should get list of pagingGroups and if data received is empty, should change the pageState to newFeature', function () {
    getDeferred.resolve(getPGListSuccessResp(emptyListOfPGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('NewFeature');
  });
  it('should get list of pagingGroups and if back end call fails should show error notification', function () {
    getDeferred.reject(getPGListFailureResp);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.errorResponse).toHaveBeenCalledWith(getPGListFailureResp,
      'huronFeatureDetails.failedToLoad', {
        featureType: 'huronFeatureDetails.pgName',
      });
  });
  it('should set the pageState to Loading when controller is getting data from back-end', function () {
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('Loading');
    getDeferred.resolve(getPGListSuccessResp(listOfPGs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });
  it('should set the pageState to Reload when controller fails to load the data for all features from back-end', function () {
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('Loading');
    getDeferred.reject(getPGListFailureResp);
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('Reload');
  });
  it('should set the view to pagingGroup when PG filter is selected', function () {
    getDeferred.resolve(getPGListSuccessResp(listOfPGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.setFilter('PG');
    expect(featureCtrl.listOfFeatures).toEqual(jasmine.arrayContaining(pagingGroups.paginggroups));
  });
  it('should take search query and display the results according to search query', function () {
    getDeferred.resolve(getPGListSuccessResp(listOfPGs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.searchData(pagingGroups.paginggroups[0].cardName);
    expect(featureCtrl.listOfFeatures).toEqual([pagingGroups.paginggroups[0]]);
  });
  it('should be able to edit an PagingGroup ', function () {
    featureCtrl.editHuronFeature(pagingGroups.paginggroups[0], $event);
    expect($state.go).toHaveBeenCalledWith('huronPagingGroupEdit', {
      feature: pagingGroups.paginggroups[0],
    });
  });
});
