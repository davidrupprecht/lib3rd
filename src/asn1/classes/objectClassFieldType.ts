import { Worksheet } from 'exceljs';
import { cloneDeep, isEqual } from 'lodash';
import { todo, unimpl, unreach } from 'unimpl';
import { setOutlineLevel, IRowInput, drawBorder } from '../../common/spreadsheet';
import { IParameterMapping } from '../expander';
import { HEADER_REFERENCE } from '../formatter/spreadsheet';
import { AsnType, DefinedObjectClass } from './asnType';
import { ComponentRelationConstraint } from './componentRelationConstraint';
import { Constraint } from './constraint';
import { ContentsConstraint } from './contentsConstraint';
import { FixedTypeValueFieldSpec } from './fixedTypeValueFieldSpec';
import { InnerTypeConstraints } from './innerTypeConstraints';
import { Modules } from './modules';
import { ObjectClassAssignment } from './objectClassAssignment';
import { ObjectSet } from './objectSet';
import { ObjectSetAssignment } from './objectSetAssignment';
import { ParameterizedTypeAssignment } from './parameterizedTypeAssignment';
import { PrimitiveFieldName } from './primitiveFieldName';
import { TypeAssignment } from './typeAssignment';
import { TypeFieldSpec } from './typeFieldSpec';
import { TypeReference } from './typeReference';
import { ValueAssignment } from './valueAssignment';

/**
 * X.681 clause 14
 * ```
 * definedObjectClass.primitiveFieldName[0]....primitiveFieldName[n-1] ( constraint )
 * ```
 */
export class ObjectClassFieldType {
  public definedObjectClass: DefinedObjectClass;
  public fieldName: PrimitiveFieldName[];
  public constraint: Constraint | undefined;

  public reference: string | undefined;

  private objectClassFieldType: undefined;

  constructor(
    definedObjectClass: DefinedObjectClass,
    fieldName: PrimitiveFieldName[],
  ) {
    this.definedObjectClass = definedObjectClass;
    this.fieldName = fieldName;
  }

  // eslint-disable-next-line no-unused-vars
  public expand(modules: Modules, parameterMappings: IParameterMapping[]): AsnType {
    const assignment = modules.findAssignment(
      this.definedObjectClass.objectClassReference,
    );
    if (assignment === undefined) {
      return this;
    }
    if (assignment instanceof TypeAssignment) {
      return unimpl();
    }
    if (assignment instanceof ObjectClassAssignment) {
      if (this.fieldName.length !== 1) {
        return unimpl();
      }
      const fieldName = this.fieldName[0];
      const { objectClass } = assignment;
      const { fieldSpecs } = objectClass;
      const fieldSpec = fieldSpecs.find(
        (fs) => fs.fieldReference.toString() === fieldName.toString(),
      );
      if (fieldSpec === undefined) {
        return this;
      }
      if (fieldSpec instanceof TypeFieldSpec) {
        const newTypeReference = new TypeReference(fieldSpec.fieldReference.toString());
        newTypeReference.reference = this.toString();
        return newTypeReference;
      }
      if (fieldSpec instanceof FixedTypeValueFieldSpec) {
        const expandedType = cloneDeep(fieldSpec.asnType).expand(modules, []);
        if (isEqual(expandedType, fieldSpec.asnType)) {
          fieldSpec.asnType.reference = this.toString();
          return fieldSpec.asnType;
        }
        if (expandedType instanceof ObjectSet) {
          return unimpl();
        }
        expandedType.reference = this.toString();
        return expandedType;
      }
      return todo();
    }
    if (assignment instanceof ObjectSetAssignment) {
      return unimpl();
    }
    if (assignment instanceof ParameterizedTypeAssignment) {
      return unimpl();
    }
    if (assignment instanceof ValueAssignment) {
      return unimpl();
    }
    return unreach();
  }

  // eslint-disable-next-line class-methods-use-this
  public getDepth(): number {
    return 0;
  }

  public setConstraints(constraints: Constraint[]) {
    if (constraints.length === 0) {
      return;
    }
    if (constraints.length > 1) {
      unimpl();
    }
    const constraint = constraints[0];
    const { constraintSpec } = constraint;
    if (constraintSpec instanceof ContentsConstraint) {
      unimpl();
    } else if (constraintSpec instanceof InnerTypeConstraints) {
      unimpl();
    } else if (constraintSpec instanceof ObjectSet) {
      unimpl();
    } else if (constraintSpec instanceof ComponentRelationConstraint) {
      this.constraint = constraint;
    } else {
      unimpl();
    }
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
    const fieldNamesString = this.fieldName
      .map((primitiveFieldName) => primitiveFieldName.toString())
      .join('.');
    const outerString = `${this.definedObjectClass.toString()}.${fieldNamesString}`;
    if (this.constraint === undefined) {
      return outerString;
    }
    return `${outerString} ${this.constraint.toString()}`;
  }
}
