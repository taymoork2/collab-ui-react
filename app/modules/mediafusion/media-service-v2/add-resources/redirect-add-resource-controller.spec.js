  'use strict';
  describe('RedirectAddResourceControllerV2', function () {
    beforeEach(angular.mock.module('Mediafusion'));
    var redirectTargetPromise, $q, httpBackend, controller, $state, $stateParams, AddResourceCommonServiceV2, XhrNotificationService, $translate, $modalInstance, $modal, firstTimeSetup, yesProceed;
    beforeEach(inject(function (_XhrNotificationService_, _$translate_, _$state_, _$stateParams_, _AddResourceCommonServiceV2_, $httpBackend, $controller, _$q_, _$modal_) {
      $q = _$q_;
      httpBackend = $httpBackend;
      httpBackend.when('GET', /^\w+.*/).respond({});
      redirectTargetPromise = {
        then: sinon.stub()
      };
      $state = _$state_;
      $stateParams = _$stateParams_;
      AddResourceCommonServiceV2 = _AddResourceCommonServiceV2_;
      $translate = _$translate_;
      XhrNotificationService = _XhrNotificationService_;
      $modalInstance = {
        close: sinon.stub()
      };
      $modal = _$modal_;
      yesProceed = true;
      firstTimeSetup = true;
      controller = $controller('RedirectAddResourceControllerV2', {
        $q: $q,
        XhrNotificationService: XhrNotificationService,
        $translate: $translate,
        $state: $state,
        $stateParams: $stateParams,
        AddResourceCommonServiceV2: AddResourceCommonServiceV2,
        $modalInstance: $modalInstance,
        $modal: $modal,
        yesProceed: yesProceed,
        firstTimeSetup: firstTimeSetup
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
