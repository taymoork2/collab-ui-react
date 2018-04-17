'use strict';

describe('Features Controller', function () {
  var featureCtrl, $scope, $modal, $q, $state, $filter, $timeout, Authinfo, HuntGroupService, PhoneNumberService, Log, Notification, getDeferred, AutoAttendantCeInfoModelService, AAModelService, FeatureToggleService, CallParkService, PagingGroupSettingsService, CallPickupGroupService;
  var listOfPIs = getJSONFixture('huron/json/features/callPickup/pickupList.json');
  var emptylistOfPIs = [];
  var getPIListSuccessResp = function (data) {
    return data;
  };
  var getPIListFailureResp = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };
  var pickupGroups = {
    pickupGroups: [{
      id: '6ebcf83f-6594-419d-85a0-4c98b5f97995',
      cardName: 'blue',
      memberCount: 2,
      filterValue: 'PI',
      featureName: 'huronFeatureDetails.pi',
    }, {
      id: 'bce45ce1-743a-454b-b1bf-30ca838ee3e5',
      cardName: 'check',
      memberCount: 3,
      filterValue: 'PI',
      featureName: 'huronFeatureDetails.pi',
    }, {
      id: '1e861505-c281-4086-98c5-2e46b4659065',
      cardName: 'demo_1',
      memberCount: 2,
      filterValue: 'PI',
      featureName: 'huronFeatureDetails.pi',
    }],
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
    spyOn(CallPickupGroupService, 'getListOfPickupGroups').and.returnValue(getDeferred.promise);
    spyOn(PagingGroupSettingsService, 'listPagingGroupsWithNumberData').and.returnValue($q.resolve());
    spyOn(AutoAttendantCeInfoModelService, 'getCeInfosList').and.returnValue($q.resolve([]));
    spyOn(AAModelService, 'newAAModel').and.returnValue($q.resolve([]));
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
      CallPickupGroupService: CallPickupGroupService,
      PhoneNumberService: PhoneNumberService,
      Log: Log,
      Notification: Notification,
    });
  }));

  //TODO: re-enable after feature toggles are removed
  it('should get list of pickupGroups and then store the data in listOfFeatures', function () {
    getDeferred.resolve(getPIListSuccessResp(listOfPIs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.listOfFeatures).toEqual(pickupGroups.pickupGroups);
  });

  it('should get list of pickupGroups and if there is any data, should change the pageState to showFeatures', function () {
    getDeferred.resolve(getPIListSuccessResp(listOfPIs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });
  it('should get list of pickupGroups and if data received is empty, should change the pageState to newFeature', function () {
    getDeferred.resolve(getPIListSuccessResp(emptylistOfPIs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('NewFeature');
  });
  it('should get list of pickupGroups and if back end call fails should show error notification', function () {
    getDeferred.reject(getPIListFailureResp);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.errorResponse).toHaveBeenCalledWith(getPIListFailureResp,
      'huronFeatureDetails.failedToLoad', {
        featureType: 'huronFeatureDetails.piName',
      });
  });
  it('should set the pageState to Loading when controller is getting data from back-end', function () {
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('Loading');
    getDeferred.resolve(getPIListSuccessResp(listOfPIs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });
  it('should set the pageState to Reload when controller fails to load the data for all features from back-end', function () {
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('Loading');
    getDeferred.reject(getPIListFailureResp);
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('Reload');
  });
  it('should set the view to pickupGroup when PI filter is selected', function () {
    getDeferred.resolve(getPIListSuccessResp(listOfPIs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.setFilter('PI');
    expect(featureCtrl.listOfFeatures).toEqual(jasmine.arrayContaining(pickupGroups.pickupGroups));
  });
  it('should take search query and display the results according to search query', function () {
    getDeferred.resolve(getPIListSuccessResp(listOfPIs));
    $scope.$apply();
    $timeout.flush();
    featureCtrl.searchData(pickupGroups.pickupGroups[0].cardName);
    expect(featureCtrl.listOfFeatures).toEqual([pickupGroups.pickupGroups[0]]);
  });
});
