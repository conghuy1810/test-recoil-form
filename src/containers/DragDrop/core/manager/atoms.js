import { atomFamily, selectorFamily, useRecoilState } from 'recoil';
import { gan, getNewRowId } from './atomUtils';
import { getPathInObj, isUndefined, setPathInObj, getRandomIntInclusive } from './utils';

export const formValuesAtom = atomFamily({
  key: gan('FormValues'),
  default: { values: {}, extraInfos: {} },
});

export const formPropsOverrideAtom = atomFamily({
  key: gan('FormPropsOverride'),
  default: { validate: null },
});

export const formInitialValuesAtom = atomFamily({
  key: gan('FormInitialValues'),
  default: {
    values: {},
    version: 0,
    extraInfos: {},
    settings: {
      skipUnregister: undefined,
      skipUnusedInitialValues: undefined,
    },
  },
});

export const combinedFieldAtomValues = {};

export const fieldAtomFamily = atomFamily({
  key: gan('FormFields'),
  default: param => {
    if (param.type === 'field') {
      return {
        initVer: 0,
        type: 'field',
      };
    }
    return {
      fieldNames: [],
      initVer: 0,
      rowIds: [],
      type: 'field-array',
    };
  },
  // TODO: Rename to effects for recoil 0.6
  // effects_UNSTABLE is still supported and will allow older versions of recoil to work
  effects: param => [
    ({ onSet, node }) => {
      onSet(newValue => {
        if (!combinedFieldAtomValues[param.formId]) {
          combinedFieldAtomValues[param.formId] = {
            fields: {},
            fieldArrays: {},
          };
        }
        const fieldsObj = combinedFieldAtomValues[param.formId].fields;
        const fieldArrObj = combinedFieldAtomValues[param.formId].fieldArrays;
        if (param.type === 'field') {
          fieldsObj[node.key] = {
            atomValue: newValue,
            param,
          };
        } else if (param.type === 'field-array') {
          fieldArrObj[node.key] = {
            atomValue: newValue,
            param,
          };
        }
      });
    },
  ],
});

export function resetFieldArrayRow(formId, params, get, reset) {
  const fieldArrayValue = get(
    fieldAtomFamily({
      ancestors: params.ancestors,
      name: params.name,
      type: 'field-array',
      formId,
    })
  );
  const fieldAncestors = params.ancestors?.length
    ? [...params.ancestors, { name: params.name, rowId: params.rowId }]
    : [{ name: params.name, rowId: params.rowId }];
  for (const field of fieldArrayValue.fieldNames) {
    if (typeof field === 'string') {
      reset(
        fieldAtomFamily({
          ancestors: fieldAncestors,
          name: field,
          type: 'field',
          formId,
        })
      );
    } else {
      if (field.type === 'field') {
        reset(
          fieldAtomFamily({
            ancestors: fieldAncestors,
            name: field.name,
            type: 'field',
            formId,
          })
        );
      } else {
        const fieldArrayValue = get(
          fieldAtomFamily({
            ancestors: fieldAncestors,
            name: field.name,
            type: 'field-array',
            formId,
          })
        );
        for (const rowId of fieldArrayValue.rowIds) {
          resetFieldArrayRow(
            formId,
            { ancestors: fieldAncestors, name: field.name, rowId },
            get,
            reset
          );
        }
      }
    }
  }
}

