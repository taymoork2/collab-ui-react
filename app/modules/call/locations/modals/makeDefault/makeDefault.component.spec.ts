import makeDefault from 'modules/call/locations/';

describe('component: MakeDefaultLocationComponent', () => {
  beforeEach(function() {
    this.initModules(makeDefault);
    this.injectDependencies(
      '$scope',
      'LocationsService',
      '$q',
      'Notification',
    );
    this.$scope.close = jasmine.createSpy('close');
    spyOn(this.LocationsService, 'createLocation');
    spyOn(this.LocationsService, 'updateLocation').and.returnValue(this.$q.resolve());
    this.compileComponent('makeDefaultLocation', {
      close: 'close()',
    });
  });

  it('should update', function() {
    this.view.find('button.btn--primary').click();
    expect(this.LocationsService.updateLocation).toHaveBeenCalled();
    expect(this.$scope.close).toHaveBeenCalled();
  });

  describe('Negative test', () => {
    beforeEach(function() {
      spyOn(this.Notification, 'errorResponse');
      this.LocationsService.updateLocation.and.returnValue(this.$q.reject());
    });
    it('should throw an error', function() {
      this.view.find('button.btn--primary').click();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });
  });

});

