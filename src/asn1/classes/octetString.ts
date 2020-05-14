import { fillRow, IFormatConfig, IIe } from '../format/xlsx';
import { BuiltinValue } from '../visitors/builtinValue';
import { ConstraintSpec } from '../visitors/constraintSpec';
import { IModules } from '../visitors/modules';
import { AsnType } from './asnType';
import { IConstantAndModule } from './base';
import { Constraint } from './constraint';
import { IParameterMapping } from './definedType';

export class OctetString extends AsnType {
  public size: BuiltinValue;
  public sizeMin: BuiltinValue;
  public sizeMax: BuiltinValue;
  public containing: AsnType;

  public setConstraint(constraints: Array<Constraint | ConstraintSpec>): OctetString {
    this.constraints = constraints;
    return this;
  }

  public expand(asn1Pool: IModules, moduleName?: string): OctetString {
    return this;
  }

  public depthMax(): number {
    return 0;
  }

  public replaceParameters(paramterMapping: IParameterMapping[]): OctetString {
    return this;
  }

  public toString(): string {
    const size = this.size !== undefined ? ` (SIZE (${this.size}))` :
    this.sizeMin !== undefined && this.sizeMax !== undefined ? ` (SIZE (${this.sizeMin}..${this.sizeMax}))` : '';
    return `OCTET STRING${this.constraintsToString()}${size}`;
  }

  public fillWorksheet(ieElem: IIe, ws: any, row: number, col: number, depthMax: number,
                       constants: IConstantAndModule[], formatConfig: IFormatConfig,
                       depth: number = 0): [number, number] {
    ieElem.type = this.toString();
    [row, col] = fillRow(ieElem, ws, row, col, depthMax, formatConfig, depth);
    this.addToConstants(this.size, constants);
    this.addToConstants(this.sizeMin, constants);
    this.addToConstants(this.sizeMax, constants);
    return [row, col];
  }
}