export function getFieldArrayDataAndExtraInfo(
  formId,
  params,
  get,
  validationParams,
  relativeAncestors
) {
  const isValidation = validationParams?.isValidation;
  const set = validationParams?.set;
  const skipFieldCheck = validationParams?.skipFieldCheck;
  let { name } = params;
  const data = [];
  const extraInfo = [];
  const errors = [];
  const fieldArrayAtom = fieldAtomFamily({
    ancestors: params.ancestors,
    name: params.name,
    type: 'field-array',
    formId,
  });
  const fieldArrayAtomValue = get(fieldArrayAtom);

  let rowIdx = -1;
  // TODO: Add support for otherParams in field array validation
  for (const rowId of fieldArrayAtomValue.rowIds) {
    const fieldAncestors = params.ancestors?.length
      ? [...params.ancestors, { rowId, name: params.name }]
      : [{ rowId, name: params.name }];
    rowIdx++;
    const fieldRelativeAncestors = relativeAncestors
      ? [...relativeAncestors, { name, rowId }]
      : [{ name, rowId }];
    data.push({});
    extraInfo.push({});
    const filteredFieldNames = fieldArrayAtomValue.fieldNames.filter(
      f =>
        !params.fieldNames ||
        params.fieldNames.indexOf(typeof f === 'string' ? f : f.name) !== -1
    );
    for (const field of filteredFieldNames) {
      if (typeof field === 'string') {
        const fieldAtom = fieldAtomFamily({
          name: field,
          type: 'field',
          ancestors: fieldAncestors,
          formId,
        });
        const fieldValue = get(fieldAtom);
        if (isValidation && !skipFieldCheck) {
          const error = fieldValue.validate?.(fieldValue.data);
          if (error) {
            errors.push({
              error,
              name: field,
              type: 'field',
              ancestors: fieldRelativeAncestors,
            });
            set?.(fieldAtom, val => ({
              ...val,
              error,
            }));
          }
        }
        setPathInObj(data[rowIdx], field, fieldValue.data);
        setPathInObj(extraInfo[rowIdx], field, fieldValue.extraInfo);
      } else {
        if (field.type === 'field') {
          const fieldAtom = fieldAtomFamily({
            name: field.name,
            type: 'field',
            ancestors: fieldAncestors,
            formId,
          });
          const fieldValue = get(fieldAtom);
          if (isValidation && !skipFieldCheck) {
            const error = fieldValue.validate?.(fieldValue.data);
            if (error) {
              errors.push({
                error,
                name: field.name,
                type: 'field',
                ancestors: fieldRelativeAncestors,
              });
              set?.(fieldAtom, val => ({
                ...val,
                error,
              }));
            }
          }
          setPathInObj(data[rowIdx], field.name, fieldValue.data);
          setPathInObj(extraInfo[rowIdx], field.name, fieldValue.extraInfo);
        } else {
          const {
            data: fieldData,
            extraInfo: fieldExtraInfo,
            errors: fieldErrors,
          } = getFieldArrayDataAndExtraInfo(
            formId,
            {
              name: field.name,
              ancestors: fieldAncestors,
            },
            get,
            validationParams,
            fieldRelativeAncestors
          );
          if (fieldErrors?.length) {
            errors.push(...fieldErrors);
          }
          if (!isUndefined(fieldData)) {
            setPathInObj(data[rowIdx], field.name, fieldData);
          }
          if (!isUndefined(fieldExtraInfo)) {
            setPathInObj(extraInfo[rowIdx], field.name, fieldExtraInfo);
          }
        }
      }
    }
  }
  if (isValidation) {
    const error = fieldArrayAtomValue.validate?.(data);
    if (error) {
      errors.push({
        error,
        name: name,
        type: 'field-array',
        ancestors: relativeAncestors ?? [],
      });
      set?.(fieldArrayAtom, val => ({
        ...val,
        error,
      }));
    }
  }
  return { data, extraInfo, errors };
}

