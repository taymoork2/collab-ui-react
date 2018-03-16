'use strict';

describe('Component: HybridContextResourcesComponent', function () {
  var $componentCtrl, $scope, ctrl, $state, ContextAdminAuthorizationService, $translate, $q;
  var AdminAuthorizationStatus = require('modules/context/services/context-authorization-service').AdminAuthorizationStatus;

  beforeEach(angular.mock.module('Context'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);
  // need to cleanup here to prevent more memory leaks
  afterAll(function () {
    $componentCtrl = $scope = ctrl = $state = $q = ContextAdminAuthorizationService = $translate = undefined;
  });

  function dependencies($rootScope, _$componentController_, _$state_, _$q_, _ContextAdminAuthorizationService_, _$translate_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    ContextAdminAuthorizationService = _ContextAdminAuthorizationService_;
    $translate = _$translate_;
    $q = _$q_;
    $componentCtrl = _$componentController_;
  }

  function initController() {
    ctrl = $componentCtrl('contextResourcesSubHeader', {
      $state: $state,
      ContextAdminAuthorizationService: ContextAdminAuthorizationService,
      $translate: $translate,
      $scope: $scope,
      disableAddResourceButton: false,
    });
    return ctrl;
  }

  function initSpies() {
    spyOn($state, 'go');
    spyOn(ContextAdminAuthorizationService, 'getAdminAuthorizationStatus').and.returnValue($q.resolve(AdminAuthorizationStatus.UNKNOWN));
  }

  describe('getAdminAuthorizationStatus()', function () {
    it('should not set tooltip or disable button, if admin is authorized', function () {
      ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.AUTHORIZED));
      ctrl = initController();
      $scope.$apply();

      expect(ctrl.disableAddResourceButton).toBe(false);
      expect(ctrl.addResourceButtonTooltip).toBe('');
    });

    it('should set tooltip and disable button, if admin is not authorized', function () {
      ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.UNAUTHORIZED));
      ctrl = initController();
      $scope.$apply();

      expect(ctrl.disableAddResourceButton).toBe(true);
      expect(ctrl.addResourceButtonTooltip).toBe($translate.instant('context.dictionary.resource.notAuthorized'));
    });

    it('should set tooltip and disable button, if admin authorization is unknown', function () {
      ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue($q.resolve(AdminAuthorizationStatus.UNKNOWN));
      ctrl = initController();
      $scope.$apply();

      expect(ctrl.disableAddResourceButton).toBe(true);
      expect(ctrl.addResourceButtonTooltip).toBe($translate.instant('context.dictionary.unknownAdminAuthorizationStatus'));
    });
  });
});
