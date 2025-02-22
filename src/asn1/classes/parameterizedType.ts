import { Worksheet } from 'exceljs';
import { cloneDeep, isEqual } from 'lodash';
import { unimpl, unreach } from 'unimpl';
import { setOutlineLevel, IRowInput, drawBorder } from '../../common/spreadsheet';
import { IParameterMapping } from '../expander';
import { HEADER_REFERENCE } from '../formatter/spreadsheet';
import { AsnType, DefinedObjectClass } from './asnType';
import { Constraint } from './constraint';
import { ExternalTypeReference } from './externalTypeReference';
import { Modules } from './modules';
import { ObjectClassAssignment } from './objectClassAssignment';
import { ObjectIdentifierValue } from './objectIdentifierValue';
import { ObjectSet } from './objectSet';
import { ObjectSetAssignment } from './objectSetAssignment';
import { ParameterizedTypeAssignment } from './parameterizedTypeAssignment';
import { TypeAssignment } from './typeAssignment';
import { TypeReference } from './typeReference';
import { Value } from './value';
import { ValueAssignment } from './valueAssignment';

export type ActualParameter = AsnType | Value | DefinedObjectClass | ObjectSet;

export class ParameterizedType {
  public simpleDefinedType: TypeReference | ExternalTypeReference;
  public actualParameters: ActualParameter[];

  public reference: string | undefined;

  private paramterizedTypeTag: undefined;

  constructor(
    simpleDefinedType: TypeReference | ExternalTypeReference,
    actualParameters: ActualParameter[],
  ) {
    this.simpleDefinedType = simpleDefinedType;
    this.actualParameters = actualParameters;
  }

  /**
   * Expand the parameterized type.
   * @param modules
   * @param parameterMappings
   * @returns Returns {@link AsnType} of {@link ObjectSet}.
   * {@link ObjectSet} is only applicable when expanding RAN3 ASN.1 spec.
   */
  public expand(
    modules: Modules,
    parameterMappings: IParameterMapping[],
  ): AsnType | ObjectSet {
    if (this.simpleDefinedType instanceof ExternalTypeReference) {
      return unimpl();
    }
    const parameterMappedToReference = parameterMappings.find(
      (parameterMapping) => (
        parameterMapping.parameter.dummyReference
          === this.simpleDefinedType.typeReference
      ),
    );
    if (parameterMappedToReference === undefined) {
      // A case that TypeReference shall be expanded
      const assignment = modules.findAssignment(
        this.simpleDefinedType.typeReference,
      );
      if (assignment === undefined) {
        return unimpl();
      }
      if (assignment instanceof TypeAssignment) {
        return unimpl();
      }
      if (assignment instanceof ObjectClassAssignment) {
        return unimpl();
      }
      if (assignment instanceof ObjectSetAssignment) {
        return unimpl();
      }
      if (assignment instanceof ParameterizedTypeAssignment) {
        // Prepare the base of parameter mapping
        const parameterMappingsNew: IParameterMapping[] = assignment.parameters.map(
          (parameter) => ({ parameter, actualParameter: undefined }),
        );
          // Substitute an actual parameter with the passed parameter
        const actualParametersNew: ActualParameter[] = this.actualParameters.map(
          (actualParameter) => {
            if (!(actualParameter instanceof ObjectIdentifierValue)) {
              return actualParameter;
            }
            const { objectIdComponentsList } = actualParameter;
            if (objectIdComponentsList.length !== 1) {
              return unimpl();
            }
            const objectIdComponents = objectIdComponentsList[0];
            if (typeof objectIdComponents !== 'string') {
              return unimpl();
            }
            const parameter = parameterMappings.find((parameterMapping) => (
              parameterMapping.parameter.dummyReference
                  === objectIdComponents
            ));
            if (parameter === undefined) {
              return objectIdComponents;
            }
            if (parameter.actualParameter === undefined) {
              return actualParameter;
            }
            return parameter.actualParameter;
          },
        );
          // Map each parameter and actual parameter
        if (parameterMappingsNew.length !== actualParametersNew.length) {
          return unimpl();
        }
        parameterMappingsNew.forEach((parameterMapping, index) => {
          // eslint-disable-next-line no-param-reassign
          parameterMapping.actualParameter = actualParametersNew[index];
        });
        const expandedType = cloneDeep(assignment.asnType).expand(
          modules,
          parameterMappingsNew,
        );
        if (isEqual(expandedType, assignment.asnType)) {
          assignment.asnType.reference = this.toStringHelper(actualParametersNew);
          return assignment.asnType;
        }
        expandedType.reference = this.toStringHelper(actualParametersNew);
        return expandedType;
      }
      if (assignment instanceof ValueAssignment) {
        return unimpl();
      }
    } else if (parameterMappedToReference.actualParameter === undefined) {
      // A case that a type reference shall be left as-is. Do nothing.
      return this;
    } else {
      return unimpl();
    }
    return unreach();
  }

  // eslint-disable-next-line class-methods-use-this
  public getDepth(): number {
    return 0;
  }

  // eslint-disable-next-line class-methods-use-this
  public setConstraints(constraints: Constraint[]) {
    if (constraints.length === 0) {
      return;
    }
    unimpl();
  }

  public toSpreadsheet(worksheet: Worksheet, row: IRowInput, depth: number) {
    if (this.reference && !row[HEADER_REFERENCE]) {
      // eslint-disable-next-line no-param-reassign
      row[HEADER_REFERENCE] = this.reference;
    }
    // eslint-disable-next-line no-param-reassign
    row[HEADER_REFERENCE] = this.toString();
    const r = worksheet.addRow(row);
    setOutlineLevel(r, depth);
    drawBorder(worksheet, r, depth);
  }

  public toString(): string {
    return this.toStringHelper(this.actualParameters);
  }

  private toStringHelper(actualParameters: ActualParameter[]) {
    const innerString = actualParameters
      .map((parameter) => parameter.toString())
      .join(', ');
    return `${this.simpleDefinedType.toString()} {${innerString}}`;
  }
}
