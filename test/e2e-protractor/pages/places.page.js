'use strict';

exports.buttons = {
  addPlace: element(by.className('add-button')),
};

exports.addPlaceWizard = {
  title: element(by.cssContainingText('.modal-title', 'Add Place')),
  newSharedSpace: {
    nameInput: element(by.id('newPlace')),
  },
  chooseDeviceType: {
    cloudberryTypeButton: element(by.id('cloudberryTypeButton')),
  },
  editServices: {
    firstServiceOption: element(by.id('service1')),
  },
  showActivationCode: {
    qrCodeImage: element(by.className('qrCodeImage')),
    activationCode: element(by.className('activation-code')),
  },
  nextButton: element(by.cssContainingText('.btn', 'Next')),
  closeButton: element(by.className('close')),
};

exports.placeOverview = {
  title: element(by.className('place-header-title-edit')),
  close: element(by.className('panel-close')),
};

exports.searchInput = element(by.id('searchFilter'));

exports.placeNameInList = function (name) {
  return element(by.cssContainingText('.ui-grid-cell-contents', name));
};

exports.placeListAction = element(by.id('actionsButton'));

exports.placeListActionDelete = element(by.id('deletePlaceOption'));

exports.deleteConfirmation = {
  title: element(by.cssContainingText('.modal-title', 'Delete Place')),
  deletePlaceButton: element(by.className('btn--negative')),
};
