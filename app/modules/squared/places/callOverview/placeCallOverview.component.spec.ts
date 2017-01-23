describe('placeCallOverview component', () => {
  let Authinfo, CsdmDataModelService;
  let $state, $scope, $q, Notification, PlaceCallOverviewService;

  let $stateParams;
  let $componentController;
  let controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject((_$q_,
                     _Authinfo_,
                     _CsdmDataModelService_,
                     _$state_,
                     _$stateParams_,
                     $rootScope,
                     _$componentController_,
                     _Notification_,
                     _PlaceCallOverviewService_) => {
    $q = _$q_;
    Authinfo = _Authinfo_;
    CsdmDataModelService = _CsdmDataModelService_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
    Notification = _Notification_;
    PlaceCallOverviewService = _PlaceCallOverviewService_;
  }));

  let initController = (stateParams, scope, $state) => {
    return $componentController('placeCallOverview', {
      $stateParams: stateParams,
      $scope: scope,
      $state: $state,
      PlaceCallOverviewService: PlaceCallOverviewService,
    }, null);
  };

  describe('and load places preferred Language', () => {
    let currentDevice, deviceName, displayName, email, userCisUuid, placeCisUuid, orgId;
    let goStateName, goStateData;
    let languages, siteLevelLanguage, cmiPlace, csdmPlace;
    beforeEach(() => {
      deviceName = 'deviceName';
      displayName = 'displayName';
      email = 'email@address.com';
      userCisUuid = 'userCisUuid';
      placeCisUuid = 'placeCisUuid';
      orgId = 'orgId';
      currentDevice = {
        displayName: deviceName,
        cisUuid: placeCisUuid,
      };

      languages = getJSONFixture('huron/json/settings/languages.json');
      cmiPlace = getJSONFixture('huron/json/places/cmiPlace.json');
      csdmPlace = getJSONFixture('huron/json/places/csdmPlace.json');
      siteLevelLanguage = 'fr_CA';
      $stateParams.currentPlace = csdmPlace;

      spyOn(Authinfo, 'getOrgName').and.returnValue('Cisco Org Name');
      spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
      Authinfo.displayName = displayName;
      spyOn(Authinfo, 'getUserId').and.returnValue(userCisUuid);
      spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(email);
      spyOn(Notification, 'success');
      spyOn(Notification, 'processErrorResponse').and.returnValue('');
      spyOn(PlaceCallOverviewService, 'getSiteLanguages').and.returnValue($q.when(languages));
      spyOn(PlaceCallOverviewService, 'getSiteLevelLanguage').and.returnValue($q.when(siteLevelLanguage));
      spyOn(PlaceCallOverviewService, 'getCmiPlaceInfo').and.returnValue($q.when(cmiPlace));
      spyOn($state, 'go').and.callFake((stateName, stateData) => {
        goStateName = stateName;
        goStateData = stateData;
      });
    });
    describe('with a desk device', () => {
      beforeEach(() => {
        $stateParams = { currentPlace: { displayName: deviceName, type: 'desk', cisUuid: 'sa0va9u02' } };
        controller = initController($stateParams, $scope, $state);
      });

      it('should supply ShowActivationCodeCtrl with all the prerequisites', () => {
        controller.$onInit();
        $scope.$apply();

        expect($state.go).toHaveBeenCalled();
        expect(controller.preferredLanguage.value).toEqual(cmiPlace.preferredLanguage);
      });
    });
  });
});
