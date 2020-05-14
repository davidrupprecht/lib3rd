import { fillRow, IFormatConfig, IIe } from '../format/xlsx';
import { BuiltinValue } from '../visitors/builtinValue';
import { ConstraintSpec } from '../visitors/constraintSpec';
import { IModules } from '../visitors/modules';
import { INamedNumberList } from '../visitors/namedNumberList';
import { AsnType } from './asnType';
import { IConstantAndModule } from './base';
import { Constraint } from './constraint';
import { IParameterMapping } from './definedType';

export class Integer extends AsnType {
  public namedNumberList: INamedNumberList;
  public value: BuiltinValue;
  public min: BuiltinValue;
  public max: BuiltinValue;

  constructor(namedNumberList: INamedNumberList) {
    super();

    this.namedNumberList = namedNumberList;
  }

  public setConstraint(constraints: Array<Constraint | ConstraintSpec>): Integer {
    this.constraints = constraints;
    return this;
  }

  public expand(asn1Pool: IModules, moduleName?: string): Integer {
    return this;
  }

  public depthMax(): number {
    return 0;
  }

  public replaceParameters(paramterMapping: IParameterMapping[]): Integer {
    return this;
  }

  public toString(): string {
    return `INTEGER${this.constraintsToString()}`;
  }

  public fillWorksheet(ieElem: IIe, ws: any, row: number, col: number, depthMax: number,
                       constants: IConstantAndModule[], formatConfig: IFormatConfig,
                       depth: number = 0): [number, number] {
    ieElem.type = this.toString();
    [row, col] = fillRow(ieElem, ws, row, col, depthMax, formatConfig, depth);
    this.addToConstants(this.value, constants);
    this.addToConstants(this.min, constants);
    this.addToConstants(this.max, constants);
    return [row, col];
  }
}
