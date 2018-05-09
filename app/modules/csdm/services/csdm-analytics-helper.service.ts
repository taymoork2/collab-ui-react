import { ISuggestion } from './search/suggestion';
import { SearchObject } from './search/searchObject';
import { FieldQuery } from './search/searchElement';

export interface ICsdmAnalyticHelper {
  trackSuggestionAction(clickSource: string, suggestion: ISuggestion | FieldQuery | null);

  trackSearchAction(querySource: string, search: SearchObject, resultSize: number, queryCount: number);

  trackBulkAction(action: BulkActionName, params: IBulkParam);

  trackBulkExport(params: IExportParam);

  trackExpandDevice(selectedDevices: number, device: csdm.IDevice);
}

interface IBulkParam {
  mainAction?: BulkActionName;
  selectedDevices?: number;
  totalSearchHits?: number;
  totalSuccessSize?: number;
}

interface IExportParam extends IBulkParam {
  selectedExportFields?: string[];
}

export class CsdmAnalyticsValues {
  //action source
  public static MOUSE = 'MOUSE';
  public static KEY = 'KEYBOARD';
  public static SLICE = 'SLICE';
  public static LEGEND = 'LEGEND';

  //actions
  public static INITIAL_SEARCH = 'INITIAL_SEARCH';
  public static SEARCH = 'SEARCH';
}

export enum BulkActionName {
  COMPLETE, DELETE, DELETE_FAKE, DELETE_ASK, SELECT, SELECT_ALL, EXPORT, EXPORT_ASK,
}

export class CsdmAnalyticsHelper implements ICsdmAnalyticHelper {

  private lastSelectionSize: number;
  private lastResultSize: number;
  private lastQueryCount: number;
  private lastMainAction: BulkActionName;

  /* @ngInject */
  constructor(private Analytics) {
  }

  public trackSuggestionAction(clickSource: string, suggestion: ISuggestion | null | FieldQuery) {
    if (!suggestion) {
      return;
    }
    if (suggestion instanceof FieldQuery) {
      return this.trackSearchClick(clickSource, suggestion);
    }
    this.Analytics.trackEvent(this.Analytics.sections.DEVICE_SEARCH.eventNames.SELECT_SUGGESTION, {
      suggestion_click: clickSource,
      suggestion_field: _.toLower(suggestion.field || 'ANY_FIELD'),
      suggestion_length: (suggestion.searchString || '').length,
      suggestion_rank: suggestion.rank,
      suggestion_count: suggestion.count,
      suggestion_field_only: suggestion.isFieldSuggestion,
    });
  }

  private trackSearchClick(clickSource: string, fieldQuery: FieldQuery) {
    if (!fieldQuery) {
      return;
    }
    this.Analytics.trackEvent(this.Analytics.sections.DEVICE_SEARCH.eventNames.SELECT_SUGGESTION, {
      suggestion_click: clickSource,
      suggestion_field: _.toLower(fieldQuery.field || 'ANY_FIELD'),
      suggestion_length: (fieldQuery.query || '').length,
    });
  }

  public trackSearchAction(querySource: string, search: SearchObject, resultSize: number, queryCount: number) {
    if (!search) {
      return;
    }
    this.lastResultSize = resultSize;
    this.lastQueryCount = queryCount;
    const query = search.getTranslatedQueryString(null) || '';
    this.Analytics.trackEvent(this.Analytics.sections.DEVICE_SEARCH.eventNames.PERFORM_SEARCH, {
      query_length: query.length,
      query_error: search.hasError,
      query_source: querySource,
      query_count: queryCount,
      query_result: resultSize,
    });
  }

  public trackExpandDevice(selectCount: number, device: csdm.IDevice) {
    this.Analytics.trackEvent(this.Analytics.sections.DEVICE_SEARCH.eventNames.EXPAND_DEVICE, {
      bulk_size: selectCount,
      device_type: device && device.accountType,
      device_status: device && device.cssColorClass,
      query_result: this.lastResultSize,
      query_count: this.lastQueryCount,
    });
  }

  public trackBulkExport({ mainAction = this.lastMainAction, selectedDevices = this.lastSelectionSize, totalSuccessSize, totalSearchHits = this.lastResultSize, selectedExportFields }: IExportParam) {
    this.Analytics.trackEvent(this.getActionName(mainAction), {
      bulk_action: this.getActionName(mainAction),
      bulk_size: selectedDevices,
      bulk_success: totalSuccessSize,
      query_result: totalSearchHits,
      query_count: this.lastQueryCount,
      selectedExportFields: selectedExportFields,
    });
    this.lastResultSize = totalSearchHits;
    this.lastSelectionSize = selectedDevices;
    this.lastMainAction = mainAction;
  }

  public trackBulkAction(action: BulkActionName, { mainAction = this.lastMainAction, selectedDevices = this.lastSelectionSize, totalSuccessSize, totalSearchHits = this.lastResultSize }: IBulkParam) {
    this.Analytics.trackEvent(this.getActionName(action), {
      bulk_action: this.getActionName(mainAction),
      bulk_size: selectedDevices,
      bulk_success: totalSuccessSize,
      query_result: totalSearchHits,
      query_count: this.lastQueryCount,
    });
    this.lastResultSize = totalSearchHits;
    this.lastSelectionSize = selectedDevices;
    this.lastMainAction = mainAction;
  }

  private getActionName(actionName: BulkActionName): string {
    switch (actionName) {
      case BulkActionName.COMPLETE:
        return this.Analytics.sections.DEVICE_BULK.eventNames.COMPLETE;
      case BulkActionName.DELETE:
        return this.Analytics.sections.DEVICE_BULK.eventNames.DELETE;
      case BulkActionName.DELETE_ASK:
        return this.Analytics.sections.DEVICE_BULK.eventNames.DELETE_ASK;
      case BulkActionName.DELETE_FAKE:
        return this.Analytics.sections.DEVICE_BULK.eventNames.DELETE_FAKE;
      case BulkActionName.EXPORT:
        return this.Analytics.sections.DEVICE_BULK.eventNames.EXPORT;
      case BulkActionName.EXPORT_ASK:
        return this.Analytics.sections.DEVICE_BULK.eventNames.EXPORT_ASK;
      case BulkActionName.SELECT:
        return this.Analytics.sections.DEVICE_BULK.eventNames.SELECT;
      case BulkActionName.SELECT_ALL:
        return this.Analytics.sections.DEVICE_BULK.eventNames.SELECT_ALL;
      default:
        return this.Analytics.sections.DEVICE_BULK.eventNames.BULK;
    }
  }
}