export function setFieldArrayDataAndExtraInfo(formId, params, setParams) {
  let {
    get,
    set,
    reset,
    dataArr,
    extraInfoArr,
    initialValuesVersion,
    mode,
    fieldNames: childFields,
  } = setParams;
  if (!mode) {
    mode = { type: 'set' };
  }
  const fieldArrayParams = {
    ...params,
    formId,
    type: 'field-array',
  };
  const random = getRandomIntInclusive(0, 99999999);
  const fieldArrayAtomValue = get(fieldAtomFamily(fieldArrayParams));
  console.log(fieldArrayAtomValue, 'fieldArrayAtomValue', dataArr);
  if (fieldArrayAtomValue.type !== 'field-array') {
    throw new Error(
      'Please check the field type in field array since this seems to be a regular field but has been specified as a nested field array'
    );
  }
  const oldRowIds = fieldArrayAtomValue.rowIds;
  let dataRowsLength = dataArr?.length ?? 0;
  let rowIdsToRemove = [];
  let rowIds = [...oldRowIds];
  let startIndex = 0;
  if (!mode || mode.type === 'set') {
    if (oldRowIds.length > dataRowsLength) {
      rowIds = oldRowIds.slice(0, dataRowsLength);
      rowIdsToRemove = oldRowIds.slice(dataRowsLength, oldRowIds.length);
    } else if (oldRowIds.length < dataRowsLength) {
      const noOfElementsToAdd = dataRowsLength - oldRowIds.length;
      for (let i = 0; i < noOfElementsToAdd; i++) {
        rowIds.push(getNewRowId(rowIds));
      }
    }
    set(fieldAtomFamily(fieldArrayParams), val =>
      Object.assign({}, val, {
        rowIds,
        initVer: initialValuesVersion ?? val.initVer,
        fieldNames:
          initialValuesVersion && childFields?.length
            ? childFields
            : val.fieldNames,
      })
    );
    for (const rowId of rowIdsToRemove) {
      resetFieldArrayRow(formId, { ...fieldArrayParams, rowId }, get, reset);
    }
  } else if (mode.type === 'insert') {
    rowIds = [...oldRowIds];
    if (!dataRowsLength) {
      dataRowsLength = 1;
    }
    if (mode.rowIndex !== undefined) {
      startIndex = mode.rowIndex;
      for (let i = startIndex; i < startIndex + dataRowsLength; i++) {
        rowIds.splice(i, 0, getNewRowId(rowIds));
      }
    } else {
      startIndex = rowIds.length;
      for (let i = 0; i < dataRowsLength; i++) {
        rowIds.push(getNewRowId(rowIds));
      }
    }
    set(fieldAtomFamily(fieldArrayParams), val =>
      Object.assign({}, val, {
        rowIds,
        initVer: initialValuesVersion ?? val.initVer,
      })
    );
  }
  if (dataArr?.length) {
    for (
      let dataIdx = startIndex;
      dataIdx < startIndex + dataArr.length;
      dataIdx++
    ) {
      // Need to subtract startIndex because only the new data is passed during insert
      // For e.g. if startIndex is 1 and data is at index 0, we need to get the value at index 0 for row index 1.
      const fieldValues = dataArr[dataIdx - startIndex];
      const extraInfos = extraInfoArr?.[dataIdx - startIndex];
      const rowId = rowIds[dataIdx];
      const fieldAncestors = params.ancestors.length
        ? [...params.ancestors, { name: params.name, rowId }]
        : [{ name: params.name, rowId }];
      for (const field of fieldArrayAtomValue.fieldNames) {
        if (typeof field === 'string') {
          const data = getPathInObj(fieldValues, field);
          console.log(data, '>>>>>>>>>>>>>>>>>>');
          const extraInfo = getPathInObj(extraInfos, field);
          set(
            fieldAtomFamily({
              name: field,
              ancestors: fieldAncestors,
              type: 'field',
              formId,
            }),
            existingValue => {
              return Object.assign({}, existingValue, {
                data,
                extraInfo,
                initVer: random,
              });
            }
          );
        } else {
          if (field.type === 'field') {
            const data = getPathInObj(fieldValues, field.name);
            const extraInfo = getPathInObj(extraInfos, field.name);
            set(
              fieldAtomFamily({
                name: field.name,
                ancestors: fieldAncestors,
                type: 'field',
                formId,
              }),
              existingValue => {
                return Object.assign({}, existingValue, {
                  data,
                  extraInfo,
                  initVer: random,
                });
              }
            );
          } else if (field.type === 'field-array') {
            const data = getPathInObj(fieldValues, field.name);
            const extraInfo = getPathInObj(extraInfos, field.name);
            setFieldArrayDataAndExtraInfo(
              formId,
              { name: field.name, ancestors: fieldAncestors },
              {
                get,
                set,
                dataArr: data,
                reset,
                extraInfoArr: extraInfo,
                initialValuesVersion,
                // Use fieldNames only for initializing values workflow since the child atoms don't exist yet
                fieldNames: initialValuesVersion ? field.fieldNames : undefined,
                mode,
              }
            );
          }
        }
      }
    }
  }
}
export function getFieldArrayDataAndExtraInfoByRowId(
  formId,
  params,
  get,
  validationParams,
  relativeAncestors
) {
  const isValidation = validationParams?.isValidation;
  const set = validationParams?.set;
  const skipFieldCheck = validationParams?.skipFieldCheck;
  let { name, rowId } = params;
  const data = {};
  const extraInfo = {};
  const errors = {};
  const fieldArrayAtom = fieldAtomFamily({
    ancestors: params.ancestors,
    name: params.name,
    type: 'field-array',
    formId,
  });

  const fieldArrayAtomValue = get(fieldArrayAtom);
  // TODO: Add support for otherParams in field array validation
  const fieldAncestors = params.ancestors?.length
    ? [...params.ancestors, { rowId, name: params.name }]
    : [{ rowId, name: params.name }];
  const fieldRelativeAncestors = relativeAncestors
    ? [...relativeAncestors, { name, rowId }]
    : [{ name, rowId }];
  const filteredFieldNames = fieldArrayAtomValue.fieldNames.filter(
    f =>
      !params.fieldNames ||
      params.fieldNames.indexOf(typeof f === 'string' ? f : f.name) !== -1
  );
  for (const field of filteredFieldNames) {
    if (typeof field === 'string') {
      const fieldAtom = fieldAtomFamily({
        name: field,
        type: 'field',
        ancestors: fieldAncestors,
        formId,
      });
      const fieldValue = get(fieldAtom);
      if (isValidation && !skipFieldCheck) {
        const error = fieldValue.validate?.(fieldValue.data);
        if (error) {
          errors.push({
            error,
            name: field,
            type: 'field',
            ancestors: fieldRelativeAncestors,
          });
          set?.(fieldAtom, val => ({
            ...val,
            error,
          }));
        }
      }
      setPathInObj(data, field, fieldValue.data);
      setPathInObj(extraInfo, field, fieldValue.extraInfo);
    } else {
      if (field.type === 'field') {
        const fieldAtom = fieldAtomFamily({
          name: field.name,
          type: 'field',
          ancestors: fieldAncestors,
          formId,
        });
        const fieldValue = get(fieldAtom);
        if (isValidation && !skipFieldCheck) {
          const error = fieldValue.validate?.(fieldValue.data);
          if (error) {
            errors.push({
              error,
              name: field.name,
              type: 'field',
              ancestors: fieldRelativeAncestors,
            });
            set?.(fieldAtom, val => ({
              ...val,
              error,
            }));
          }
        }
        setPathInObj(data, field.name, fieldValue.data);
        setPathInObj(extraInfo, field.name, fieldValue.extraInfo);
      } else {
        const {
          data: fieldData,
          extraInfo: fieldExtraInfo,
          errors: fieldErrors,
        } = getFieldArrayDataAndExtraInfo(
          formId,
          {
            name: field.name,
            ancestors: fieldAncestors,
          },
          get,
          validationParams,
          fieldRelativeAncestors
        );
        if (fieldErrors?.length) {
          errors.push(...fieldErrors);
        }
        if (!isUndefined(fieldData)) {
          setPathInObj(data, field.name, fieldData);
        }
        if (!isUndefined(fieldExtraInfo)) {
          setPathInObj(extraInfo, field.name, fieldExtraInfo);
        }
      }
    }
  }
  if (isValidation) {
    const error = fieldArrayAtomValue.validate?.(data);
    if (error) {
      errors.push({
        error,
        name: name,
        type: 'field-array',
        ancestors: relativeAncestors ?? [],
      });
      set?.(fieldArrayAtom, val => ({
        ...val,
        error,
      }));
    }
  }
  return { data, extraInfo, errors };
}
/**
 * Gets the data for particular fields from the field array.
 * Note that it's assumed that user is listening to field in the lowest field array.
 * This method won't work correctly if the referenced field doesn't have data (i.e. is a field array)
 */
