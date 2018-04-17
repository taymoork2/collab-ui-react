'use strict';

var testModule = require('./index').default;

describe('Service: ModalService', function () {
  var ModalService, $modal;

  var myTitle = 'myTitle';
  var myMessage = 'myMessage';
  var myClose = 'myClose';
  var myDismiss = 'myDismiss';
  var myType = 'myType';

  afterEach(function () {
    ModalService = $modal = undefined;
  });

  afterAll(function () {
    myTitle = myMessage = myClose = myDismiss = myType = undefined;
  });

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(function (_ModalService_, _$modal_) {
    ModalService = _ModalService_;
    $modal = _$modal_;

    spyOn($modal, 'open').and.callThrough();
  }));

  // TODO how to verify resolve arguments?
  it('should open modal with specified values', function () {
    ModalService.open({
      title: myTitle,
      message: myMessage,
      close: myClose,
      dismiss: myDismiss,
      btnType: myType,
    });
    expect($modal.open).toHaveBeenCalledWith({
      template: require('modules/core/modal/modal.tpl.html'),
      controller: 'ModalCtrl',
      controllerAs: 'modal',
      type: 'dialog',
      resolve: {
        title: jasmine.any(Function),
        message: jasmine.any(Function),
        close: jasmine.any(Function),
        dismiss: jasmine.any(Function),
        btnType: jasmine.any(Function),
        hideTitle: jasmine.any(Function),
        hideDismiss: jasmine.any(Function),
      },
    });
  });
});
