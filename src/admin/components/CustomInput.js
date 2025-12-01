import React from "react";
import moment from "moment";
import { Label, Input, FormGroup, Col } from "reactstrap";
import Required from "./Required";

const CustomInput = ({
  label,
  name,
  onChange,
  object,
  isEdit,
  readOnly,
  defaultValue,
  type,
  required,
  maxLength,
  errors,
  children,
  bokIdBata,
  disabled,
  checked,
  className,
}) => {
  const rawValue = object ? (object[name] ? object[name] : "") : "";
  let value = "";
  switch (type) {
    case "date":
      value = moment(rawValue).format("YYYY-MM-DD");
      break;
    default:
      value = rawValue;
      break;
  }

  return (
    <>
      <FormGroup style={{ width: bokIdBata ? "95%" : "100%" }}>
        {type !== "checkbox" ? (
          <Label>
            {label ? label : ""}
            {required && <Required />}
          </Label>
        ) : null}
        <Input
          className={`rounded ${className}`}
          style={{ left: type !== "checkbox" ? 37 : null }}
          placeholder={label}
          name={name}
          id={name}
          disabled={disabled}
          type={type}
          required={required}
          {...(maxLength
            ? {
                maxLength: maxLength,
              }
            : {})}
          onChange={onChange}
          readOnly={readOnly}
          {...(isEdit
            ? type == "checkbox" && value === true
              ? { checked: value }
              : { value: value }
            : {
                defaultValue: defaultValue || "",
              })}
        />
        {children}
        {errors ? (
          <span className="text text-danger">
            {errors?.map((err) => {
              return err;
            })}
          </span>
        ) : null}
      </FormGroup>
    </>
  );
};

export default CustomInput;
