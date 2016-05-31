'use strict';

describe('Care Feature Ctrl should ', function () {

  var controller, $filter, $q, $rootScope, $state, $scope, $timeout, Authinfo, CareFeatureList, Log, Notification, deferred;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('Test-Org-Id')
  };

  var templateList = getJSONFixture('sunlight/json/features/chatTemplates/chatTemplateList.json');
  var emptyListOfCTs = [];
  var justOneChatTemplate = templateList[0];

  var getChatTemplatesSuccess = function (data) {
    return data;
  };
  var getChatTemplateFailure = function () {
    return {
      'data': 'Internal Server Error',
      'status': 500,
      'statusText': 'Internal Server Error'
    };
  };

  beforeEach(module('Sunlight'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $controller, _$filter_, _$state_, _$q_, _$timeout_, _$window_, _Authinfo_, _CareFeatureList_, _Notification_, _Log_) {
    $rootScope = _$rootScope_;
    $filter = _$filter_;
    $q = _$q_;
    $state = _$state_;
    $timeout = _$timeout_;
    $scope = _$rootScope_.$new();
    Authinfo = _Authinfo_;
    CareFeatureList = _CareFeatureList_;
    Log = _Log_;
    Notification = _Notification_;

    //create mock deferred object which will be used to return promises
    deferred = $q.defer();
    spyOn(CareFeatureList, 'getChatTemplates').and.returnValue(deferred.promise);
    spyOn($state, 'go');

    controller = $controller('CareFeaturesCtrl', {
      $scope: $scope,
      $state: $state,
      $timeout: $timeout,
      $filter: $filter,
      Authinfo: Authinfo,
      CareFeatureList: CareFeatureList,
      Log: Log,
      Notification: Notification
    });
  }));

  it('initialize and get the list of chat templates and update pageState ', function () {
    expect(controller.pageState).toEqual('Loading');
    deferred.resolve(getChatTemplatesSuccess(templateList));
    $scope.$apply();
    $timeout.flush();
    expect(controller.pageState).toEqual('ShowFeatures');
  });

  it('initialize and show error page when get chat templates fails ', function () {
    expect(controller.pageState).toEqual('Loading');
    deferred.reject(getChatTemplateFailure);
    $scope.$apply();
    $timeout.flush();
    expect(controller.pageState).toEqual('Error');
  });

  it('initialize and show New Feature page when chat templates are empty ', function () {
    expect(controller.pageState).toEqual('Loading');
    deferred.resolve(getChatTemplatesSuccess(emptyListOfCTs));
    $scope.$apply();
    $timeout.flush();
    expect(controller.pageState).toEqual('NewFeature');
  });

  it('able to call delete function and inturn the $state service ', function () {
    deferred.resolve(getChatTemplatesSuccess(templateList));
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

  it('able to receive the CARE_FEATURE_DELETED event when chat template gets deleted and template should be deleted from local copy', function () {
    deferred.resolve(getChatTemplatesSuccess(templateList));
    $scope.$apply();
    $timeout.flush();
    var featureTobBeDeleted = templateList[0];
    controller.deleteCareFeature(featureTobBeDeleted);
    $rootScope.$broadcast('CARE_FEATURE_DELETED', {
      deleteFeatureName: featureTobBeDeleted.name,
      deleteFeatureId: featureTobBeDeleted.templateId,
      deleteFeatureType: featureTobBeDeleted.featureType
    });
    expect(controller.listOfFeatures).not.toEqual(jasmine.arrayContaining([featureTobBeDeleted]));
  });

  it('able to receive the CARE_FEATURE_DELETED event when chat template gets deleted and change pageState to NewFeature when no templates to show', function () {
    deferred.resolve(getChatTemplatesSuccess([justOneChatTemplate]));
    $scope.$apply();
    $timeout.flush();
    var featureTobBeDeleted = justOneChatTemplate;
    controller.deleteCareFeature(featureTobBeDeleted);
    $rootScope.$broadcast('CARE_FEATURE_DELETED', {
      deleteFeatureName: featureTobBeDeleted.name,
      deleteFeatureId: featureTobBeDeleted.templateId,
      deleteFeatureType: featureTobBeDeleted.featureType
    });
    expect(controller.listOfFeatures).not.toEqual(jasmine.arrayContaining([featureTobBeDeleted]));
    expect(controller.pageState).toEqual('NewFeature');
  });

  it('set the view to searched data', function () {
    deferred.resolve(getChatTemplatesSuccess(templateList));
    $scope.$apply();
    $timeout.flush();
    controller.searchData(templateList[0].name);
    expect(controller.listOfFeatures).toEqual([templateList[0]]);
  });

});
