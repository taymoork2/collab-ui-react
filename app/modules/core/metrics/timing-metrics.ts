import {
  MarkKey,
  MeasureKey,
  TimingKey,
} from './metrics.keys';

export enum PerformanceType {
  MARK = 'mark',
  MEASURE = 'measure',
}

type MarkOrPerformanceTimingKey = MarkKey | keyof PerformanceTiming;

export class TimingMetric {
  public static readonly FETCH_START = 'fetchStart';

  constructor(
    public key: TimingKey,
    public measure: MeasureKey,
    public markStart: MarkOrPerformanceTimingKey = TimingMetric.FETCH_START,
    public markStop?: MarkOrPerformanceTimingKey,
  ) {}
}

export const timingMetrics = [
  new TimingMetric(TimingKey.LOGIN_DURATION, MeasureKey.LOGIN_DURATION, TimingMetric.FETCH_START, MarkKey.LOGIN_STOP),
];
