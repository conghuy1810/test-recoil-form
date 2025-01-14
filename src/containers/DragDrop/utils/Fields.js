import * as React from 'react';
import {
  useField,
  useFieldArray,
  useFieldArrayColumnWatch,
  useFieldWatch,
} from '../core/manager/FormProvider';
import Button from './Button';

export function FileField(props) {
  const field = useField({
    name: props.name,
    defaultValue: null,
  });
  return (
    <div>
      <input
        type="file"
        onChange={async (evt) => {
          const file = evt.currentTarget.files?.[0];
          if (file) {
            field.setFieldValue(
              {
                name: file.name,
                type: file.type,
              },
              { file }
            );
          } else {
            field.setFieldValue(null);
          }
        }}
      />
    </div>
  );
}

export function InputField(props) {
  const field = useField({
    ancestors: props.ancestors,
    name: props.name,
    validate: props.validate,
    defaultValue: props.defaultValue,
    depFields: props.depFields,
  });
  return (
    <div className="flex flex-col items-start mb-4">
      <label
        htmlFor={props.name}
        className="block text-sm font-medium text-gray-700 capitalize mb-1"
      >
        {props.label ?? props.name}
      </label>
      <input
        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
        id={props.name}
        type={props.type}
        name={props.name}
        disabled={props.disabled}
        onChange={(evt) => {
          if (props.type === 'number') {
            try {
              const val = parseInt(evt.target.value);
              field.setFieldValue(val);
            } catch (err) {}
          } else {
            field.setFieldValue(evt.target.value);
          }
          props.onChange?.(evt.target.value);
        }}
        value={field.fieldValue ?? ''}
        onBlur={field.onBlur}
      />
      {field.error && <div className="text-red-500 text-sm">{field.error}</div>}
    </div>
  );
}

export function WatchField(props) {
  const field = useFieldWatch({
    fieldNames: [props.fieldId],
  });
  return (
    <div>{`Value for watching field id: ${props.fieldId} = ${JSON.stringify(
      field.values ?? {}
    )}`}</div>
  );
}

export function SelectField(props) {
  const field = useField({
    ancestors: props.ancestors,
    name: props.name,
    validate: props.validate,
    defaultValue: props.defaultValue,
    depFields: props.depFields,
  });
  return (
    <div className="flex flex-col items-start mb-4">
      <label
        htmlFor={props.name}
        className="block text-sm font-medium text-gray-700 capitalize mb-1"
      >
        {props.label ?? props.name}
      </label>

      <select
        id={props.name}
        name={props.name}
        disabled={props.disabled}
        onChange={(evt) => {
          field.setFieldValue(evt.target.value);
          props.onChange?.(evt.target.value);
        }}
        value={field.fieldValue ?? ''}
        onBlur={field.onBlur}
        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
      >
        {props.options?.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {field.error && <div className="text-red-500 text-sm">{field.error}</div>}
    </div>
  );
}

export function TableField(props) {
  const tableField = useFieldArray({
    fieldNames: props.fields.map((f) => f.name),
    name: props.name,
    validate: (value) =>
      value?.length <= 1 ? 'Need at least two rows' : undefined,
  });

  return (
    <div>
      <label htmlFor={props.name} className="capitalize">
        {props.name}
      </label>
      <table id={props.name}>
        <tbody>
          {tableField.fieldArrayProps.rowIds.map((r, idx) => {
            return (
              <tr key={r}>
                <React.Fragment>
                  {props.fields.map((f) => (
                    <td key={f.name} className="px-2">
                      <InputField
                        ancestors={[{ name: props.name, rowId: r }]}
                        name={f.name}
                        type={f.type}
                        validate={(value) => (!value ? `Value missing` : '')}
                      />
                    </td>
                  ))}
                  <td className="px-2">
                    <div className="flex gap-2">
                      <Button
                        small
                        color="red"
                        type="button"
                        onClick={() => tableField.remove(idx)}
                      >
                        Remove
                      </Button>
                      <Button
                        small
                        type="button"
                        color="emerald"
                        onClick={() =>
                          tableField.insert(
                            idx + 1,
                            tableField.getFieldArrayValue()[idx]
                          )
                        }
                      >
                        Duplicate Row
                      </Button>
                    </div>
                  </td>
                </React.Fragment>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex gap-2">
        <Button small type="button" onClick={() => tableField.append()}>
          Add Row
        </Button>
        <Button
          small
          type="button"
          onClick={() => {
            tableField.validateData();
          }}
        >
          Validate Table
        </Button>
      </div>
      {tableField?.error && (
        <div style={{ color: 'red' }}>{tableField.error}</div>
      )}
    </div>
  );
}

export function WatchFieldArray(props) {
  const res = useFieldArrayColumnWatch({
    fieldArrayName: props.fieldArrayName,
    fieldNames: props.colNames,
  });
  const value = props.calculateFunc
    ? props.calculateFunc(res.values)
    : JSON.stringify(res.values ?? {});
  return (
    <div className="flex gap-2 items-center my-4">
      <label htmlFor={props.name} className="capitalize">
        {props.name}
      </label>
      <input
        className="bg-gray-200 border-0 rounded-lg"
        id={props.name}
        type="text"
        disabled
        value={value}
      />
    </div>
  );
}
