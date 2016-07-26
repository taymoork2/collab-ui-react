'use strict';

describe('Controller: TrialExtInterestCtrl', function () {
  var $rootScope, $location, Log, TrialExtInterestService, $controller, controller, $q;
  var eqpParam = 'hi';

  beforeEach(module('Core'));

  beforeEach(inject(function (_$rootScope_, _$location_, _Log_, _TrialExtInterestService_, _$controller_, _$q_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $location = _$location_;
    Log = _Log_;
    TrialExtInterestService = _TrialExtInterestService_;
    $q = _$q_;

    spyOn(TrialExtInterestService, 'notifyPartnerAdmin').and.returnValue($q.reject());
    spyOn($location, 'search').and.returnValue({
      eqp: null
    });
    spyOn(Log, 'error');
  }));

  function initController() {
    controller = $controller('TrialExtInterestCtrl');
    $rootScope.$apply();
  }

  describe('Without an encrypted query param', function () {

    beforeEach(initController);

    it('should initialize properly', function () {
      expect(controller).toBeDefined();
      expect(controller.success).toBeFalsy();
      expect(controller.badLink).toBeTruthy();
      expect(controller.error).toBeFalsy();
      expect(Log.error).toHaveBeenCalled();
    });
  });

  describe('With an encrypted query param', function () {

    beforeEach(function () {
      $location.search.and.returnValue({
        eqp: eqpParam
      });
    });

    it('should call through to TrialExtInterestService.notifyPartnerAdmin', function () {
      initController();
      expect(TrialExtInterestService.notifyPartnerAdmin).toHaveBeenCalledWith(eqpParam);
      expect(controller.success).toBeFalsy();
      expect(controller.badLink).toBeFalsy();
      expect(controller.error).toBeTruthy();
    });

    describe('With a successful service call', function () {
      beforeEach(function () {
        TrialExtInterestService.notifyPartnerAdmin.and.returnValue($q.when());
        initController();
      });

      it('should call through to TrialExtInterestService.notifyPartnerAdmin', function () {
        expect(TrialExtInterestService.notifyPartnerAdmin).toHaveBeenCalledWith(eqpParam);
        expect(controller.success).toBeTruthy();
        expect(controller.error).toBeFalsy();
        expect(controller.badLink).toBeFalsy();
      });
    });
  });

});
