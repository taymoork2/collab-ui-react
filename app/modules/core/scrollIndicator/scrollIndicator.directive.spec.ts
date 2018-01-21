
import { ScrollIndicatorController } from './scrollIndicator.directive';
import testModule from './index';

describe('Directive: scrollIndicator', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$interval',
      '$document',
    );
    jQuery.fx.off = true;

    this.compileDirective = (directive = 'scroll-indicator') => {
      this.compileTemplate(`
      <div class="outer">
        <div class="container" ${directive} style="background-color: yellow; height: 5em; width: 100%; overflow: scroll;">
          <ol>
            ${_.repeat('<li>ITEM</li>', 10)}
          </ol>
        </div>
      </div>
        `);
      this.$document[0].body.appendChild(this.view[0]);
      // we need to ensure the eoc-tag element has some height so we can pick it from the document
      this.$document.find('.container .scroll-indicator-eoc-tag').css({ height: '1px', margin: '1px 0', 'background-color': 'green' });
    };

    this.testScrollFunctionality = (isEnabled = true) => {
      const scrollIndicator = this.$document.find('.outer .scroll-indicator');
      // initial state for directive is a hidden indicator
      expect(scrollIndicator).toHaveClass('ng-hide');
      this.$interval.flush(ScrollIndicatorController.MORE_CONTENT_CHECK_INTERVAL * 2);
      // after interval detects elements, should indicator be shown?
      isEnabled ? expect(scrollIndicator).not.toHaveClass('ng-hide') : expect(scrollIndicator).toHaveClass('ng-hide');

      // if scroll indicator is enabled, click and verify
      if (isEnabled) {
        scrollIndicator.find('.icon').click();
        // after animation scrolls and interval detects change, indicator should be hidden again
        this.$interval.flush(ScrollIndicatorController.MORE_CONTENT_CHECK_INTERVAL * 2);
        expect(scrollIndicator).toHaveClass('ng-hide');
      }
    };

    this.resetScrollIndicatorToTop = () => {
      this.$document.find('[scroll-indicator]').animate({
        scrollTop: 0,
      });
    };
  });

  afterEach(function () {
    jQuery.fx.off = false;
  });

  describe('Without attribute value', () => {
    beforeEach(function () {
      this.compileDirective();
    });

    it('should inject required HTML', function () {
      const container = this.$document.find('.container')[0];
      expect(_.isElement(container)).toBeTruthy();

      // ensure the visibility tag element is in the container
      const eocTag = this.$document.find('.container .scroll-indicator-eoc-tag')[0];
      expect(_.isElement(eocTag)).toBeTruthy();

      // ensure indicator element is not in the scrolling container
      const noIndicator = this.$document.find('.container .scroll-indicator')[0];
      expect(angular.isElement(noIndicator)).toBeFalsy();

      // ensure the indicator element is child of the outer container
      const indicator = this.$document.find('.outer .scroll-indicator')[0];
      expect(angular.isElement(indicator)).toBeTruthy();

      // ensure the indicator contains the icon
      const icon = $(indicator).find('.icon');
      expect(angular.isElement(icon)).toBeTruthy();
    });

    it('should show indicator and scroll correctly', function () {
      this.testScrollFunctionality();
    });
  });

  describe('With attribute value', () => {
    beforeEach(function () {
      this.$scope.shouldShowIndicator = false;
      this.compileDirective('scroll-indicator="{{ shouldShowIndicator }}"');
    });

    it('should not add indicator elements if false', function () {
      expect(this.$document.find('.container .scroll-indicator-eoc-tag')).not.toExist();
      expect(this.$document.find('.outer .scroll-indicator')).not.toExist();
    });

    it('should add indicator elements after switching attribute flag to true', function () {
      this.$scope.shouldShowIndicator = true;
      this.$scope.$apply();

      expect(this.$document.find('.container .scroll-indicator-eoc-tag')).toExist();
      expect(this.$document.find('.outer .scroll-indicator')).toExist();
    });

    it('should work correctly while toggling between true and false', function () {
      this.$scope.shouldShowIndicator = true;
      this.$scope.$apply();
      this.testScrollFunctionality();

      this.resetScrollIndicatorToTop();

      this.$scope.shouldShowIndicator = false;
      this.$scope.$apply();
      this.testScrollFunctionality(false);

      this.resetScrollIndicatorToTop();

      this.$scope.shouldShowIndicator = true;
      this.$scope.$apply();
      this.testScrollFunctionality();
    });
  });
});
