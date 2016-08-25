/**
 * Created by sjalipar on 10/9/15.
 */
'use strict';

describe('Features Controller', function () {

  var featureCtrl, $rootScope, $scope, $modal, $q, $state, $filter, $timeout, Authinfo, Log, Notification, getDeferred, AutoAttendantCeInfoModelService, HuntGroupService, CallParkService, FeatureToggleService;
  var listOfAAs = getJSONFixture('huron/json/autoAttendant/aaList.json');
  var emptyListOfAAs = [];
  var emptyListOfCPs = {
    callparks: []
  };
  var getAAListSuccessResp = function (data) {
    return data;
  };
  var AAs = [{
    'cardName': 'Main AA',
    'numbers': ['1111'],
    'id': 'c16a6027-caef-4429-b3af-9d61ddc71111',
    'featureName': 'huronHuntGroup.hg',
    'filterValue': 'AA',
  }, {
    'cardName': 'Second AA',
    'numbers': ['2222'],
    'id': 'c16a6027-caef-4429-b3af-9d61ddc72222',
    'featureName': 'huronHuntGroup.hg',
    'filterValue': 'AA',
    'hasReferences': true,
    'referenceNames': ['Main AA']
  }, {
    'cardName': 'Third  AA',
    'numbers': ['3333'],
    'id': 'c16a6027-caef-4429-b3af-9d61ddc73333',
    'featureName': 'huronHuntGroup.hg',
    'filterValue': 'AA'
  }];

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$modal_, _$state_, _$filter_, _$timeout_, _Authinfo_, _AutoAttendantCeInfoModelService_, _Log_, _Notification_, _HuntGroupService_, _CallParkService_, _FeatureToggleService_) {
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();
    $modal = _$modal_;
    $state = _$state_;
    $filter = _$filter_;
    $timeout = _$timeout_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    HuntGroupService = _HuntGroupService_;
    CallParkService = _CallParkService_;
    FeatureToggleService = _FeatureToggleService_;

    Log = _Log_;
    Notification = _Notification_;

    //create mock deferred object which will be used to return promises
    getDeferred = $q.defer();

    spyOn(AutoAttendantCeInfoModelService, 'getCeInfosList').and.returnValue(getDeferred.promise);
    spyOn(HuntGroupService, 'getListOfHuntGroups').and.returnValue($q.when());
    spyOn(CallParkService, 'getListOfCallParks').and.returnValue($q.when(emptyListOfCPs));
    spyOn(Notification, 'error');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when());

    spyOn($state, 'go');

    featureCtrl = $controller('HuronFeaturesCtrl', {
      $scope: $scope,
      $modal: $modal,
      $state: $state,
      $filter: $filter,
      $timeout: $timeout,
      Authinfo: Authinfo,
      AutoAttendantCeInfoModelService: AutoAttendantCeInfoModelService,
      Log: Log,
      Notification: Notification
    });

  }));

  it('should get list of AAs and if there is any data, should change the pageState to showFeatures', function () {
    getDeferred.resolve(getAAListSuccessResp(listOfAAs));
    $scope.$apply();

    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('showFeatures');
  });

  it('should get list of AAs and if data received is empty, should change the pageSate to newFeature', function () {
    getDeferred.resolve(getAAListSuccessResp(emptyListOfAAs));
    $scope.$apply();
    $timeout.flush();
    expect(featureCtrl.pageState).toEqual('NewFeature');
  });

  it('should be able call delete an AA function and call the $state service', function () {
    getDeferred.resolve(getAAListSuccessResp(emptyListOfAAs));
    $scope.$apply();
    $timeout.flush();

    featureCtrl.deleteHuronFeature(AAs[0]);
    expect($state.go).toHaveBeenCalledWith('huronfeatures.deleteFeature', {
      deleteFeatureName: AAs[0].cardName,
      deleteFeatureId: AAs[0].id,
      deleteFeatureType: 'AA'
    });
  });
  it('should be able to edit an AA function ', function () {
    featureCtrl.editHuronFeature(AAs[0]);
    expect($state.go).toHaveBeenCalledWith('huronfeatures.aabuilder', {
      aaName: AAs[0].cardName
    });
  });

  it('should search list of AAs', function () {

    getDeferred.resolve(getAAListSuccessResp(listOfAAs));

    $scope.$apply();
    $timeout.flush();

    var saveF = featureCtrl.listOfFeatures[0];

    featureCtrl.searchData(featureCtrl.listOfFeatures[0].cardName);

    expect(featureCtrl.listOfFeatures.length).toEqual(1);

    expect(featureCtrl.listOfFeatures).toContain(saveF);

  });

  it('should filter a list of AAs', function () {
    getDeferred.resolve(getAAListSuccessResp(listOfAAs));

    $scope.$apply();
    $timeout.flush();

    featureCtrl.setFilter('AA');

    expect(featureCtrl.listOfFeatures.length).toEqual(AAs.length);
    expect(featureCtrl.listOfFeatures[0].cardName).toEqual(AAs[0].cardName);

  });

  it('should filter a list of AAs to zero length', function () {
    getDeferred.resolve(getAAListSuccessResp(listOfAAs));

    $scope.$apply();
    $timeout.flush();

    featureCtrl.setFilter('XX');

    expect(featureCtrl.listOfFeatures.length).toEqual(0);

  });
  it('should receive the HURON_FEATURE_DELETED event when an AA gets deleted', function () {

    var saveFeature;

    getDeferred.resolve(getAAListSuccessResp(listOfAAs));
    $scope.$apply();

    $timeout.flush();

    saveFeature = featureCtrl.listOfFeatures[2];

    featureCtrl.deleteHuronFeature(featureCtrl.listOfFeatures[2]);

    $rootScope.$broadcast('HURON_FEATURE_DELETED', {
      deleteFeatureName: AAs[0].cardName,
      deleteFeatureId: AAs[0].id,
      deleteFeatureType: 'AA'
    });

    expect(featureCtrl.listOfFeatures).not.toContain(saveFeature);

  });

  it('should receive the HURON_FEATURE_DELETED event when an AA gets deleted with dependencies', function () {

    var saveFeature;

    getDeferred.resolve(getAAListSuccessResp(listOfAAs));
    $scope.$apply();

    $timeout.flush();

    saveFeature = featureCtrl.listOfFeatures[1];

    featureCtrl.deleteHuronFeature(featureCtrl.listOfFeatures[1]);

    $rootScope.$broadcast('HURON_FEATURE_DELETED', {
      deleteFeatureName: AAs[0].cardName,
      deleteFeatureId: AAs[0].id,
      deleteFeatureType: 'AA'
    });

    expect(featureCtrl.listOfFeatures[0].hasDepends).toEqual(false);

    expect(featureCtrl.listOfFeatures).not.toContain(saveFeature);
  });

  it('should Not delete an AA with dependencies', function () {

    var saveFeature;

    getDeferred.resolve(getAAListSuccessResp(listOfAAs));
    $scope.$apply();

    $timeout.flush();

    saveFeature = featureCtrl.listOfFeatures[0];

    featureCtrl.deleteHuronFeature(featureCtrl.listOfFeatures[0]);

    expect(Notification.error).toHaveBeenCalledWith('huronFeatureDetails.aaDeleteBlocked', jasmine.any(Object));

    expect(featureCtrl.listOfFeatures[0].hasDepends).toEqual(true);

    expect(featureCtrl.listOfFeatures).toContain(saveFeature);
  });

});
