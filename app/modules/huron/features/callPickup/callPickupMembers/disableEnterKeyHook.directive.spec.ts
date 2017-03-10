import directiveModule from './index';

describe('Directive: disabledEnterKeyHook', () => {
  let dropdown;
  let ENTER_KEY = 13;

  beforeEach(function() {
    this.initModules(directiveModule);
    this.injectDependencies(
      '$scope',
      '$compile',
    );
    let dropdown_template = '<input disable-enter-key-hook> <ul class="dropdown-menu ng-isolate-scope"> </ul> </input>';
    dropdown = this.$compile(angular.element(dropdown_template))(this.$scope);
  });

  describe('Test keydown events', () => {

    it('should prevent enter if member is disabled', function () {
      let model = { disabled: true };
      let match = { model: model };

      let typeaheadFakeScope = function() {
        return {
          find: function() {
            return {
              scope: function() {
                return {
                  activeIdx: 0,
                  matches: [ match ],
                };
              },
            };
          },
        };
      };

      spyOn(angular, 'element').and.callFake(typeaheadFakeScope);
      let e = $.Event('keydown', { keyCode: ENTER_KEY });
      let spy = spyOn(e, 'preventDefault');
      $(dropdown).trigger(e);
      expect(spy).toHaveBeenCalled();
    });

    it('should not prevent enter if member is not disabled', function () {
      let model = { disabled: false };
      let match = { model: model };

      let element = function() {
        return {
          find: function() {
            return {
              scope: function() {
                return {
                  activeIdx: 0,
                  matches: [ match ],
                  select: function() { return; },
                };
              },
            };
          },
        };
      };

      spyOn(angular, 'element').and.callFake(element);
      let e = $.Event('keydown', { keyCode: ENTER_KEY });
      let spy = spyOn(e, 'preventDefault');
      $(dropdown).trigger(e);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
