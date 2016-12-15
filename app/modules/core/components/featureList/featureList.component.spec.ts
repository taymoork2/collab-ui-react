import { IFeature } from './featureList.component';

describe('Component: featureList', () => {
  let features: IFeature[] | undefined;

  afterEach(function () {
    features = undefined;
    if (this.view) {
      this.view.remove();
    }
  });

  beforeEach(function() {
    features = [
      {
        name: 'Message',
        icon: 'icon-message',
        state: 'user-overview.messaging',
        detail: 'Message Detail',
        actionAvailable: false,
      },
      {
        name: 'Meeting',
        icon: 'icon-meeting',
        state: 'user-overview.conferencing',
        detail: 'Meeting Detail',
        actionAvailable: false,
      },
      {
        name: 'Call',
        icon: 'icon-call',
        state: 'user-overview.communication',
        detail: 'Call Detail',
        actionAvailable: true,
      },
    ];
    this.initModules('Core');
    this.injectDependencies('$scope');
    this.$scope.features = features;
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  describe('with onFeatureClick', () => {
    beforeEach(function () {
      this.compileComponent('featureList', { features: 'features', onFeatureClick: 'onChangeFn(feature)' });
    });

    it('should list each feature', function() {
      expect(this.view.find('li.feature').length).toEqual(3);
    });

    it('should have a feature-icon', function() {
      expect(this.view.find('li.feature').first().find('.feature-icon')).toHaveClass('icon-message');
    });

    it('should have a feature-name', function() {
      expect(this.view.find('li.feature').first().find('.feature-name')).toHaveText('Message');
    });

    it('should have a feature-status', function() {
      expect(this.view.find('li.feature').first().find('.feature-status')).toHaveText('Message Detail');
    });

    it('should have a nonclickable feature if no action available', function () {
      this.view.find('li.feature').first().find('a').click();
      expect(this.$scope.onChangeFn).not.toHaveBeenCalled();

      expect(this.view.find('li.feature').first().find('.feature-arrow')).not.toExist();
      expect(this.view.find('li.feature').first().find('a')).toHaveClass('no-services');
      expect(this.view.find('li.feature').first().find('.feature-status')).toHaveClass('feature-arrow-match');
    });

    it('should have a clickable feature if action available', function() {
      this.view.find('li.feature').last().find('a').click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(this.controller.features[2]);

      expect(this.view.find('li.feature').last().find('.feature-arrow')).toExist();
      expect(this.view.find('li.feature').last().find('a')).not.toHaveClass('no-services');
      expect(this.view.find('li.feature').last().find('.feature-status')).not.toHaveClass('feature-arrow-match');
    });

    it('should switch from .feature-status to .feature-details if no actions in feature list', function () {
      this.controller.features.pop();
      this.$scope.$apply();

      expect(this.view.find('li.feature').length).toEqual(2);
      expect(this.view.find('li.feature').first().find('.feature-status')).not.toExist();
      expect(this.view.find('li.feature').first().find('.feature-details')).toHaveText('Message Detail');
    });
  });

  describe('without onFeatureClick', () => {
    beforeEach(function () {
      this.compileComponent('featureList', { features: 'features' });
    });

    it('should list each feature', function() {
      expect(this.view.find('li.feature').length).toEqual(3);
    });

    it('should have a feature-icon', function() {
      expect(this.view.find('li.feature').first().find('.feature-icon')).toHaveClass('icon-message');
    });

    it('should have a feature-name', function() {
      expect(this.view.find('li.feature').first().find('.feature-name')).toHaveText('Message');
    });

    it('should have a feature-details', function() {
      expect(this.view.find('li.feature').first().find('.feature-details')).toHaveText('Message Detail');
    });

    it('should not have an anchor action', function() {
      expect(this.view.find('li.feature').first().find('a')).not.toExist();
    });

  });
});
