export interface IPDFMakeContent extends IPDFMakeBase {
  bold?: boolean;
  text?: string;
  canvas?: ICanvas[];
  colSpan?: number;
  columns?: IPDFMakeContent[];
  columnGap?: number;
  fit?: number[];
  image?: any;
  pageBreak?: string;
  stack?: IPDFMakeContent[];
  table?: IPDFMakeTable;
  width?: number | string;
}

export interface IPDFMakeLayout {
  content: IPDFMakeContent[];
  footer?: Function | string;
  header?: Function | string;
  styles?: any;
}

// private interfaces
interface ICanvas {
  type: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lineWidth: number;
}

interface IPDFMakeTable extends IPDFMakeBase {
  widths: (number | string)[];
  headerRows: number;
  body: IPDFMakeContent[];
}

interface IPDFMakeBase {
  alignment?: string;
  fillColor?: string;
  style?: string | string[];
}
