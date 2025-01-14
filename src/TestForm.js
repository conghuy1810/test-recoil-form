import * as React from 'react';
import { withFormProvider } from 'addon/AtomForm/FormProvider';
import {
  useForm,
  useFieldWatch,
  useFormContext,
} from 'addon/AtomForm/CoreForm';
import SelectField from 'components/SelectField';
import InputField from 'components/InputField';
import {ROOT_URI} from 'utils/constants'
const filterOptions = [
  {
    label: 'Relative',
    value: 'relative',
  },
  {
    label: 'Exact',
    value: 'exact',
  },
];

function Button(props) {
  const { children, primary, small, color = 'blue', ...rest } = props;
  return (
    <button
      {...rest}
      className={`flex justify-center rounded-md shadow-sm text-sm font-medium  ${
        primary
          ? `border border-transparent text-white bg-${color}-600 hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${color}-500`
          : `border border-transparent  text-${color}-700 bg-${color}-100 hover:bg-${color}-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${color}-500`
      } ${small ? 'py-1 px-2' : 'py-2 px-4'}`}
    >
      {children}
    </button>
  );
}
function MetaData(props) {
  const { formData } = props;
  return (
    <pre className="bg-gray-100 w-full rounded-lg p-4 whitespace-pre-wrap	">
      {JSON.stringify(formData, null, 2)}
    </pre>
  );
}
function ResetFieldRepro() {
  const [formData, setFormData] = React.useState({});
  const { removeFields } = useFormContext();
  const { handleSubmit } = useForm({
    onSubmit,
    onError: () => {
      console.log('loix');
    },
    initialValues: { values: [{ from: '31st' }], values1: '12321312' },
    skipUnusedInitialValues: true,
  });

  function onSubmit(values, extra) {
    setFormData({ values, extra, time: new Date().toString() });
    console.log(values, extra, 'values, extra');
    return Promise.resolve();
  }

  const watchValues = useFieldWatch({
    fieldNames: ['filter', 'values1'],
  }).values;
  return (
    <div className="grid grid-cols-3 gap-8">
      <form onSubmit={handleSubmit} className="col-span-2">
        <SelectField
          name="filter"
          options={filterOptions}
          disabled={false}
          onChange={() =>
            removeFields({
              fieldNames: [
                { name: `values[0].from`, type: 'field' },
                { name: `values[0].to`, type: 'field' },
              ],
            })
          }
        />

        {watchValues?.filter !== 'exact' && (
          <>
            <InputField
              name="values[0].from"
              type="text"
              disabled={false}
              validate={e => {
                console.log(e, 'validate');
              }}
              validateCallback={e => {
                if (e === '31st') {
                  return `Input cannot be more than dsalkdjaslkd`;
                }
              }}
            />
            <InputField name="values[0].to" type="text" disabled={false} />
            <InputField name="values0" type="text" disabled={false} />
            <InputField name="values1" type="text" disabled={false} />
            <InputField name="values2" type="text" disabled={false} />
            <InputField name="values3" type="text" disabled={false} />
            <InputField name="values4" type="text" disabled={false} />
          </>
        )}

        <br />

        <div className="flex gap-4">
          <Button type="submit" primary>
            Submit
          </Button>
        </div>
      </form>

      <MetaData formData={formData} />
    </div>
  );
}

export default withFormProvider(ResetFieldRepro);
