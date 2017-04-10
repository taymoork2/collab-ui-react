export class CardUtils {
  public Masonry;
  private static readonly CARD = '.cs-card';
  private static readonly CARD_LAYOUT = '.cs-card-layout';

  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
  ) {
    this.Masonry = require('masonry-layout');
  }

  public resize(delay: number = 0, selector: string = CardUtils.CARD_LAYOUT): void {
    this.$timeout((): void => {
      let masonryElements = $(selector);
      if (masonryElements.length) {
        const cardlayout = new this.Masonry(masonryElements[0], {
          itemSelector: CardUtils.CARD,
          columnWidth: CardUtils.CARD,
          resize: true,
          percentPosition: true,
        });
        cardlayout.layout();
      }
    }, delay);
  }
}
