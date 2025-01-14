import React from 'react';
import { useField } from './FormProvider';

export const Field = (props) => {
  const {
    children,
    name,
    required,
    handleChange,
    defaultValue,
    ancestors,
    validate,
    depFields,
  } = props;
  const { fieldValue, setFieldValue, error, onBlur, touched, extraInfo } =
    useField({
      name,
      ancestors,
      defaultValue,
      depFields,
      validate: validate
        ? validate
        : (value) => {
            if (required && !value) {
              return 'Required';
            }
            return null;
          },
    });

  const fieldProps = {
    value: fieldValue ?? '',
    onChange: (e) => {
      const val = e?.target?.value;
      setFieldValue(val);
      handleChange?.(val);
    },
    onBlur,
    error,
    touched,
    extraInfo,
  };

  if (typeof children === 'function') {
    return (
      <>
        {children({
          value: fieldValue ?? '',
          onChange: setFieldValue,
          onBlur,
          error,
          touched,
          extraInfo,
        })}
      </>
    );
  } else {
    const childrenWithProps = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, fieldProps);
      }
      return child;
    });
    return <>{childrenWithProps}</>;
  }
};
