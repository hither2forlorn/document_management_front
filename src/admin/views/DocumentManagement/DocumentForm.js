import React from "react";
import Select from "react-select";
import { CustomInput, CustomSelect } from "admin/components";
// import dateFormat from "dateFormat";
import { getIdentifier } from "config/form";
import { connect } from "react-redux";

import { FormGroup, Label } from "reactstrap";
import { Row, Col } from "reactstrap";
import CustomAutoComplete from "admin/components/CustomAutoComplete";
import { banks, excludeThisVendor } from "config/bank";

import { convertDate } from "utils/converDate";
import { dms_features, includeThisFeature, onlyForThisVendor } from "config/bank";
import TagsInput from "./components/TagsInput";
import Required from "admin/components/Required";
import getStatusId from "../Util/getStatusIdValue";

const DocumentForm = (props) => {
  const defaultValues = props.allFields.defaultValues;
  const isCreditDocument = onlyForThisVendor(banks.bok.name) && props.documentTypeId === "1";
  const doc = props.documentData ? props.documentData : {};
  const isEdit = props.isEdit ? props.isEdit : false;
  const securityLevels = props.securityLevels;
  const isAdmin = props.userProfile.id === 1;

  const statusFromAPI = getStatusId(props?.statusId);
  // manipulate checker list -- find same name and repalace with email
  let checkers_list = [];
  props?.includedCheckers?.map((row) => {
    const foundSameName = props.includedCheckers.filter((data) => data.name === row.name);
    // console.log(foundSameName, foundSameName.length, row.name);
    if (foundSameName.length >= 2) {
      return checkers_list.push({ ...row, name: row.name + " - " + row.email });
    }
    return checkers_list.push(row);
  });

  if(isEdit){
    props?.checkerList?.map((row) => {
    const foundSameName = props.checkerList?.filter((data) => data.name === row.name);
    // console.log(foundSameName, foundSameName.length, row.name);
    if (foundSameName.length >= 2) {
      return checkers_list.push({ ...row, name: row.name + " - " + row.email });
    }
    return checkers_list.push(row);
  });
  }
console.log(props,":::::::::::::::::::::::::::::::::::checker list")
  const hierarchies = isAdmin
    ? props.allFields.hierarchy
    : props?.allFields?.hierarchy?.filter((row) => row.code !== props.userProfile.hierarchy);
  //  !props.userProfile.departmentId
  //   ? props.securityLevels.filter((security) => security.value != 2)
  //   : props.securityLevels;

  const validationErrors = props.validationErrors ? props.validationErrors : null;
  const [userDetails, setUserDetails] = React.useState({});

  const generateUserFromCBS = async (autoCompleteValue, option) => {
    if (autoCompleteValue !== "BOK") {
      setUserDetails(option);
    }
  };

  const selectedTags = (tags) => {
    props.handleChangeTags(tags);
  };

  return (
    <>
      <Row>
        {/* Show filed only for credit document */}
        {isCreditDocument && (
          <>
            <Col md={3}>
              <CustomAutoComplete
                object={doc}
                isEdit={isEdit}
                disabled={isEdit ? true : false}
                label="Account Number"
                defaultValue="BOK"
                generateUserFromCBS={generateUserFromCBS}
                name="name"
                errors={validationErrors ? validationErrors.name : null}
                onChange={props.handleChange}
                documentFormBata
              />
            </Col>
            <Col md={3}>
              <CustomInput
                object={doc}
                required
                isEdit={isEdit}
                label="Customer Name"
                defaultValue={userDetails?.CustName}
                name="customer_name"
                // errors={validationErrors ? validationErrors.identifier : null}
                readOnly
              />
            </Col>
            <Col md={3}>
              {/* {console.log(dateFormat(userDetails.ApprovedDate, "yyyy-MM-dd"))} */}

              <CustomInput
                object={doc}
                isEdit={isEdit}
                type="date"
                defaultValue={convertDate(userDetails.ApprovedDate)}
                label="Approved Date"
                name="approved_date"
                // errors={validationErrors ? validationErrors.identifier : null}
                readOnly
              />
            </Col>
            <Col md={3}>
              <CustomInput
                object={doc}
                isEdit={isEdit}
                defaultValue={userDetails?.URL}
                label="URL"
                name="url"
                // errors={validationErrors ? validationErrors.identifier : null}
                readOnly
              />
            </Col>
            <Col md={3}>
              <CustomInput
                object={doc}
                isEdit={isEdit}
                defaultValue={userDetails?.CPRno}
                label="TBOKID"
                name="CPRno"
                // errors={validationErrors ? validationErrors.identifier : null}
                readOnly
              />
            </Col>
          </>
        )}
        {onlyForThisVendor([banks.rbb.name]) && (
          <Col md={12}>
            {/* <label>Tags</label> */}
            <TagsInput
              object={doc}
              isEdit={isEdit}
              AddDocumentBata
              onChange={props.handleChange}
              defaultValue={props.docTags}
              selectedTags={selectedTags}
              label="Tags"
            />
          </Col>
        )}

        <Col md={3}>
          <CustomInput
            object={doc}
            isEdit={isEdit}
            label="Identifier"
            name="identifier"
            defaultValue={getIdentifier("DOC")}
            // errors={validationErrors ? validationErrors.identifier : null}
            readOnly
          />
        </Col>
        <Col md={3}>
          <CustomInput
            required
            object={doc}
            isEdit={isEdit}
            label="Document Name"
            name="otherTitle"
            readOnly={isCreditDocument && onlyForThisVendor(banks.bok.name)}
            disabled={props.isRetailOrCorporate ? true : false}
            defaultValue={
              isEdit
                ? undefined
                : props.concatString
                  ? props.concatString
                  : userDetails?.BOKID &&
                  userDetails?.CustName &&
                  userDetails?.ApprovedDate &&
                  userDetails?.CPRno &&
                  userDetails?.BOKID +
                  "-" +
                  userDetails?.CustName +
                  "-" +
                  userDetails?.ApprovedDate +
                  "-" +
                  userDetails?.CPRno
            }
            errors={validationErrors ? validationErrors.otherTitle : null}
            onChange={props.handleChange}
          />
        </Col>
        {excludeThisVendor(banks.bok.name) && (
          <Col md={3}>
            <CustomInput
              object={doc}
              isEdit={isEdit}
              label="Expiry Date"
              name="disposalDate"
              type="date"
              errors={validationErrors ? validationErrors.disposalDate : null}
              onChange={props.handleChange}
            />
          </Col>
        )}
        <Col md={3}>
          <CustomSelect
            object={doc}
            isEdit={isEdit}
            label="Language"
            name="languageId"
            hasDefaultValue
            errors={validationErrors ? validationErrors.languageId : null}
            options={props.languages}
            onChange={props.handleChange}
            defaultValue
          />
        </Col>
        <Col md={3}>
          <CustomSelect
            object={doc}
            isEdit={isEdit}
            label="Document Condition"
            hasDefaultValue
            name="documentConditionId"
            options={props.documentConditions}
            onChange={props.handleChange}
            errors={validationErrors ? validationErrors.documentConditionId : null}
            defaultValue
          />
        </Col>
        <Col md={3}>
          <CustomSelect
            required
            defaultValueOnlyForCombobox={statusFromAPI ? statusFromAPI : "1"}
            object={doc}
            isEdit={isEdit}
            disabled={props.isRetailOrCorporate ? true : false}
            // hasDefaultValue
            label="Status"
            name="statusId"
            options={props.statuses}
            onChange={props.handleChange}
            errors={validationErrors ? validationErrors.statusId : null}
          />
        </Col>
        <Col md={3}>
          <CustomSelect
            object={doc}
            isEdit={isEdit}
            hasDefaultValue
            label="Location Map"
            required={onlyForThisVendor([banks.rbb.name])}
            name="locationMapId"
            options={props.locationMaps}
            doNotSort
            {...(typeof defaultValues == "object" ? { defaultValueOnlyForCombobox: defaultValues.locationMapId } : {})}
            onChange={props.handleChange}
            errors={validationErrors ? validationErrors.locationMapId : null}
          />
        </Col>

        {(props.userProfile.departmentId && !isEdit) || (doc?.departmentId && isEdit) ? (
          <>
            <Col md={3}>
              <CustomSelect
                object={doc}
                hasDefaultValue
                isEdit={isEdit}
                label="Department"
                // required={props.document?.securityLevel == 2 ? true : false}
                name="departmentId"
                options={props.departments}
                onChange={props.handleChange}
                defaultValue
              />
            </Col>
          </>
        ) : null}

        {doc?.branchId && isEdit ? (
          <>
            <Col md={3}>
              <CustomSelect
                object={doc}
                hasDefaultValue
                isEdit={isEdit}
                label="Branch"
                name="branchId"
                options={props.branches}
                onChange={props.handleChange}
              />
            </Col>
          </>
        ) : null}

        {(!props.document?.hierarchy || isEdit) && (
          <Col md={3}>
            <CustomSelect
              object={doc}
              hasDefaultValue
              isEdit={isEdit}
              disabled
              label="Security Level"
              name="securityLevel"
              {...(typeof defaultValues == "object" ? { defaultValue: defaultValues?.securityLevel } : {})}
              options={securityLevels}
              onChange={props.handleChange}
              errors={validationErrors ? validationErrors.securityLevel : null}
              required={!onlyForThisVendor([banks.everest.name, banks.rbb.name, banks.citizen.name])} // not required for rbb
            />
          </Col>
        )}

        {/* {(!isEdit || doc.ownerId == props.userProfile.id) && ( */}
        {/* {isEdit && ( */}
          <Col md={3}>
            <CustomSelect
              object={doc}
              isEdit={isEdit}
              hasDefaultValue
              label="Checker"
              required={onlyForThisVendor([banks.everest.name, banks.rbb.name])}
              name="checker"
              options={checkers_list}
              onChange={props.handleChange}
              defaultValue
            />
          </Col>
        {/* )} */}

        {/* hide when hierarchy is empty */}
        {((!props.document?.securityLevel && hierarchies?.length > 0) || isEdit) && (
          <>
            <Col md={3}>
              <CustomSelect
                object={doc}
                label="Security Hierarchy"
                name="hierarchy"
                isEdit={isEdit}
                options={hierarchies}
                {...(typeof defaultValues == "object" ? { defaultValue: defaultValues?.hierarchy } : {})}
                onChange={props.handleChange}
              />
            </Col>

            <Col md={3}>
              <div className="alert alert-dark" role="alert">
                <p>Select security hierarchy for unit creation only.</p>
              </div>
            </Col>
          </>
        )}

        {props.securityLevelCheck === 3 && (
          <>
            <Col md={3}>
              <FormGroup>
                <Label>User Access</Label>
                <Required />
                <Select
                  isMulti
                  onChange={props.handleSelectChange}
                  value={props.userAccessSelectedOptions}
                  name="userAccess"
                  required
                  options={props.authorizedUsersSelect}
                  className="basic-multi-select react-select-style"
                  classNamePrefix="select"
                />
              </FormGroup>
            </Col>
          </>
        )}
        {props.securityLevelCheck === 4 && (
          <>
            <Col md={3}>
              <CustomSelect
                object={doc}
                label="User Group"
                name="userGroupId"
                isEdit={isEdit}
                required
                options={props.allFields.userGroup}
                onChange={props.handleChange}
              />
            </Col>
          </>
        )}
      </Row>
      <Row style={{ marginTop: 25, marginLeft: 10 }}>
        {(onlyForThisVendor([banks.rbb.name])) && (
          <>
            {!isEdit && (
              <>
                <Col md={3}>
                  <CustomInput
                    object={doc}
                    isEdit={isEdit}
                    type="checkbox"
                    name="hasEncryption"
                    onChange={props.handleChange}
                    errors={validationErrors ? validationErrors.hasEncryption : null}
                  >
                    Encryption Files
                  </CustomInput>
                </Col>

                {onlyForThisVendor([banks.rbb.name]) && (
                  <>
                    <Col md={3}>
                      <CustomInput
                        object={doc}
                        type="checkbox"
                        isEdit={isEdit}
                        name="hasQuickQcr"
                        onChange={props.handleChange}
                        errors={validationErrors ? validationErrors.hasQuickQcr : null}
                      >
                        Quick OCR
                      </CustomInput>
                    </Col>

                    <Col md={3}>
                      <CustomInput
                        object={doc}
                        isEdit={isEdit}
                        type="checkbox"
                        name="hasOtp"
                        errors={validationErrors ? validationErrors.hasOtp : null}
                        onChange={props.handleChange}
                      >
                        Require OTP Verification
                      </CustomInput>
                    </Col>
                  </>
                )}
              </>
            )}
          </>
        )}

        {isEdit && (
          <Col md={3}>
            <CustomInput
              object={doc}
              isEdit={isEdit}
              type="checkbox"
              name="isArchived"
              onChange={props.handleChange}
            >
              Archive Now
            </CustomInput>
          </Col>
        )}
      </Row>
    </>
  );
};

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(DocumentForm);
