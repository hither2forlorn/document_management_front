import React, { useEffect } from "react";
import { CustomInput, CustomSelect } from "admin/components";
import { VIEW_EDIT } from "config/values";
import adminMETA from "admin/meta_routes";
import CustomSubmit from "admin/components/CustomSubmit";
import CustomCancel from "admin/components/CustomCancel";
import { CardBody, CardFooter, Input, Label, Row, Col } from "reactstrap";
import { excludeThisVendor, banks, onlyForThisVendor } from "config/bank";
import { shallowEqual, useSelector } from "react-redux";
import PRODUCTION_ENV from "utils/checkNodeEnv";
import { server } from "admin/config/server";

const loginAttempts = [
  { id: 3, name: "3 times" },
  { id: 5, name: "5 times" },
  { id: 10, name: "10 times" },
];

const UserForm = (props) => {
  console.log(props);
  const isEdit = props.isEdit;
  const user = props.user ? props.user : {};
  const p = props.permissions ? props.permissions : {};
  const validationErrors = props.validationErrors ? props.validationErrors : null;
  const userProfile = useSelector((state) => state.userProfile);
  const userIsAdmin = userProfile.id === 1 || userProfile.id === 286;

  return (
    <form id="signup-form" onReset={props.onReset} onSubmit={props.onSubmit}>
      <CardBody>
        <Row>
          <Col md={3}>
            <CustomInput
              required
              onChange={props.onChange}
              label="Identity Number"
              disabled={userIsAdmin ? false : isEdit}
              name="identityNo"
              object={user}
              isEdit={isEdit}
              errors={validationErrors?.identityNo}
            />
          </Col>
          <Col md={3}>
            <CustomInput
              onChange={props.onChange}
              label="Email"
              disabled={userIsAdmin ? false : isEdit}
              required
              name="email"
              object={user}
              type="email"
              isEdit={isEdit}
              errors={validationErrors?.email}
            />
          </Col>
          <Col md={3}>
            <CustomInput
              onChange={props.onChange}
              label="Full Name"
              name="name"
              required
              disabled={userIsAdmin ? false : isEdit}
              object={user}
              isEdit={isEdit}
              errors={validationErrors?.name}
            />
          </Col>
          {excludeThisVendor(banks.bok.name) && (
            <Col md={3}>
              <CustomSelect
                onChange={props.onChange}
                label="Gender"
                name="gender"
                object={user}
                options={[
                  { id: "male", name: "Male" },
                  { id: "female", name: "Female" },
                  { id: "other", name: "Other" },
                ]}
                isEdit={isEdit}
                errors={validationErrors ? validationErrors.gender : null}
              />
            </Col>
          )}
          {excludeThisVendor(banks.bok.name) && (
            <Col md={3}>
              <CustomInput
                onChange={props.onChange}
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                object={user}
                isEdit={isEdit}
                errors={validationErrors ? validationErrors.dateOfBirth : null}
              />
            </Col>
          )}
          {excludeThisVendor(banks.bok.name) && (
            <Col md={3}>
              <CustomInput
                onChange={props.onChange}
                label="Phone Number"
                name="phoneNumber"
                object={user}
                errors={validationErrors?.phoneNumber}
                isEdit={isEdit}
              />
            </Col>
          )}
          <Col md={3}>
            <CustomInput
              onChange={props.onChange}
              label="Designation"
              errors={validationErrors?.designation}
              name="designation"
              object={user}
              isEdit={isEdit}
            />
          </Col>
          {/* <CustomInput onChange={props.onChange} label="Street" name="street" object={user} isEdit={isEdit} />

        <CustomInput onChange={props.onChange} label="City" name="city" object={user} isEdit={isEdit} />

        <CustomInput onChange={props.onChange} label="Country" name="country" object={user} isEdit={isEdit} />

        <CustomInput
          onChange={props.onChange}
          label="Postal Code"
          name="postalCode"
          type="number"
          object={user}
          isEdit={isEdit}
          maxLength="6"
        /> */}
          {/* <CustomInput onChange={props.onChange} label="Website" name="website" object={user} isEdit={isEdit} /> */}
          {p.user >= VIEW_EDIT ? (
            <>
              <Col md={3}>
                <CustomInput
                  onChange={props.onChange}
                  label="Expiry Date"
                  name="expiryDate"
                  object={user}
                  type="date"
                  isEdit={isEdit}
                  errors={validationErrors ? validationErrors.expiryDate : null}
                />
              </Col>
              <Col md={3}>
                <CustomSelect
                  required
                  onChange={props.onChange}
                  label="Role"
                  name="roleId"
                  object={user}
                  options={props.roles}
                  isEdit={isEdit}
                  errors={validationErrors ? validationErrors.roleId : null}
                />
              </Col>
              <Col md={3}>
                <CustomSelect
                  required
                  label="Security Hierarchy"
                  name="hierarchy"
                  onChange={props.onChange}
                  object={user}
                  defaultValueOnlyForCombobox={props?.security_hierarchy}
                  options={props.allFields.hierarchy}
                  isEdit={isEdit}
                  errors={validationErrors ? validationErrors.hierarchy : null}
                />
              </Col>

              {!props?.departmentId && (
                <Col md={3}>
                  <CustomSelect
                    onChange={props.onChange}
                    label="Branch"
                    name="branchId"
                    object={user}
                    defaultValueOnlyForCombobox={props?.branchId}
                    options={props.branches}
                    // required
                    isEdit={isEdit}
                    errors={validationErrors ? validationErrors.branchId : null}
                  />
                </Col>
              )}

              {!props?.branchId && (
                <Col md={3}>
                  <CustomSelect
                    onChange={props.onChange}
                    label="Department"
                    defaultValueOnlyForCombobox={props?.departmentId}
                    name="departmentId"
                    // required
                    object={user}
                    options={props.departments}
                    isEdit={isEdit}
                    errors={validationErrors ? validationErrors.departmentId : null}
                  />
                </Col>
              )}
              <Col md={3}>
                <CustomSelect
                  required
                  onChange={props.onChange}
                  label="Login Attempts"
                  name="loginAttempts"
                  object={user}
                  options={loginAttempts}
                  defaultValue={10}
                  isEdit={isEdit}
                  errors={validationErrors ? validationErrors.loginAttempts : null}
                />
              </Col>
              <Col md={3}>
                <CustomSelect
                  required
                  onChange={props.onChange}
                  label="Status"
                  name="statusId"
                  object={user}
                  defaultValue={1}
                  options={props.userStatuses}
                  isEdit={isEdit}
                  errors={validationErrors ? validationErrors.statusId : null}
                />
              </Col>
            </>
          ) : null}
          {/* <Label className="col-sm-4 col-md-4 Label">Notes</Label>
        <Input
        type="textarea"
          rows="4"
          id="notes"
          name="notes"
          onChange={props.onChange}
          {...(isEdit
            ? {
                value: user.notes ? user.notes : "",
              }
            : {})}
        /> */}
          <Col md={3}>
            <CustomSelect
              onChange={props.onChange}
              label="User Group"
              name="userGroupId"
              object={user}
              options={props.userGroup}
              isEdit={isEdit}
              errors={validationErrors ? validationErrors.userGroup : null}
            />
          </Col>

          {/* {userProfile.id == user.id &&
            user.id != 1 &&
            !PRODUCTION_ENV &&
            !isEdit && ( */}
          <Col md={12}>
            <Row>
              <Col md={3}>
                <CustomInput
                  onChange={props.onChange}
                  label="New Password"
                  name="password"
                  type={props.showPassword ? "text" : "password"}
                  object={user}
                  isEdit={isEdit}
                  errors={validationErrors.password}
                />
              </Col>
              <Col md={3}>
                <CustomInput
                  onChange={props.onChange}
                  label="Confirm Password"
                  name="confirmPassword"
                  type={props.showPassword ? "text" : "password"}
                  object={user}
                  isEdit={isEdit}
                />
              </Col>
              <Col md={3} className="d-flex justify-content-center align-items-center">
                <CustomInput onChange={props.onShowPassword} name="showPassword" type="checkbox">
                  show passwords
                </CustomInput>
              </Col>
            </Row>
          </Col>
          {/* )} */}
          <Col md={12}>
            <CustomInput
              isEdit={isEdit}
              object={user}
              label="Notes"
              name="notes"
              type="textarea"
              onChange={props.onChange}
            />
          </Col>
        </Row>
      </CardBody>
      <CardFooter className="d-flex justify-content-end">
        {isEdit ? (
          <>
            <button
              className="mx-2 btn btn-info text-white"
              type="button"
              onClick={() => props.history.push(adminMETA.adminUsers)}
            >
              Cancel
            </button>
            <button className="btn btn-success" type="submit">
              Update
            </button>
          </>
        ) : (
          <>
            <CustomCancel onClick={() => window.history.back()} />
            <CustomSubmit isDisabled={props.isDisabled} />
          </>
          // <button className="btn btn-success btn-sm" type="submit">
          //   Submit
          // </button>
        )}
      </CardFooter>
    </form>
  );
};

export default UserForm;
