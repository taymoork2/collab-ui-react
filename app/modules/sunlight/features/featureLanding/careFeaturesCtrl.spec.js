'use strict';

describe('Care Feature Ctrl should ', function () {

  var controller, $filter, $q, $rootScope, $state, $scope, $timeout, Authinfo, CareFeatureList, Log, Notification, deferred, callbackDeferred, $translate, FeatureToggleService;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('Test-Org-Id')
  };

  var templateList = getJSONFixture('sunlight/json/features/chatTemplates/chatTemplateList.json');
  var emptyListOfCTs = [];
  var justOneChatTemplate = templateList[0];

  var getTemplatesSuccess = function (mediaType, data) {
    return _.filter(data, function (template) {
      return template.mediaType === mediaType;
    });
  };
  var getTemplateFailure = function () {
    return {
      'data': 'Internal Server Error',
      'status': 500,
      'statusText': 'Internal Server Error'
    };
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));
  beforeEach(inject(function (_$rootScope_, $controller, _$filter_, _$state_, _$q_, _$timeout_, _Authinfo_, _CareFeatureList_, _Notification_, _Log_, _$translate_, _FeatureToggleService_) {
    $rootScope = _$rootScope_;
    $filter = _$filter_;
    $q = _$q_;
    $state = _$state_;
    $timeout = _$timeout_;
    $scope = _$rootScope_.$new();
    Authinfo = _Authinfo_;
    $translate = _$translate_;
    CareFeatureList = _CareFeatureList_;
    Log = _Log_;
    Notification = _Notification_;
    FeatureToggleService = _FeatureToggleService_;

    //create mock deferred object which will be used to return promises
    deferred = $q.defer();
    callbackDeferred = $q.defer();
    spyOn(CareFeatureList, 'getChatTemplates').and.returnValue(deferred.promise);
    spyOn(CareFeatureList, 'getCallbackTemplates').and.returnValue(callbackDeferred.promise);
    FeatureToggleService.atlasCareCallbackTrialsGetStatus = jasmine.createSpy('atlasCareCallbackTrialsGetStatus').and.returnValue($q.resolve(true));

    spyOn($state, 'go');

    controller = $controller('CareFeaturesCtrl', {
      $scope: $scope,
      $state: $state,
      $timeout: $timeout,
      $filter: $filter,
      Authinfo: Authinfo,
      CareFeatureList: CareFeatureList,
      Log: Log,
      Notification: Notification,
      $translate: $translate,
      FeatureToggleService: FeatureToggleService
    });
  }));

  it('initialize and get the list of templates and update pageState ', function () {
    expect(controller.pageState).toEqual('Loading');
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    expect(controller.pageState).toEqual('ShowFeatures');
  });

  it('initialize and show error page when get templates fails ', function () {
    expect(controller.pageState).toEqual('Loading');
    deferred.reject(getTemplateFailure);
    $scope.$apply();
    $timeout.flush();
    expect(controller.pageState).toEqual('Error');
  });

  it('initialize and show New Feature page when templates are empty ', function () {
    expect(controller.pageState).toEqual('Loading');
    deferred.resolve(getTemplatesSuccess('chat', emptyListOfCTs));
    callbackDeferred.resolve(getTemplatesSuccess('callback', emptyListOfCTs));
    $scope.$apply();
    $timeout.flush();
    expect(controller.pageState).toEqual('NewFeature');
  });

  it('able to call delete function and inturn the $state service ', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    var featureTobBeDeleted = templateList[0];
    controller.deleteCareFeature(featureTobBeDeleted);
    expect($state.go).toHaveBeenCalledWith('care.Features.DeleteFeature', {
      deleteFeatureName: featureTobBeDeleted.name,
      deleteFeatureId: featureTobBeDeleted.templateId,
      deleteFeatureType: featureTobBeDeleted.featureType
    });
  });

  it('able to receive the CARE_FEATURE_DELETED event when template gets deleted and template should be deleted from local copy', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    var featureTobBeDeleted = templateList[0];
    controller.deleteCareFeature(featureTobBeDeleted);
    $rootScope.$broadcast('CARE_FEATURE_DELETED', {
      deleteFeatureName: featureTobBeDeleted.name,
      deleteFeatureId: featureTobBeDeleted.templateId,
      deleteFeatureType: featureTobBeDeleted.featureType
    });
    expect(controller.filteredListOfFeatures).not.toEqual(jasmine.arrayContaining([featureTobBeDeleted]));
  });

  it('able to receive the CARE_FEATURE_DELETED event when template gets deleted and change pageState to NewFeature when no templates to show', function () {
    deferred.resolve(getTemplatesSuccess('chat', [justOneChatTemplate]));
    callbackDeferred.resolve(getTemplatesSuccess('callback', emptyListOfCTs));
    $scope.$apply();
    $timeout.flush();
    var featureTobBeDeleted = justOneChatTemplate;
    controller.deleteCareFeature(featureTobBeDeleted);
    $rootScope.$broadcast('CARE_FEATURE_DELETED', {
      deleteFeatureName: featureTobBeDeleted.name,
      deleteFeatureId: featureTobBeDeleted.templateId,
      deleteFeatureType: featureTobBeDeleted.featureType
    });
    expect(controller.filteredListOfFeatures).not.toEqual(jasmine.arrayContaining([featureTobBeDeleted]));
    expect(controller.pageState).toEqual('NewFeature');
  });

  it('should filter a list of Chat templates', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    controller.setFilter('chat');
    expect(controller.filteredListOfFeatures.length).toEqual(3);
    expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
  });

  it('should filter a list of Callback templates', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    controller.setFilter('callback');
    expect(controller.filteredListOfFeatures.length).toEqual(3);
    expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Callback Dev Template');
  });

  it('should filter all the templates', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    controller.setFilter('all');
    expect(controller.filteredListOfFeatures.length).toEqual(templateList.length);
  });

  it('should filter the list of templates to zero length', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    controller.setFilter('XX');
    expect(controller.filteredListOfFeatures.length).toEqual(0);
  });

  it('set the view to searched data and the chat template should come first and then callback template', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    controller.searchData('Dev');
    expect(controller.filteredListOfFeatures.length).toEqual(2);
    expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
    expect(controller.filteredListOfFeatures[1].name).toEqual('Sunlight Callback Dev Template');
  });

  it('set the view to the searched data which is case insensitive and the chat template should come first and then callback template', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    controller.searchData('Dev');
    expect(controller.filteredListOfFeatures.length).toEqual(2);
    expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
    expect(controller.filteredListOfFeatures[1].name).toEqual('Sunlight Callback Dev Template');
    controller.searchData('dev');
    expect(controller.filteredListOfFeatures.length).toEqual(2);
    expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
    expect(controller.filteredListOfFeatures[1].name).toEqual('Sunlight Callback Dev Template');
  });

  it('should filter the searched data from the list of Chat templates only', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    controller.searchData('Dev');
    controller.setFilter('chat');
    expect(controller.filteredListOfFeatures.length).toEqual(1);
    expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
  });

  it('should filter the searched data from the list of Callback templates only', function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    $scope.$apply();
    $timeout.flush();
    controller.searchData('Dev');
    controller.setFilter('callback');
    expect(controller.filteredListOfFeatures.length).toEqual(1);
    expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Callback Dev Template');
  });

});
