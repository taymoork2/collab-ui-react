  'use strict';
  describe('AddResourceControllerClusterViewV2', function () {
    beforeEach(angular.mock.module('Mediafusion'));
    var redirectTargetPromise, $q, httpBackend, controller, $state, $stateParams, AddResourceCommonServiceV2, XhrNotificationService, $translate;
    beforeEach(inject(function (_XhrNotificationService_, _$translate_, _$stateParams_, _AddResourceCommonServiceV2_, $httpBackend, $controller, _$q_) {
      $q = _$q_;
      httpBackend = $httpBackend;
      httpBackend.when('GET', /^\w+.*/).respond({});
      redirectTargetPromise = {
        then: sinon.stub()
      };
      $state = {
        'params': {
          'wizard': {},
          'firstTimeSetup': false,
          'yesProceed': true,
          'fromClusters': true
        },
        'modal': {
          close: sinon.stub()
        }
      };
      $stateParams = _$stateParams_;
      AddResourceCommonServiceV2 = _AddResourceCommonServiceV2_;
      $translate = _$translate_;
      XhrNotificationService = _XhrNotificationService_;
      controller = $controller('AddResourceControllerClusterViewV2', {
        $q: $q,
        XhrNotificationService: XhrNotificationService,
        $translate: $translate,
        $state: $state,
        $stateParams: $stateParams,
        AddResourceCommonServiceV2: AddResourceCommonServiceV2,
      });
    }));
    it('controller should be defined', function () {
      expect(controller).toBeDefined();
    });

    it('AddResourceCommonServiceV2.addRedirectTargetClicked should be called for addRedirectTargetClicked', function () {
      spyOn(AddResourceCommonServiceV2, 'addRedirectTargetClicked').and.returnValue(redirectTargetPromise);
      controller.addRedirectTargetClicked();
      expect(AddResourceCommonServiceV2.addRedirectTargetClicked).toHaveBeenCalled();
    });

    it('AddResourceCommonServiceV2.redirectPopUpAndClose should be called for redirectToTargetAndCloseWindowClicked', function () {
      spyOn(AddResourceCommonServiceV2, 'redirectPopUpAndClose').and.returnValue(redirectTargetPromise);
      controller.redirectToTargetAndCloseWindowClicked();
      expect(AddResourceCommonServiceV2.redirectPopUpAndClose).toHaveBeenCalled();
    });

    it('controller.addRedirectTargetClicked should be called for next', function () {
      controller.selectedCluster = 'selectedCluster';
      controller.hostName = 'hostName';
      spyOn(controller, 'addRedirectTargetClicked').and.returnValue(redirectTargetPromise);
      controller.next();
      expect(controller.addRedirectTargetClicked).toHaveBeenCalled();
    });

  });
