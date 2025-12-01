import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getOptions } from "config/util";
import { Card, CardBody, Label, Input, FormGroup, Row, Button, Col } from "reactstrap";
import _ from "lodash";
import CustomAutoComplete from "admin/components/CustomAutoComplete";
import { toast } from "react-toastify";
import { CustomInput, CustomSelect } from "admin/components";

import Select from "react-select";
import { removeObjectWithKey, sortArrayOfObject, uniqueByValue } from "utils/arrayManipulation";
import TagsInput from "./components/TagsInput";
// import { NepaliDatePicker } from "datepicker-nepali-reactjs";
import NepaliDatepicker from "nepali-datepicker-and-dateinput";
import Moment from "react-moment";
import "moment-timezone";
import moment from "moment-timezone";
import { banks, dms_features, includeThisFeature, onlyForThisVendor } from "config/bank";
import adbs from "ad-bs-converter";
import ReactSelectAutoComplete from "./components/ReactSelectAutoComplete";
import isJsonObj from "../Util/isJsonObj";
import { AutoCompleteField, conditions } from "../../../constants/conditional";
import IndexInputContainer from "./components/IndexInput/IndexInputContainer";
import IndexDate from "./components/IndexInput/IndexDate";
import IndexCombobox from "./components/IndexInput/IndexCombobox";
import AutoComplete from "./components/function/autoComplete";
import Required from "admin/components/Required";
import { retail } from "./static/retail";
import { corporate } from "./static/corporate";
import { docTypes } from "./static/docType";

