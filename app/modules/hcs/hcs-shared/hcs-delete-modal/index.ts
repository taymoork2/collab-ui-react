import { HcsDeleteModalComponent } from './hcs-delete-modal.component';
import './hcs-delete-modal.scss';

export default angular
  .module('hcs.deleteModal', [])
  .component('hcsDeleteModal', new HcsDeleteModalComponent())
  .name;