export const fieldArrayColAtomValueSelectorFamily = selectorFamily({
  key: gan('FieldArrayColAtomValueSelector'),
  get: ({ formId, ancestors, fieldArrayName, fieldNames }) => {
    return ({ get }) => {
      const { data, extraInfo } = getFieldArrayDataAndExtraInfo(
        formId,
        {
          ancestors: ancestors ?? [],
          name: fieldArrayName,
          fieldNames,
        },
        get
      );
      return { values: data, extraInfos: extraInfo };
    };
  },
});

export const multipleFieldsSelectorFamily = selectorFamily({
  key: gan('FormFieldsSelector'),
  get: fieldNames => {
    return ({ get }) => {
      if (!fieldNames?.length) {
        return { values: {}, extraInfos: {} };
      }
      const values = {};
      const extraInfos = {};
      const initialAtomVal = get(
        formInitialValuesAtom(fieldNames?.[0]?.formId)
      );
      for (const fieldInfo of fieldNames) {
        const fieldAtomVal = get(
          fieldAtomFamily({
            ancestors: fieldInfo.ancestors ?? [],
            name: fieldInfo.name,
            type: 'field',
            formId: fieldInfo.formId,
          })
        );
        setPathInObj(
          values,
          fieldInfo.name,
          fieldAtomVal?.data === undefined
            ? getPathInObj(initialAtomVal?.values ?? {}, fieldInfo.name)
            : fieldAtomVal?.data
        );
        setPathInObj(
          extraInfos,
          fieldInfo.name,
          fieldAtomVal?.extraInfo === undefined
            ? getPathInObj(initialAtomVal?.extraInfos ?? {}, fieldInfo.name)
            : fieldAtomVal?.extraInfo
        );
      }
      return { values, extraInfos };
    };
  },
});
