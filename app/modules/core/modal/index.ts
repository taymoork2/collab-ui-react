
const ModalService = require('./modal.service');
const ModalCtrl = require('./modal.controller');

/**
 * Add a type to the default Modal settings (used by $modal)
 */
interface IToolkitModalSettings extends ng.ui.bootstrap.IModalSettings {
  close?: string;
  dismiss?: string;
  hideDismiss?: boolean;
  hideTitle?: boolean;
  message?: string;
  modalClass?: string;
  title?: string;
  type?: string;
}

/**
 * Modal that uses the IModalSettings settings (used by $modal)
 */
interface IToolkitModalService extends ng.ui.bootstrap.IModalService {
  open(options: IToolkitModalSettings): ng.ui.bootstrap.IModalServiceInstance;
}

/**
 * Instance of a Modal from $modal.open
 */
interface IToolkitModalServiceInstance extends ng.ui.bootstrap.IModalServiceInstance {
}

export { IToolkitModalService, IToolkitModalSettings, IToolkitModalServiceInstance };

export default angular
  .module('core.modal', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('angular-sanitize'),
  ])
  .service('ModalService', ModalService)
  .controller('ModalCtrl', ModalCtrl)
  .name;
