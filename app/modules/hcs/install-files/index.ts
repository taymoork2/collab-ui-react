import './install-files.scss';
import { InstallFilesComponent } from './install-files.component';
import modalServiceModule from 'modules/core/modal';

export default angular
  .module('hcs.installFiles', [
    modalServiceModule,
  ])
.component('hcsInstallFiles', new InstallFilesComponent())
.name;
