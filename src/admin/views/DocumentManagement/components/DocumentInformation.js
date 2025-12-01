import React from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { Col, Row, Card, CardHeader, CardBody, Table } from "reactstrap";
import { getValue } from "config/util";
import { Link } from "react-router-dom";

import { BOTH_EDIT_DELETE, VIEW, VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import A from "config/url";
import moment from "moment";
import metaRoutes from "config/meta_routes";
import { CustomApprove, CustomDelete } from "../../../components";
import { approveDocument, archiveDocument, resubmitDocument } from "../api";
import Province from "../../../../constants/Province";
import District from "../../../../constants/District";
import { getLocationData } from "admin/views/Util/GetLocationName";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomChip from "admin/components/CustomChip";
import { banks, onlyForThisVendor } from "config/bank";
import { sendToChecker } from "../api/document";
import PrintFile from "admin/components/printFile";
import { deleteDocument } from "../api";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { CloseIcon, EmailIcon } from "@chakra-ui/icons";
import { ActionIcon, Badge } from "@mantine/core";
import CustomTableAction from "admin/components/CustomTableAction";
import QRRange from "admin/components/QRRange";

const indexDataTypes = {
  province: "province",
  date: "date",
  district: "district",
  dynamicCombox: "dynamicCombox",
  tags: "tags",
};

const DocumentInformation = (props) => {
  // Data row functional component
  const DocumentRow = ({ label, value, type }) => {
    if (value) {
      switch (type) {
        case indexDataTypes.province:
          return (
            <tr>
              <td>{label}</td>
              <td>{getLocationData(props.allFields.provinces, value)?.name || value}</td>
            </tr>
          );
        case indexDataTypes.district:
          return (
            <tr>
              <td>{label}</td>
              <td>{getLocationData(props.allFields.districts, value)?.name || value}</td>
            </tr>
          );

        case indexDataTypes.dynamicCombox:
          return (
            <tr>
              <td>{label}</td>
              <td>{getLocationData(props.allFields.constants, value)?.name || value}</td>
            </tr>
          );
        case indexDataTypes.date:
          return (
            <tr>
              <td>{label}</td>
              <td>{moment(value).format("dddd, MMMM Do YYYY")}</td>
            </tr>
          );
        case indexDataTypes.tags:
          return (
            <tr>
              <td>{label}</td>
              <td>
                {typeof value === "object" &&
                  JSON.parse(value)?.map((item) => {
                    return <CustomChip label={item} variant="outlined" style={{ marginRight: 5 }} />;
                  })}
              </td>
            </tr>
          );
        default:
          return (
            <tr>
              <td>{label}</td>

              <td>{value}</td>
            </tr>
          );
      }
    } else {
      return null;
    }
  };

  const tags = props.tags;

  const approvedLog = props.json?.approvedLog || [];
  const documentData = props.documentData || {};
  const userIsChecker = props.userProfile.id == props.makerOrChecker?.assignedTo;
  const userIsMaker = props.userProfile.id == props.makerOrChecker?.initiatorId;
  const attachmentChecking = props.makerOrChecker.type == "attachment" && props.makerOrChecker.isActive;

  const isPrimary = props.isPrimary;
  const p = props.permissions || {};

  const approveDocumentHandler = () => {
    if (!window.confirm("Do you want to approve this file?")) {
      return;
    }
    const id = props.documentData.id;
    approveDocument(id, (err, json) => {
      if (json.success) {
        toast.success("Document has been approved");
        props.loadDocument();
      } else {
        toast.error(json.message);
      }
    });
  };

  const handleSendDocumentToChecker = () => {
    if (!window.confirm("Do you want to Sent this file to Checker?")) {
      return;
    }
    const id = props.documentData.id;
    sendToChecker(id, (err, json) => {
      if (json.success) {
        window.history.back();
        toast.success("Document has been send to user.");
        props.loadDocument();
      } else {
        toast.error(json.message);
      }
    });
  };

  const resubmitDocumentHandler = () => {
    if (!window.confirm("Do you want to resubmit this file?")) {
      return;
    }

    const id = props.documentData.id;
    resubmitDocument(id, (err, json) => {
      if (json.success) {
        toast.success("Document has been resubmitted");
        window.history.back();
      } else {
        toast.error(json.message);
      }
    });
  };
  const docdeleteDocument = (id) => {
    if (!window.confirm("Do you want to delete this file?")) {
      return;
    }

    deleteDocument(id, (err, json) => {
      if (err) {
        return toast.error("Failed to delete");
      }

      if (json.success) {
        toast.success("Successfully deleted");
        window.history.back();
      } else {
        toast.error(json.message);
      }
    });
  };

  const handleSecurityLevel = (value) => {
    switch (value) {
      case 1:
        return "Low";

      case 2:
        return "Medium";

      case 3:
        return "High";

      case 4:
        return "User Group";

      default:
        return null;
    }
  };

  const rejectDocument = () => {
    let rejectReason = prompt("reason to reject");
    if (!window.confirm("Do you want to reject this file?")) {
      return;
    }
    const rejectData = {
      id: props.documentData.id,
      rejectReason: rejectReason,
    };

    archiveDocument(rejectData, (err, json) => {
      if (json.success) {
        toast.success("The document has been rejected");
        window.history.go(-1);
      } else {
        toast.error(json.message);
      }
    });
  };

  const scrollContainerStyle = {
    height: "607px",
    overflowX: "hidden",
    overflowY: "scroll",
  };

  return (
    // <div className="component-container">
    <>
      <Card className="shadow scrollbar-primary " style={scrollContainerStyle}>
        <ToastContainer />
        {/* HEADING START */}
        {/* <div className="row"> */}
        <CardHeader
        // className="d-flex justify-content-between"
        >
          <div className="d-flex justify-content-between align-items-center">
            <p className="h5 ">Document Information</p>

            <div className="d-flex pt-2">
              {isPrimary && userIsMaker && !props.documentData.isApproved && (
                <Button
                  className="d-block btn btn-outline-danger btn-sm border-danger bg-light border mr-2"
                  onClick={() => docdeleteDocument(props.documentData.id)}
                >
                  <i className="fa fa-trash mr-1" />
                </Button>
              )}

              <>
                {isPrimary &&
                  (p.document === VIEW_EDIT || p.document === VIEW_EDIT_DELETE) &&
                  !props.documentData.isApproved ? (
                  <div>
                    {/* dont allow to edit when document is archived */}
                    {props.documentData.isArchived == false && props.makerOrChecker.assignedTo != props.userProfile.id && (
                      <Link
                        className="btn btn-outline-dark btn-sm border-dark border"
                        to={metaRoutes.documentsEdit + "?i=" + A.getHash(documentData.id)}
                      >
                        <i className="fa fa-pencil mr-1" />
                      </Link>
                    )}
                  </div>
                ) : null}
                {/* only maker can view approve the document */}
                {userIsChecker &&
                  !props.documentData.isArchived &&
                  !props.documentData.returnedByChecker &&
                  (!props.documentData?.isApproved || attachmentChecking) && (
                    <>
                      <CustomTableAction
                        permission={p.checker}
                        onClick={() => approveDocumentHandler()}
                        buttonType="approve"
                      />
                      <CustomTableAction permission={p.checker} onClick={() => rejectDocument()} buttonType="cancel" />
                    </>
                  )}
              </>
            </div>

            {/* Initiator can view Resend the document. Resend document */}
            {isPrimary && userIsMaker && props.documentData.returnedByChecker && (
              // props.documentData.isArchived &&
              <div>
                <Button className="btn rounded btn-sm btn-primary text-light" onClick={() => resubmitDocumentHandler()}>
                  Resubmit
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        {/* HEADING END */}
        <CardBody>
          {/* <div className="component-content-container"> */}
          {documentData.identifier ? (
            <Row className="mb-1">
              <Col className="text-center">
                <PrintFile documentData={documentData} />
              </Col>
              {/* <BarCode value={documentData.identifier} /> */}
            </Row>
          ) : null}

          {props.documentData.returnedByChecker && !props.documentData.sendToChecker && (
            <p className="bg-secondary p-2 rounded">
              <b>Document has been rejected because of</b> {" - "}
              {props.documentData.returnedMessage}
            </p>
          )}
          <Table responsive bordered hover id="toExcel">
            <tbody>
              <DocumentRow
                label="Document Type"
                value={getValue(props.allFields.documentTypes, documentData.documentTypeId)}
              />
              <DocumentRow label={"Identifier"} value={documentData.identifier} />
              <DocumentRow label={"Organization Name"} value={documentData.name} />
              {onlyForThisVendor([banks.rbb.name, banks.citizen.name]) && (
                <DocumentRow
                  label={"Feature"}
                  value={
                    <>
                      {!documentData.hasQuickQcr &&
                        !documentData.hasEncryption &&
                        !documentData.hasOtp &&
                        "No feature available"}
                      {documentData.hasQuickQcr && (
                        <CustomChip label="Quick OCR" variant="outlined" style={{ marginRight: 5 }} />
                      )}
                      {documentData.hasEncryption && (
                        <CustomChip label="Encrypted" variant="outlined" style={{ marginRight: 5 }} />
                      )}
                      {documentData.hasOtp && (
                        <CustomChip
                          label="OTP"
                          variant="outlined"
                          style={{
                            marginRight: 5,
                            marginTop: 5,
                          }}
                        />
                      )}
                    </>
                  }
                />
              )}
              <DocumentRow label={"Document Name"} value={documentData.otherTitle} />
              {documentData?.description ? (
                <DocumentRow
                  label="Note"
                  type="text"
                  value={
                    <Badge
                      radius="sm"
                      variant="outline"
                      size="lg"
                      color="dark"
                      leftSection={<EmailIcon style={{ fontSize: "1rem" }} />}
                    >
                      {documentData.description}.
                    </Badge>
                  }
                />
              ) : null}
              <DocumentRow label="Created By" value={getValue(props.allFields.users, documentData.ownerId)} />
              <DocumentRow label="Language" value={getValue(props.languages, documentData.languageId)} />
              <DocumentRow
                label="Document Condition"
                value={getValue(props.documentConditions, documentData.documentConditionId)}
              />
              <DocumentRow
                label={documentData.hierarchy ? "Security Hierarchy" : "Security Level"}
                value={handleSecurityLevel(documentData.securityLevel) || documentData.hierarchy}
              />
              <>
                <DocumentRow
                  label={"Approval"}
                  value={
                    <>
                      {!documentData.isApproved && (
                        <span className="pr-2 pt-2 pb-2 border rounded">
                          <i className="fa fa-close mr-1 p-2 text-danger" />
                          Not Approved
                        </span>
                      )}
                      {documentData.isApproved && (
                        <span className="pr-2 pt-2 pb-2 border rounded">
                          <i className="fa fa-check mr-1 p-2 text-success" /> Approved
                        </span>
                      )}
                    </>
                  }
                />

                <DocumentRow
                  label={"Archived"}
                  value={
                    <>
                      {!documentData.isArchived && (
                        <span className="pr-2 pt-2 pb-2 border rounded">
                          <i className="fa fa-archive mr-1 p-2 text-danger" />
                          Not Archived
                        </span>
                      )}
                      {documentData.isArchived && (
                        <span className="pr-2 pt-2 pb-2 border rounded">
                          <i className="fa fa-archive mr-1 p-2 text-primary" /> Archived
                        </span>
                      )}
                    </>
                  }
                />
              </>

              <DocumentRow label="Department" value={getValue(props.allFields.departments, documentData.departmentId)} />
              {/* <DocumentRow label="Branch" value={getValue(props.allFields.branches, documentData.branchId)} /> */}
              <DocumentRow label="Status" value={getValue(props.allFields.statuses, documentData.statusId)} />
              <DocumentRow label="Location Map" value={getValue(props.allFields.locationMaps, documentData.locationMapId)} />
              <DocumentRow label="Expiry Date" type="date" value={documentData.disposalDate} />

              <DocumentRow label="Created" type="date" value={documentData.createdAt} />
              <DocumentRow label="Modified" type="date" value={documentData.updatedAt} />

              {approvedLog.map((row) => (
                <DocumentRow label="Approved by" value={row.type + " - " + row.email} />
              ))}

              <DocumentRow
                label="Tags"
                value={
                  tags.length > 0 ? (
                    <>
                      {tags.map((row) => (
                        <CustomChip
                          label={row}
                          variant="filled"
                          className="mr-1
                          "
                        />
                      ))}
                    </>
                  ) : (
                    <CustomChip label="No Tags Found" variant="filled" />
                  )
                }
              />
              {documentData &&
                documentData.document_indices &&
                documentData.document_indices.map((item, index) => {
                  return (
                    <DocumentRow
                      key={index}
                      label={item.label}
                      type={item.dataType}
                      value={item.document_index_value ? item.document_index_value.value : null}
                    />
                  );
                })}
            </tbody>
          </Table>

          <ReactHTMLTableToExcel
            id="toExcel-button"
            className="btn btn-sm btn-primary text-white float-right"
            table="toExcel"
            filename="documentinformation"
            sheet="tablexls"
            buttonText="Download Report"
          />
        </CardBody>
        {/* </div> */}
      </Card>
    </>
  );
};

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(DocumentInformation);
