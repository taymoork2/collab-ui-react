import pstnContactInfo from './pstnContactInfo';
import pstnProviders from './pstnProviders';
import pstnSwivelNumbers from './pstnSwivelNumbers';
import pstnTermsOfService from './pstnTermsOfService';
import PstnService from './pstn.service';
import PstnModel from './pstn.model';

export {
  TIMEOUT,
  SWIVEL,
  MIN_VALID_CODE,
  MAX_VALID_CODE,
  NPA,
  NXX,
  MAX_DID_QUANTITY,
  NUMTYPE_DID,
  NUMTYPE_TOLLFREE,
  NXX_EMPTY,
  TOLLFREE_ORDERING_CAPABILITY,
  NUMBER_ORDER,
  PORT_ORDER,
  BLOCK_ORDER,
  SWIVEL_ORDER,
  ORDER,
  MIN_BLOCK_QUANTITY,
  MAX_BLOCK_QUANTITY,
  TOKEN_FIELD_ID,
  PSTN,
  GROUP_BY,
  INTELEPEER,
  TATA,
  TELSTRA,
  WESTUC,
  UPDATE,
  DELETE,
  ADD,
  AUDIT,
  CANCELLED,
  PENDING,
  PROVISIONED,
  QUEUED,
  TYPE_PORT,
  ADMINTYPE_PARTNER,
  ADMINTYPE_CUSTOMER,
} from './pstn.const';


export {
  PstnService,
  PstnModel,
};

export default angular
  .module('huron.pstn', [
    pstnContactInfo,
    pstnProviders,
    pstnSwivelNumbers,
    pstnTermsOfService,
    PstnService,
    PstnModel,
  ]).name;
