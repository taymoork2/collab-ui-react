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

    function initController(modal, onDestinationSave) {
      return $componentController('verifySipDestination', {
        $modal: modal,
      }, {
        destinationUrl: 'test.example.org',
        onDestinationSave: onDestinationSave,
      });
    }

    it ('should open the correct modal window ', () => {

      spyOn($modal, 'open').and.callFake(() => {
        return {
          result: $q.reject(false),
        };
      });
      ctrl = initController($modal, null);

      ctrl.openVerificationModal();
      $scope.$apply();

      expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
        controller: 'VerifySipDestinationModalController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/service-settings/verify-sip-destination/verify-sip-destination-modal.html',
      }));
    });

    it ('should on call the onDestinationSave() callback once when the user clicks save', () => {

      const onDestinationSave = jasmine.createSpy('onDestinationSave');

      ctrl = initController($modal, onDestinationSave);

      ctrl.save();
      $scope.$apply();
      expect(onDestinationSave.calls.count()).toBe(1);
    });

    it ('should not call the onDestinationSave() callback unless the user clicks save', () => {

      const onDestinationSave = jasmine.createSpy('onDestinationSave');

      ctrl = initController($modal, onDestinationSave);

      $scope.$apply();
      expect(onDestinationSave.calls.count()).toBe(0);
    });

  });


});
