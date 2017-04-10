'use strict';

var testModule = require('./index').default;

describe('Controller: ModalCtrl', function () {

  function init() {
    var _this = this;

    _this.data = {
      title: 'myTitle',
      message: 'myMessage',
      close: 'myClose',
      dismiss: 'myDismiss',
      btnType: 'myBtnType',
      hideTitle: false,
      hideDismiss: false,
    };

    this.initModules(testModule, function ($provide) {
      $provide.value("title", _this.data.title);
      $provide.value("message", _this.data.message);
      $provide.value("close", _this.data.close);
      $provide.value("dismiss", _this.data.dismiss);
      $provide.value("btnType", _this.data.btnType);
      $provide.value("hideTitle", _this.data.hideTitle);
      $provide.value("hideDismiss", _this.data.hideDismiss);
    });
    this.injectDependencies(
      '$rootScope',
      '$controller'
    );

    initController.apply(_this);
  }

  function initController() {
    this.$scope = this.$rootScope.$new();
    this.controller = this.$controller('ModalCtrl', {
      $scope: this.$scope,
    });

    this.$scope.$apply();
  }

  beforeEach(init);

  ///////////////////

  it('should set provided values', function () {
    expect(this.controller.title).toEqual(this.data.title);
    expect(this.controller.message).toEqual(this.data.message);
    expect(this.controller.close).toEqual(this.data.close);
    expect(this.controller.dismiss).toEqual(this.data.dismiss);
    expect(this.controller.btnType).toEqual(this.data.btnType);
    expect(this.controller.hideTitle).toEqual(this.data.hideTitle);
    expect(this.controller.hideDismiss).toEqual(this.data.hideDismiss);
  });

});
