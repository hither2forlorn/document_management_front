import React, { useEffect, useState } from "react";
import { Row, Col, PaginationItem, PaginationLink, CardTitle, Button } from "reactstrap";
import Pagination from "@mui/lab/Pagination";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { VIEW, VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import { getValue } from "config/util";
import A from "config/url";
import metaRoutes from "config/meta_routes";
import CustomEdit from "admin/components/CustomTableAction";
import CustomDelete from "admin/components/CustomDelete";
import { Card, CardHeader, CardBody, CardFooter, Table } from "reactstrap";
import { setDocLimitDocumentNumber } from "redux/actions/documentAc";
import { Badge } from "@mantine/core";
import { useSelector } from "react-redux";
import { FormControl, MenuItem, Select } from "@mui/material";
import { banks, dms_features, includeThisFeature, onlyForThisVendor } from "config/bank";
import CustomChip from "admin/components/CustomChip";
import CustomTableAction from "admin/components/CustomTableAction";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import QRRange from "admin/components/QRRange";
import CustomLoadingOverlay from "../CustomOverlayLoading";
const DocumentListTable = (props) => {
  const [showHierarchy, setshowHierarchy] = useState(false);
  const PER_PAGE_SIZE = props.docLimit;
  const currentPageNumber = props.docPagination;
  const [startOffset, setStartOffset] = useState(currentPageNumber);
  const docLength = props.totalPages;
  const limit = useSelector((state) => state.docLimitDocumentNumber);

  const handleChange = (event) => {
    props.dispatch(setDocLimitDocumentNumber(event.target.value));
  };

  const sortBy = (key) => {
    const sort = props.documentList;
    sort.sort((a, b) => {
      try {
        if (a[key].toLowerCase() < b[key].toLowerCase()) {
          return -1;
        }
        if (a[key].toLowerCase() > b[key].toLowerCase()) {
          return 1;
        }
        return 0;
      } catch (err) {
        return -1;
      }
    });
  };

  useEffect(() => {
    setStartOffset((props.docPagination - 1) * PER_PAGE_SIZE);
  }, [props.docPagination, props.dispatch, props.docLimitDocumentNumber]);

  // if null then add empty array.
  const documentTypes = props.documentTypes ? props.documentTypes : [];
  const departments = props.departments ? props.departments : [];
  const branches = props.branches ? props.branches : [];
  const statuses = props.statuses ? props.statuses : [];
  const locationMaps = props.locationMaps ? props.locationMaps : [];
  const users = props.users ? props.users : [];
  const p = props.permissions ? props.permissions : {};
  const hasDormantPrivilege = props?.permissions?.dormant;
  const hasSavedPrivilege = props.userId;

  function showFeatures(row) {
    return (
      <ul
        style={{
          listStyleType: "none",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
      >
        {row.hasQuickQcr && (
          <li
            style={{
              float: "left",
              cursor: "pointer",
            }}
            data-toggle="tooltip"
            data-placement="top"
            title="Quick OCR Enabled"
          >
            <i className="fas fa-search text-dark bg-warning p-1 mr-1 rounded" placeholder="Quick OCR"></i>
          </li>
        )}
        {row.hasEncryption && (
          <li
            style={{
              float: "left",
              cursor: "pointer",
            }}
            data-toggle="tooltip"
            data-placement="top"
            title="Encryption Enabled"
          >
            <i className="fas fa-lock text-dark bg-warning p-1 mr-1 rounded" placeholder="Encryption"></i>
          </li>
        )}
        {row.hasOtp && (
          <li
            style={{
              float: "left",
              cursor: "pointer",
            }}
            data-toggle="tooltip"
            data-placement="top"
            title="OTP Verification Enabled"
          >
            <i className="fas fa-envelope text-dark bg-warning p-1 mr-1 rounded" placeholder="OTP Verification"></i>
          </li>
        )}
      </ul>
    );
  }

  return (
    <Card className="shadow">
      {/* <QRRange documentList={props.documentList} /> */}
      <CardHeader>
        <p className="h5">{props.title}</p>
        {p?.maker ? (
          <Link to={metaRoutes.documentsAdd} className="btn-header btn btn-outline-dark btn-sm border-dark border">
            <i className="fa fa-plus" /> Add Document
          </Link>
        ) : null}
      </CardHeader>
      <CardBody>
        <>
          <CustomLoadingOverlay isLoading={props.isLoading}>
            <Table responsive bordered hover id="toExcel">
              <thead className="table-active">
                <tr>
                  <th scope="col">Doc Type</th>
                  <th scope="col">Department</th>
                  <th scope="col">Branch</th>
                  {onlyForThisVendor("bok") && (
                    <th scope="col" onClick={() => sortBy("name")}>
                      Account Number
                    </th>
                  )}

                  <th scope="col" onClick={() => sortBy("otherTitle")}>
                    Document Name
                  </th>
                  <th scope="col">Status</th>
                  {props.fromRejectedListTable && <th scope="col">Message</th>}
                  <th scope="col">Location</th>
                  <th scope="col">Created By</th>
                  {props.fromPendingListTable && <th scope="col">Assigned To</th>}

                  {(props.showControl || props.fromRejectedListTable) && <th scope="col">Action</th>}
                </tr>
              </thead>
              <tbody>
                {props?.documentList?.map((row, index) => {
                  // if (index >= startOffset && index < startOffset + PER_PAGE_SIZE) {
                  const documentType = getValue(documentTypes, row.documentTypeId);
                  const status = getValue(statuses, row.statusId);
                  const locationMap = getValue(locationMaps, row.locationMapId);
                  const department = getValue(departments, row.departmentId);
                  const branch = getValue(branches, row.branchId);
                  const createdUser = getValue(users, row.createdBy);
                  const userChecker = getValue(users, row.assignTo);
                  function renderSwitchStatus(row) {
                    switch (row?.DocumentStatus || row?.statusId) {
                      case "Active":
                      case 1:
                        return (
                          <span className="rounded p-1 badge badge-pill badge-success">{status || row.DocumentStatus}</span>
                        );
                      case "Suspended":
                      case 2:
                        return (
                          <span className="rounded p-1 badge badge-pill badge-secondary">
                            {status || row.DocumentStatus}
                          </span>
                        );
                      case "checked out":
                      case 3:
                        return (
                          <span className="rounded p-1 badge badge-pill badge-dark">{status || row.DocumentStatus}</span>
                        );

                      case "Dormant":
                      case 4:
                        return (
                          <span className="rounded p-1 badge badge-pill badge-danger">{status || row.DocumentStatus}</span>
                        );
                      case "Closed":
                      case 5:
                        return (
                          <span className="rounded p-1 badge badge-pill badge-dark">{status || row.DocumentStatus}</span>
                        );
                      default:
                        break;
                    }
                  }

                  return (
                    <tr
                      key={index}
                      style={{
                        pointerEvents: `${row.DocumentStatus === "Unknown" && !hasDormantPrivilege ? "none" : ""}`,
                        background: `${row.DocumentStatus === "Unknown" && !hasDormantPrivilege ? "#eee" : ""}`,
                      }}
                    >
                      <td className="text-break">
                        {documentType || row.DocumentType ? (
                          documentType || row.DocumentType
                        ) : (
                          <CloseCircleOutlined
                            style={{
                              fontSize: "1rem",
                              textAlign: "center",
                              color: "#ccc",
                            }}
                          />
                        )}
                      </td>
                      <td className="text-break" style={{ textAlign: "center" }}>
                        {department || row.Department ? (
                          department || row.Department
                        ) : (
                          <CloseCircleOutlined
                            style={{
                              fontSize: "1rem",
                              textAlign: "center",
                              color: "#ccc",
                            }}
                          />
                        )}
                      </td>
                      <td className="text-break" style={{ textAlign: "center" }}>
                        {branch || row.Branch ? (
                          branch || row.Branch
                        ) : (
                          <CloseCircleOutlined
                            style={{
                              fontSize: "1rem",
                              textAlign: "center",
                              color: "#ccc",
                            }}
                          />
                        )}
                      </td>{" "}
                      {onlyForThisVendor("bok") && <td className="text-break">{row.name || row.OrganizationName}</td>}
                      <td onMouseOver={() => setshowHierarchy(true)} onMouseOut={() => setshowHierarchy(false)}>
                        <Link
                          target="_blank"
                          className="text-break"
                          to={metaRoutes.documentsView + "?i=" + A.getHash(row.id)}
                        >
                          <p>{row.otherTitle || row.DocumentName}</p>
                        </Link>
                      </td>
                      <td
                        className="text-break"
                        style={{
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {showFeatures(row)}
                        <span className="mt-2">
                          {row?.returnedByChecker ? (
                            <span className="rounded p-1 badge badge-pill badge-danger rounded p-1">Rejected</span>
                          ) : (
                            <>
                              {renderSwitchStatus(row)}
                              {/*
                          {row.DocumentStatus == "Active" ? (
                            <span className="bg-success rounded p-1">
                              {console.log("===>", row)}
                              {status || row.DocumentStatus}
                            </span>
                          ) : row.DocumentStatus == "Suspended" ? (
                            <span className="bg-secondary rounded p-1">
                              {console.log("===>", row)}
                              {status || row.DocumentStatus}
                            </span>
                          ) : null} */}
                            </>
                          )}
                        </span>
                      </td>
                      {props.fromRejectedListTable && <td>{row.returnedMessage}</td>}
                      <td className="text-break" style={{ textAlign: "center" }}>
                        {locationMap || row.locationMap ? (
                          locationMap || row.locationMap
                        ) : (
                          <CloseCircleOutlined style={{ fontSize: "1rem", color: "#ccc" }} />
                        )}
                      </td>
                      <td className="text-break d-flex flex-column text-center">
                        {createdUser || row.username}
                        {props.fromPendingListTable && (
                          <>
                            <span className="rounded p-1 badge badge-pill badge-secondary">{row.type}</span>
                          </>
                        )}
                      </td>
                      {/* Action controls */}
                      {props.fromRejectedListTable && (
                        <td>
                          <Button
                            className="badge badge-primary p-2 bg-blue-200 text-blue-600"
                            onClick={() => props.resubmitDocumentHandler(row.id)}
                          >
                            Resubmit
                          </Button>
                        </td>
                      )}
                      {props.fromPendingListTable && (
                        <td style={{ textAlign: "center" }}>
                          {row.isUserChecker ? (
                            <span style={{ textAlign: "center" }}>
                              {userChecker || row.assignTo ? (
                                <Tag color="blue">{userChecker || row.assignTo}</Tag>
                              ) : (
                                <p>Not Found</p>
                              )}
                            </span>
                          ) : null}
                        </td>
                      )}
                      {props.showControl && (
                        <td>
                          {props.fromPendingListTable && row.isUserChecker ? "Approval Pending" : null}
                          {/* Edit */}
                          {(p.document === VIEW_EDIT || p.document === VIEW || p.document === VIEW_EDIT_DELETE) &&
                            !row?.isUserChecker && (
                              <>
                                {/* Approve */}
                                {props.approveDocument && (
                                  <>
                                    <CustomTableAction
                                      permission={p.checker}
                                      onClick={() => props.approveDocument(row.id)}
                                      buttonType="approve"
                                    />
                                    <CustomTableAction
                                      permission={p.checker}
                                      onClick={() => props.rejectDocument(row.id)}
                                      buttonType="cancel"
                                    />
                                  </>
                                )}

                                {!props.fromPendingListTable && (
                                  <CustomTableAction
                                    to={metaRoutes.documentsEdit + "?i=" + A.getHash(row.id)}
                                    permission={p.document}
                                    buttonType="edit"
                                  />
                                )}
                              </>
                            )}
                          {/* Delete*/}
                          {props.deleteDocument && p.document === VIEW_EDIT_DELETE && (
                            <div>
                              <CustomTableAction
                                permission={p.document}
                                onClick={() => props.deleteDocument(row.id)}
                                buttonType="delete"
                              />
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </CustomLoadingOverlay>
        </>
      </CardBody>
      <CardFooter className="bg-white">
        <Row>
          <Col>
            <Pagination
              count={parseInt(Math.ceil(props.totalDocuments / limit))}
              onChange={props.handleChangePage}
              shape="rounded"
              page={props.pageNumber}
            />
          </Col>
          <Col>
            <div className="float-right mt-2 d-flex align-items-center">
              <p className="mb-0 mr-2">Items Per Page</p>
              <FormControl>
                <Select
                  labelId="demo-customized-select-label"
                  id="demo-customized-select"
                  value={props.docLimit}
                  onChange={handleChange}
                  className="form-control rounded"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
              <p className="mb-0 ml-2">
                Total Documents :<b className="mr-2">{props.totalDocuments}</b> Page :<b> {props.pageNumber}</b>
              </p>
              {includeThisFeature(dms_features.DOWNLOAD_REPORT) && (
                <ReactHTMLTableToExcel
                  id="toExcel-button"
                  className="btn btn-sm ml-2 btn-primary text-white float-right"
                  table="toExcel"
                  filename="documents"
                  sheet="tablexls"
                  buttonText="Download Report"
                />
              )}
            </div>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};

export default connect((state) => ({
  ...state.allFields,
  docLimit: state.docLimitDocumentNumber,
}))(DocumentListTable);
