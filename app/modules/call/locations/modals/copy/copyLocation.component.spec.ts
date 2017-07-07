import copyLocation from './../../index';

describe('component: copyLocation', () => {
  beforeEach(function() {
    this.initModules(copyLocation);
    this.injectDependencies(
      '$scope',
      'LocationsService',
      '$q',
      'Notification',
    );
    this.$scope.close = jasmine.createSpy('close');
    spyOn(this.LocationsService, 'createLocation');
    this.LocationsService.createLocation.and.returnValue(this.$q.resolve());
    this.compileComponent('copyLocation', {
      close: 'close()',
    });
  });

  it('should save', function() {
    this.view.find('button#saveCopyLocation').click();
    expect(this.LocationsService.createLocation).toHaveBeenCalled();
    expect(this.$scope.close).toHaveBeenCalled();
  });
});

describe('Failure for createLocation', () => {
  beforeEach(function() {
    this.initModules(copyLocation);
    this.injectDependencies(
      '$scope',
      'LocationsService',
      '$q',
      'Notification',
     );
    spyOn(this.LocationsService, 'createLocation');
    spyOn(this.Notification, 'errorResponse');
    this.compileComponent('copyLocation', {});
    this.LocationsService.createLocation.and.returnValue(this.$q.reject());
  });
  it('should throw an error', function() {
    this.view.find('button#saveCopyLocation').click();
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });
});

