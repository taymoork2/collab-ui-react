'use strict';

describe('Service: ModalService', function () {
  var ModalService, $modal;

  var myTitle = 'myTitle';
  var myMessage = 'myMessage';
  var myClose = 'myClose';
  var myDismiss = 'myDismiss';
  var myType = 'myType';
  var mySize = 'mySize';

  beforeEach(module('Core'));

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
      size: mySize
    });
    expect($modal.open).toHaveBeenCalledWith({
      size: mySize,
      templateUrl: 'modules/core/modal/modal.tpl.html',
      controller: 'ModalCtrl',
      controllerAs: 'modal',
      type: 'dialog',
      resolve: {
        title: jasmine.any(Function),
        message: jasmine.any(Function),
        close: jasmine.any(Function),
        dismiss: jasmine.any(Function),
        btnType: jasmine.any(Function)
      }
    });
  });

});
