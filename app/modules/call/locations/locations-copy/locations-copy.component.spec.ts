import copyLocation from './index';

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
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.LocationsService, 'getLocation').and.returnValue(this.$q.resolve({}));
    this.compileComponent('ucCopyLocation', {
      close: 'close()',
    });
  });

  it('should save', function () {
    spyOn(this.LocationsService, 'createLocation').and.returnValue(this.$q.resolve());
    this.view.find('button#saveCopyLocation').click();
    expect(this.LocationsService.createLocation).toHaveBeenCalled();
    expect(this.$scope.close).toHaveBeenCalled();
    expect(this.Notification.errorResponse).not.toHaveBeenCalled();
  });

  it('should throw an error if createLoction rejects', function () {
    spyOn(this.LocationsService, 'createLocation').and.returnValue(this.$q.reject());
    this.view.find('button#saveCopyLocation').click();
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });
});