const DocumentTypeIndex = (props) => {
  let [listValues, setListValues] = useState([]);
  let [listDocumentTypes, setListDocumentTypes] = useState([]);
  const [hasAssociatedId, setHasAssociatedId] = useState(false);
  const [dateBs, setdateBs] = useState("");
  const [dateAd, setdateAd] = useState("");
  const [disableByConditionalRule, setDisableByConditionalRule] = useState("");
  const [conditionalProp, setConditionalProp] = useState("");
  const [conditionFor, setconditionFor] = useState("");
  const [autoFill, setAutoFill] = useState({});
  const [concateValue, setConcateValue] = useState({});

  const bokIDs = props?.associatedBokIDSEdit?.length > 0 ? props?.associatedBokIDSEdit : props?.associatedBokIDS;

  const doc = props?.documentData ? props?.documentData : {};
  const isEdit = props?.isEdit ? props?.isEdit : false;
  const validationErrors = props.validationErrors ? props.validationErrors : null;

  const handleChange = ({ target: { name, value, type } }) => {
    switch (type) {
      case "checkbox":
        break;
      default:
        props.handleDocumentTypeChange({
          target: { name: "documentTypeId", value: value },
        });
    }
    setListValues([]);
  };

  const DocumentTypeObject = props?.documentTypes && props?.documentTypes.find((doc) => doc?.id == props?.documentTypeId);

  const handleAutoFillValue = (condition, data) => {
    condition.map((row) => {
      const label = row?.api_label;
      const value = data?.[label];
      const id = row.autoFill;
      const isContain = _.find(listValues, {
        documentIndexId: Number(id),
      });
      if (isContain)
        // update existing
        listValues = listValues.map((listValue) => {
          if (Number(listValue.documentIndexId) === Number(id)) {
            return {
              ...listValue,
              value: value,
            };
          } else {
            return listValue;
          }
        });
      // new push
      else
        listValues.push({
          documentIndexId: Number(id),
          value: value || "",
        });
    });
  };

  const globalConditional = (dataType, label, conditional) => {
    // console.log(conditional, "label", label, "dataTyp", dataTyp);
    const dataTyp = dataType ? dataType : "";
    let lvl = label;
    const conditionList = JSON.parse(conditional);
    // console.log(conditionList, "conditionList");
    let conditionType;
    conditionType = conditionList[0].condition;
    const conditionIn = conditionList[0].conditionIn;
    //  conditionType = conditionList[1]?.condition;

    // console.log(conditionType, "conditionType", conditionIn);

    let condition = autoFill && autoFill?.conditions ? autoFill?.conditions : "";
    // console.log(conditionType, "obj", dataType, "dataType", label, "label");

    // if (condition) {
    // if (typeof parse == "object") {
    //   if (Object.keys(parse).length == 0) {
    //     parse = [];
    //   }
    let finalOutput;
    let databaseDats;
    databaseDats =
      conditionList &&
      conditionList?.map((data, index) => {
        // console.log(data, "here i come");
        switch (parseInt(data?.condition)) {
          case conditions.LessThen: // 1
            // console.log("LessThen");
            finalOutput = conditions.LessThen;
            break;
          case conditions.GreaterThen: // 2
            // console.log("GreaterThen");
            finalOutput = conditions.GreaterThen;
            break;
          case conditions.Concate: // 3
            // console.log("Concate", data?.condition);
            finalOutput = conditions.Concate;
            break;
          case conditions.AutoFill: // 4
            console.log("AutoFill");
            finalOutput = conditions.AutoFill;
            break;
          default:
            console.log("Sorry, we are out.");
        }
      });
    // console.log(finalOutput, "finalOutput");

    // console.log(databaseDats, "database");
    if (finalOutput) {
      switch (parseInt(finalOutput)) {
        case conditions.LessThen: // 1
          // console.log("LessThen");

          // if (data.conditionIn) {
          //   setConditionalProp(event.target.value);
          //   setconditionFor(data.conditionIn);
          // }
          break;
        case conditions.GreaterThen: // 2
          // console.log("GreaterThen");

          // if (data.conditionIn) {
          //   setConditionalProp(event.target.value);
          //   setconditionFor(data.conditionIn);
          // }
          break;
        case conditions.Concate: // 3
          // console.log(concateValue.label, "ConcateData");
          // console.log(concateValue.label, "Concate", conditionType, "finalOutput", finalOutput);
          props?.concateValue({
            [conditionIn]: concateValue?.label + concateValue?.accountName,
          });
          break;
        case conditions.AutoFill: // 4
          if (condition) {
            // console.log("AutoFill", AutoCompleteField.AccountName, "lvl", lvl);
            switch (lvl) {
              case AutoCompleteField.AccountName: // AccountName
                let output = condition.accountName ? condition.accountName : getValueOfIndex;
                // console.log(output, "AccountName", condition?.accountName, "1");
                return output;
                break;
              case AutoCompleteField.Branch: // Branch
                // console.log("Branch", condition.branch, "2");
                let output2 = condition.branch ? condition.branch : getValueOfIndex;
                return output2;
                break;
              case AutoCompleteField.CIF: // CIF
                // console.log("CIF", condition.custId, "3");
                let output3 = condition.cid ? condition.cid : getValueOfIndex;
                return output3;
                break;
              case AutoCompleteField.SchemeCode: // SchemeCode
                // console.log("SchemeCode", condition.schmCode, "4");
                let output4 = condition.schmCode ? condition.schmCode : getValueOfIndex;
                return output4;
                break;
              case AutoCompleteField.IDNumber: // IDNumber
              case AutoCompleteField.RegistrationIDNumber: // IDNumber
                // console.log("IDNumber", condition, 5, "type of", typeof AutoCompleteField.IDNumber);
                let output5 = condition.idNum ? condition.idNum : getValueOfIndex;
                return output5;
                break;
              default:
                console.log("Sorry, we are out.");
                return "";
            }
          }
          // setAutoFill({ condition: condition, condition: extra });
          // handleAutoFillValue(condition, extra);
          break;
        // [{ "conditionIn": "1", "condition": "4", "autoFill": "2", "api_label": "account_number", "documentConditionsField": "4" },
        // { "conditionIn": "1", "condition": "4", "autoFill": "3", "api_label": "cif", "documentConditionsField": "4" }
        // ]
        default:
          console.log("Sorry, we are out.");
        // }
        // });
        // }
      }
    }
    return "";
  };

  const onChange = (event, id, nepaliDate, condition, extra) => {

    if (condition && extra) {
      props.statusId(condition.statusId);
      setAutoFill({ conditions: condition, conditionsType: extra });
    }
    if (extra === "4") {
      setConcateValue(condition);
      // condition had value of api
      const API_INDICIES_INDIVIDUAL = {
        acct: 1,
        custId: 2,
        acctName: 3,
        branch: 4,
        schmCode: 5,
        idNum: 6,
      };

      const API_INDICIES_CORPORATE = {
        acct: 7,
        custId: 8,
        acctName: 9,
        branch: 10,
        schmCode: 11,
        idNum: 12,
      };

      let API_INDICIES = props.documentTypeId == 1 ? API_INDICIES_INDIVIDUAL : API_INDICIES_CORPORATE;

      if (typeof condition == "object") {
        listValues = listValues || [];

        Object.entries(condition).map(([key, value]) => {
          if (API_INDICIES?.[key]) {
            listValues.push({
              documentIndexId: API_INDICIES?.[key],
              value: value,
            });
          }
          // key accoriding
        });
      }
      setListValues([...listValues]);
      props.setIndexValues(listValues);
      return;
    }

    if (event?.length >= 0) {
      listValues = listValues || [];
      // contains in the array list
      const isContain = _.find(listValues, {
        documentIndexId: Number(id),
      });

      // update into list value
      if (isContain) {
        listValues = listValues.map((listValue) => {
          if (Number(listValue.documentIndexId) === Number(id)) {
            // for tags - need to store in database
            // nepaliDate is prioritize while adding
            return {
              ...listValue,
              value: nepaliDate || JSON.stringify(event),
            };
          } else {
            return listValue;
          }
        });
      } else {
        // add into listvalue
        listValues.push({
          documentIndexId: Number(id),
          value: nepaliDate || event,
        });
      }
    } else {
      // for Normal Inputs
      const { name: id, value } = event.target;
      listValues = listValues || [];
      const isContain = _.find(listValues, {
        documentIndexId: Number(id),
      });
      // listvalue contains existing data then replace.
      if (isContain) {
        listValues = listValues.map((listValue) => {
          if (Number(listValue.documentIndexId) === Number(id)) {
            return {
              ...listValue,
              value: value,
            };
          } else {
            return listValue;
          }
        });
      } else {
        listValues.push({
          documentIndexId: Number(id),
          value: value,
        });
      }
    }
    setListValues([...listValues]);
    props.setIndexValues(listValues);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const datedataone = moment(value).format("YYYY/MM/DD");
    try {
      const bsDate = adbs.ad2bs(datedataone ? datedataone : "2047/4/26");
      const formattedDate = bsDate.en.year + "-" + bsDate.en.month + "-" + bsDate.en.day;

      onChange([], name, formattedDate);

      setdateAd(formattedDate);
    } catch (error) {
      console.log(error);
      toast.warn(error);
    }
  };

  const handleNepaliDateChange = (name, dateInMilli, bsDate, adDate) => {
    const checkDate = moment(bsDate, "YYYY-MM-DD", true).isValid();
    if (checkDate) {
      // console.log(adDate); // Prints the equivalent adDate
      const datedata = moment(adDate).format("YYYY-MM-DD");
      // console.log("Changed", e);
      onChange([], name, bsDate);
      // onChange(e);
      setdateBs(datedata);
    }
  };

  const getValueOfIndex = (list, documentIndexId) => {
    const val = _.find(list, {
      documentIndexId: Number(documentIndexId),
    });
    if (val) {
      return val.value;
    } else {
      return "";
    }
  };

  const generateUserFromCBS = async (value, id, option) => {
    if (value !== "BOK") {
      console.log(hasAssociatedId, option, option.BOK_ID);
      var data = [
        ...bokIDs,
        {
          label: option.BOK_ID,
          value: option.BOK_ID,
        },
      ];

      data = uniqueByValue(data, "value");
      props.setAssociatedBokIDS(data);
    } else {
      toast.error("Error: Invalid BOKID");
    }
  };

  function onChangeReactSelect(value, { action, removedValue }) {
    switch (action) {
      case "remove-value":
      case "pop-value":
        if (removedValue.value) {
          const data = removeObjectWithKey(bokIDs, "value", removedValue.value);
          props.setAssociatedBokIDS(data);
        }
        break;
      case "clear":
        props.setAssociatedBokIDS([]);
        break;
    }
  }

  useEffect(() => {
    /*
    filtering the incoming document types for only parent document types
    */
    // const tempList = [];
    let data;
    if (props?.forAttachment) {
      data = props?.documentTypes?.filter(
        (doc) => doc?.level != 0 // && props.documentData.documentTypeId == doc.parentId
      );
    } else data = props?.documentTypes?.filter((doc) => doc.level == 0);

    // Note: Document Type is used in Add document and upload Attachment
    // For rbb we need to view all document
    // & for citizen and bok we need only parent to view in add document and children document in upload attachments
    // show all document types
    if (!includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL)) {
      setListDocumentTypes(props.documentTypes);
    }
    // dont show parent document for bok and citizen
    else if (includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL) && props.forAttachment) {
      // document  type for attachment already filtered from attachmentModel
      // Retrieve from localStorage
      const storedDocTypeChildren = localStorage.getItem("docTypeChildren");

      // Parse JSON string back to object/array
      const parsedDocTypeChildren = JSON.parse(storedDocTypeChildren);

      let additionalTypeOptions = [];
      if (doc.documentTypeId === 1) {
        additionalTypeOptions = retail;
      } else if (doc.documentTypeId === 2) {
        additionalTypeOptions = corporate;
      }
      // setListDocumentTypes(props.fromAttachmentModal || parsedDocTypeChildren || additionalTypeOptions);
      const listDocumentTypes =
        props.fromAttachmentModal && props.fromAttachmentModal.length > 0
          ? props.fromAttachmentModal
          : parsedDocTypeChildren && parsedDocTypeChildren.length > 0
            ? parsedDocTypeChildren
            : additionalTypeOptions;

      setListDocumentTypes(listDocumentTypes);
    } else {
      setListDocumentTypes(data && data?.length > 0 ? data : docTypes);
    }

    setListValues(props.indexValues || []);
  }, [props.indexValues]);

  return (
    <>
      <FormGroup style={{ paddingTop: 15 }}>
        <Label className="mt-1">DOCUMENT TYPE</Label>
        {
          <span className="text-danger h6 ml-1">
            <b>*</b>
          </span>
        }
        <Input
          type="select"
          className="form-control rounded"
          name="documentTypeId"
          id="documentTypeId"
          value={props.documentTypeId}
          disabled={props.disableDocumentTypeSelectFromEditIndex}
          onChange={handleChange}
          style={{ width: "100%" }}
          required={true}
        >
          <option value="">{"---NONE---"}</option>
          {getOptions(listDocumentTypes)}
        </Input>
      </FormGroup>
      <Row>
        {props?.documentTypes?.map((docType) =>
          Number(props.documentTypeId) === docType.id
            ? docType.document_indices &&
            docType.document_indices.map((row, index) => {
              let attribute = row?.validation ? JSON.parse(isJsonObj(row?.validation) ? row?.validation : "{}") : {};
              switch (row.dataType) {
                case "string":
                  // validation or input field
                  return (
                    <IndexInputContainer
                      row={row}
                      listValues={listValues}
                      props={props}
                      onChange={onChange}
                      getValueOfIndex={
                        row && row.condition && !props.indexValues
                          ? globalConditional(row.dataType, row.label, row.condition)
                          : getValueOfIndex
                      }
                      attribute={attribute}
                      errors={validationErrors ? validationErrors?.[row.id] : null}
                      type="string"
                    />
                  );
                case "number":
                  return (
                    <IndexInputContainer
                      row={row}
                      listValues={listValues}
                      props={props}
                      onChange={onChange}
                      getValueOfIndex={getValueOfIndex}
                      attribute={attribute}
                      type="number"
                      errors={validationErrors ? validationErrors?.[row.id] : null}
                    />
                  );
                case "alphaNum":
                  return (
                    <IndexInputContainer
                      row={row}
                      listValues={listValues}
                      props={props}
                      onChange={onChange}
                      getValueOfIndex={getValueOfIndex}
                      attribute={attribute}
                      type="text"
                      errors={validationErrors ? validationErrors?.[row.id] : null}
                    />
                  );
                case "date":
                  /* generate current date */
                  if (attribute?.noFutureDate) {
                    const todayDate = eval("new Date().toJSON().slice(0,10)");
                    attribute.max = todayDate;
                  }
                  return (
                    <IndexDate
                      row={row}
                      listValues={listValues}
                      props={props}
                      onChange={onChange}
                      getValueOfIndex={getValueOfIndex}
                      attribute={attribute}
                      errors={validationErrors ? validationErrors?.[row.id] : null}
                    />
                  );
                case "province":
                  return (
                    // <IndexCombobox
                    //   row={row}
                    //   listValues={listValues}
                    //   props={props}
                    //   onChange={onChange}
                    //   getValueOfIndex={getValueOfIndex}
                    //   attribute={attribute}
                    //   errors={
                    //     validationErrors ? validationErrors?.[row.id] : null
                    //   } />
                    <React.Fragment key={row.id}>
                      <Col md={props.fromBulkAttachmentUploads ? 12 : 4}>
                        <FormGroup>
                          <CustomSelect
                            label={row.label}
                            name={row.id}
                            options={props.provinces}
                            required={row.isRequired}
                            onChange={(e) => onChange(e, null, null, row?.condition)}
                            value={getValueOfIndex(listValues, row.id)}
                            defaultValueOnlyForCombobox={getValueOfIndex(listValues, row.id)}
                            {...(typeof attribute == "object" ? attribute : {})}
                          />
                          <Input type="hidden" name="documentIndexId" value={row.id} />
                        </FormGroup>
                      </Col>
                    </React.Fragment>
                  );
                case "district":
                  return (
                    <React.Fragment key={row.id}>
                      <Col md={props.fromBulkAttachmentUploads ? 12 : 4}>
                        <FormGroup>
                          <CustomSelect
                            label={row.label}
                            name={row.id}
                            options={sortArrayOfObject(props.districts, "name")}
                            defaultValueOnlyForCombobox={getValueOfIndex(listValues, row.id)}
                            required={row.isRequired}
                            onChange={(e) => onChange(e, null, null, row?.condition)}
                            value={getValueOfIndex(listValues, row.id)}
                            {...(typeof attribute == "object" ? attribute : {})}
                          />
                          <Input type="hidden" name="documentIndexId" value={row.id} />
                        </FormGroup>
                      </Col>
                    </React.Fragment>
                  );
                case "tag":
                  return (
                    <React.Fragment key={row.id}>
                      <Col md={props.fromBulkAttachmentUploads ? 12 : 4}>
                        <FormGroup>
                          <TagsInput
                            label={row.label}
                            name={row.id}
                            defaultValue={getValueOfIndex(listValues, row.id)}
                            isEdit={true}
                            required={row.isRequired}
                            searchFilterBata
                            type="number"
                            onChange={(e, id) => onChange(e, id)}
                            value={getValueOfIndex(listValues, row.id)}
                            {...(typeof attribute == "object" ? attribute : {})}
                          />
                          <Input type="hidden" name="documentIndexId" value={row.id} />
                        </FormGroup>
                      </Col>
                    </React.Fragment>
                  );
                case "dynamicCombox":
                  return (
                    <Col md={props.fromBulkAttachmentUploads ? 12 : 4} className=" mb-2">
                      {row.label}
                      {row.isRequired && <Required />}
                      <ReactSelectAutoComplete
                        row={row}
                        listValues={listValues}
                        handleChange={onChange}
                        getValueOfIndex={getValueOfIndex}
                        api_label="value"
                        name={row.id}
                        validation={row?.validation}
                      />
                    </Col>
                  );
                case "branch":
                  return (
                    <React.Fragment key={row.id}>
                      <Col md={props.fromBulkAttachmentUploads ? 12 : 4}>
                        <FormGroup>
                          <CustomSelect
                            label={row.label}
                            name={row.id}
                            options={props.branches}
                            defaultValueOnlyForCombobox={getValueOfIndex(listValues, row.id)}
                            required={row.isRequired}
                            onChange={(e) => onChange(e)}
                            value={getValueOfIndex(listValues, row.id)}
                            {...(typeof attribute == "object" ? attribute : {})}
                          />
                          <Input type="hidden" name="documentIndexId" value={row.id} />
                        </FormGroup>
                      </Col>
                    </React.Fragment>
                  );
                case "nepaliDate":
                  return (
                    <React.Fragment key={row.id}>
                      <Col md={props.fromBulkAttachmentUploads ? 12 : 4}>
                        <Label>
                          {row.label}
                          {row.isRequired && (
                            <span className="text-danger h6 ml-1">
                              <b>*</b>
                            </span>
                          )}
                        </Label>
                        {/* <label htmlFor="date">{row.label} in BS</label> */}
                        <NepaliDatepicker
                          id="nepali-date"
                          name={row.id}
                          label="-"
                          required={row.isRequired}
                          onChange={handleNepaliDateChange}
                          defaultDate={getValueOfIndex(listValues, row.id) || dateAd}
                          defaultFormat
                          {...(typeof attribute == "object" ? attribute : {})}
                        />
                      </Col>
                      <Col md={props.fromBulkAttachmentUploads ? 12 : 4}>
                        <Label>{row.label} in AD</Label>
                        <Input
                          name={row.id}
                          type="date"
                          placeholder="Enter the date in AD"
                          // value={englishDate}
                          value={dateBs || ""}
                          onChange={(e) => handleDateChange(e)}
                        />
                      </Col>
                    </React.Fragment>
                  );
                case "autoComplete":
                  return (
                    <React.Fragment key={row.id}>
                      <Col md={props.fromBulkAttachmentUploads ? 12 : 4}>
                        <FormGroup>
                          <Label>
                            {row.label}
                            {row.isRequired && (
                              <span className="text-danger h6 ml-1">
                                <b>*</b>
                              </span>
                            )}
                          </Label>
                          <AutoComplete
                            getValueOfIndex={globalConditional(row.dataType, row.label, row.condition)}
                            api={row.api}
                            disabled={props.indexValues ? true : false}
                            name={row.id}
                            handleInputChange={onChange}
                          />
                          {/* <ReactSelectAutoComplete
                              listValues={listValues}
                              getValueOfIndex={getValueOfIndex}

                            <AutoCompleteURL
                              handleChange={onChange}
                              api_label="accountNumber"
                              api_value="accountNumber"
                              row={row}
                              name={row.id}
                            /> */}
                          <Input type="hidden" name="documentIndexId" value={row.id} />
                        </FormGroup>
                      </Col>
                    </React.Fragment>
                  );
                default:
                  break;
              }
            })
            : null
        )}
      </Row>

      {/* Required for associated */}
      {props.fromAttachmentModal &&
        DocumentTypeObject?.isAssociatedIDReq != null &&
        (DocumentTypeObject?.isAssociatedIDReq ? (
          <React.Fragment>
            <FormGroup>
              <p className="mb-1 mt-3">
                <b>Associated BOK ID</b>
              </p>
              <hr className="mt-0" />
              <CustomAutoComplete
                documentIndexBata
                hasAssociatedId
                object={doc}
                isEdit={isEdit}
                label="BOK ID"
                defaultValue="BOK"
                required={true}
                // required={DocumentTypeObject?.isAssociatedIDReq}
                generateUserFromCBS={generateUserFromCBS}
                onIdexTypeChange={onChange}
                errors={validationErrors ? validationErrors.name : null}
              />
              {bokIDs?.length !== 0 && (
                <Select
                  required={true}
                  value={bokIDs}
                  onChange={onChangeReactSelect}
                  isMulti
                  name="AssociatedBokIds"
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              )}
            </FormGroup>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!props.associatedBokIDSEdit.length > 0 && (
              <Button onClick={() => setHasAssociatedId(!hasAssociatedId)} className="mb-1 mt-3">
                {!hasAssociatedId ? "Has Associated ID" : "Doesn't Have Associated ID"}
              </Button>
            )}
            {(hasAssociatedId || props.associatedBokIDSEdit.length > 0) && (
              <FormGroup>
                <p className="mb-1 mt-3">
                  <b>Associated BOK ID</b>
                </p>
                <hr className="mt-0" />
                <CustomAutoComplete
                  documentIndexBata
                  hasAssociatedId
                  object={doc}
                  isEdit={isEdit}
                  label="BOK ID"
                  defaultValue="BOK"
                  required={DocumentTypeObject?.isAssociatedIDReq}
                  generateUserFromCBS={generateUserFromCBS}
                  onIdexTypeChange={onChange}
                  errors={validationErrors ? validationErrors.name : null}
                />
                {bokIDs?.length !== 0 && (
                  <Select
                    value={bokIDs}
                    onChange={onChangeReactSelect}
                    isMulti
                    name="AssociatedBokIds"
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                )}
              </FormGroup>
            )}
          </React.Fragment>
        ))}
    </>
  );
};

export default connect((state) => ({
  ...state.allFields,
  searchData: state.docSearchData,
}))(DocumentTypeIndex);
