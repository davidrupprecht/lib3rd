import { isEmpty } from 'lodash';

import { log } from '../../utils/logging';

import { fillRow, IFormatConfig, IIe } from '../format/xlsx';
import { ConstraintSpec } from '../visitors/constraintSpec';
import { IModules } from '../visitors/modules';
import { AsnType } from './asnType';
import { IConstantAndModule } from './base';
import { Constraint } from './constraint';
import { IParameterMapping } from './definedType';

export class Null extends AsnType {
  public setConstraint(constraints: Array<Constraint | ConstraintSpec>): Null {
    if (!isEmpty(constraints)) {
      log.warn(`Null could not handle constraint ${JSON.stringify(constraints)}`);
    }
    return this;
  }

  public expand(asn1Pool: IModules, moduleName?: string): Null {
    return this;
  }

  public depthMax(): number {
    return 0;
  }

  public replaceParameters(paramterMapping: IParameterMapping[]): Null {
    return this;
  }

  public toString(): string {
    return 'NULL';
  }

  public fillWorksheet(ieElem: IIe, ws: any, row: number, col: number, depthMax: number,
                       constants: IConstantAndModule[], formatConfig: IFormatConfig,
                       depth: number = 0): [number, number] {
    ieElem.type = 'NULL';
    [row, col] = fillRow(ieElem, ws, row, col, depthMax, formatConfig, depth);
    return [row, col];
  }
}
