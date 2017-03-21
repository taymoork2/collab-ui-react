import verifySipDestination from './index';

describe('Component: VerifySipDestinationComponent ', () => {

  let $componentController, $modal, $q, $scope, ctrl;

  beforeEach(function () {
    this.initModules(verifySipDestination);
  });

  describe ('controller ', () => {

    beforeEach(inject((_$componentController_, _$modal_, _$q_, $rootScope) => {
      $componentController = _$componentController_;
      $modal = _$modal_;
      $q = _$q_;
      $scope = $rootScope.$new();
    }));

    function initController(modal, onDestinationSave, onDestinationClear) {
      return $componentController('verifySipDestination', {
        $modal: modal,
      }, {
        destinationUrl: 'test.example.org',
        onDestinationSave: onDestinationSave,
        onDestinationClear: onDestinationClear,
      });
    }

    it ('should open the correct modal window ', () => {

      spyOn($modal, 'open').and.callFake(() => {
        return {
          result: $q.reject(false),
        };
      });
      ctrl = initController($modal, null, null);

      ctrl.openVerificationModal();
      $scope.$apply();

      expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
        controller: 'VerifySipDestinationModalController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/service-settings/verify-sip-destination/verify-sip-destination-modal.html',
      }));
    });

    it ('should on success call the onDestinationSave() callback once ', () => {

      let onDestinationSave = jasmine.createSpy('onDestinationSave');
      let onDestinationClear = jasmine.createSpy('onDestinationClear');

      spyOn($modal, 'open').and.callFake(() => {
        return {
          result: $q.resolve(true),
        };
      });

      ctrl = initController($modal, onDestinationSave, onDestinationClear);

      ctrl.openVerificationModal();
      $scope.$apply();
      expect(onDestinationSave.calls.count()).toBe(1);
      expect(onDestinationClear.calls.count()).toBe(0);
    });

    it ('should call onDestinationClear() on modal dismiss, but only if we have errors ', () => {

      let onDestinationSave = jasmine.createSpy('onDestinationSave');
      let onDestinationClear = jasmine.createSpy('onDestinationClear');

      spyOn($modal, 'open').and.callFake(() => {
        return {
          result: $q.reject(true),
        };
      });

      ctrl = initController($modal, onDestinationSave, onDestinationClear);

      ctrl.openVerificationModal();
      $scope.$apply();
      expect(onDestinationSave.calls.count()).toBe(0);
      expect(onDestinationClear.calls.count()).toBe(1);
    });

    it ('should do nothing on modal dismiss, if there were no errors ', () => {

      let onDestinationSave = jasmine.createSpy('onDestinationSave');
      let onDestinationClear = jasmine.createSpy('onDestinationClear');

      spyOn($modal, 'open').and.callFake(() => {
        return {
          result: $q.reject(false),
        };
      });

      ctrl = initController($modal, onDestinationSave, onDestinationClear);

      ctrl.openVerificationModal();
      $scope.$apply();
      expect(onDestinationSave.calls.count()).toBe(0);
      expect(onDestinationClear.calls.count()).toBe(0);
    });

  });


});
