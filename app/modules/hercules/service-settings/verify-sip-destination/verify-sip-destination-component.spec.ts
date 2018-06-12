import verifySipDestination from './index';

describe('Component: VerifySipDestinationComponent ', () => {

  let $componentController, $scope, ctrl;

  beforeEach(function () {
    this.initModules(verifySipDestination);
  });

  describe ('controller ', () => {

    beforeEach(inject((_$componentController_, _$modal_, _$q_, $rootScope) => {
      $componentController = _$componentController_;
      $scope = $rootScope.$new();
    }));

    function initController(onDestinationSave) {
      return $componentController('verifySipDestination', {}, {
        destinationUrl: 'test.example.org',
        onDestinationSave: onDestinationSave,
      });
    }

    it ('should on call the onDestinationSave() callback once when the user clicks save', () => {

      const onDestinationSave = jasmine.createSpy('onDestinationSave');

      ctrl = initController(onDestinationSave);

      ctrl.save();
      $scope.$apply();
      expect(onDestinationSave.calls.count()).toBe(1);
    });

    it ('should not call the onDestinationSave() callback unless the user clicks save', () => {

      const onDestinationSave = jasmine.createSpy('onDestinationSave');

      ctrl = initController(onDestinationSave);

      $scope.$apply();
      expect(onDestinationSave.calls.count()).toBe(0);
    });

  });

});
