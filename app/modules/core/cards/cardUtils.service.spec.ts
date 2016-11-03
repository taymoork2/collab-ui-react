import cards from './index';

describe('Service: CardUtils', () => {
  beforeEach(function () {
    this.initModules(cards);
    this.injectDependencies(
      '$document',
      '$timeout',
      'CardUtils',
    );
    this.Masonry = {
      layout: jasmine.createSpy('layout'),
    };
    spyOn(this.CardUtils, 'Masonry').and.returnValue(this.Masonry);
  });

  afterEach(function () {
    this.$document.find('.cs-card-layout').remove();
    this.$document.find('.cs-card-layout-custom').remove();
  });

  it('should invoke masonry layout if element exists', function () {
    this.$document.find('body').append('<div class="cs-card-layout"></div>');
    this.CardUtils.resize();

    expect(this.CardUtils.Masonry).not.toHaveBeenCalled();
    expect(this.Masonry.layout).not.toHaveBeenCalled();

    this.$timeout.flush();
    expect(this.CardUtils.Masonry).toHaveBeenCalledWith('.cs-card-layout', {
      itemSelector: '.cs-card',
      columnWidth: '.cs-card',
      resize: true,
      percentPosition: true,
    });
    expect(this.Masonry.layout).toHaveBeenCalled();
  });

  it('should invoke masonry layout if custom element exists', function () {
    this.$document.find('body').append('<div class="cs-card-layout-custom"></div>');
    this.CardUtils.resize(0, '.cs-card-layout-custom');

    expect(this.CardUtils.Masonry).not.toHaveBeenCalled();
    expect(this.Masonry.layout).not.toHaveBeenCalled();

    this.$timeout.flush();
    expect(this.CardUtils.Masonry).toHaveBeenCalledWith('.cs-card-layout-custom', {
      itemSelector: '.cs-card',
      columnWidth: '.cs-card',
      resize: true,
      percentPosition: true,
    });
    expect(this.Masonry.layout).toHaveBeenCalled();
  });

  it('should not invoke masonry layout if element doens\'t exist', function () {
    this.CardUtils.resize();

    expect(this.CardUtils.Masonry).not.toHaveBeenCalled();
    expect(this.Masonry.layout).not.toHaveBeenCalled();

    this.$timeout.flush();
    expect(this.CardUtils.Masonry).not.toHaveBeenCalled();
    expect(this.Masonry.layout).not.toHaveBeenCalled();
  });
});
