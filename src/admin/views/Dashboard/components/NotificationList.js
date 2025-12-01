import React, { useEffect, useState, useRef } from "react";
import { Row, Col, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import { getValue } from "config/util";
import A from "config/url";
import PropTypes from "prop-types";
import metaRoutes from "config/meta_routes";
import CustomEdit from "admin/components/CustomTableAction";
import CustomDelete from "admin/components/CustomDelete";
import { Card, CardHeader, CardBody, CardFooter, Table } from "reactstrap";
import { setDocLimitDocumentNumber, setDocPageNo } from "redux/actions/documentAc";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const NotificationList = (props) => {
  const PER_PAGE_SIZE = props.docLimit;
  const offset = props.docLimit; // total number of page to show in pagination
  const currentPageNumber = props.docPagination;
  const [startOffset, setStartOffset] = useState(currentPageNumber);
  const docLength = props.totalPages;

  const handleSelect = (number) => {
    if (number > 0 && number - 1 < docLength / PER_PAGE_SIZE) {
      props.dispatch(setDocPageNo(number));
      setStartOffset((number - 1) * PER_PAGE_SIZE);
    }
  };
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
  const statuses = props.statuses ? props.statuses : [];
  const locationMaps = props.locationMaps ? props.locationMaps : [];
  const users = props.users ? props.users : [];
  const p = props.permissions ? props.permissions : {};

  let TOTAL_PAGES = Math.ceil(docLength / PER_PAGE_SIZE);

  const start = currentPageNumber - offset <= 0 ? 0 : currentPageNumber - offset;
  const end = currentPageNumber + offset >= TOTAL_PAGES ? TOTAL_PAGES : currentPageNumber + offset;
  const paginationItems = [];

  for (let i = start; i < end; i++) {
    paginationItems.push(
      <PaginationItem active={i === startOffset / PER_PAGE_SIZE} key={i}>
        <PaginationLink href="" onClick={() => handleSelect(i + 1)}>
          {i + 1}
        </PaginationLink>
      </PaginationItem>
    );
  }
  return (
    <Card>
      <CardHeader>
        <span>
          <b>Yoh have {props.documentList.length} new notifications</b>
        </span>
      </CardHeader>
      <CardBody className="notification-list p-0">
        {props.documentList.map((row, index) => {
          // if (index >= startOffset && index < startOffset + PER_PAGE_SIZE) {
          const documentType = getValue(documentTypes, row.documentTypeId);
          const status = getValue(statuses, row.statusId);
          const locationMap = getValue(locationMaps, row.locationMapId);
          const department = getValue(departments, row.departmentId);
          const createdUser = getValue(users, row.createdBy);

          return (
            <>
              <Link to={metaRoutes.documentsView + "?i=" + A.getHash(row.id)}>
                <div className="notification-icon">
                  <i className="fa fa-bell text-light"></i>
                </div>
                {row.returnedByChecker ? (
                  <span className="bg-red-400">
                    Document Name : <b>"{row.otherTitle || row.DocumentName}" </b>
                    has been rejected.
                  </span>
                ) : (
                  <span>
                    Document Name : <b>"{row.otherTitle || row.DocumentName}" </b>
                    from "{department || row.Department}" Department is waiting for approval.
                  </span>
                )}
              </Link>
              {/* <tr key={index}>
                <td className="text-break">
                  {documentType || row.DocumentType}
                </td>

                <td className="text-break">{department || row.Department}</td>
                <td className="text-break">
                  {row.name || row.OrganizationName}
                </td>
                <td>{row.otherTitle || row.DocumentName}</td>
                <td className="text-break">{status || row.DocumentStatus}</td>
                <td className="text-break">{locationMap}</td>
                <td className="text-break">{createdUser || row.username}</td>
                <td>
                  <Link
                    className="btn btn-sm btn-brand btn-primary"
                    to={metaRoutes.documentsView + "?i=" + A.getHash(row.id)}
                  >
                    <i className="fa fa-eye"></i>
                  </Link>
                </td>
              </tr> */}
            </>
          );
          // }
          // return null;
        })}
        {/* <Table responsive bordered>
          <thead className="table-active">
            <tr>
              <th scope="col">Document Type</th>
              <th scope="col">Department</th>
              <th scope="col" onClick={() => sortBy("name")}>
                BOk Id
              </th>
              <th scope="col" onClick={() => sortBy("otherTitle")}>
                Document Name
              </th>
              <th scope="col">Status</th>
              <th scope="col">Location</th>
              <th scope="col">Created By</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {props.documentList.map((row, index) => {
              // if (index >= startOffset && index < startOffset + PER_PAGE_SIZE) {
              const documentType = getValue(documentTypes, row.documentTypeId);
              const status = getValue(statuses, row.statusId);
              const locationMap = getValue(locationMaps, row.locationMapId);
              const department = getValue(departments, row.departmentId);
              const createdUser = getValue(users, row.createdBy);
              return (
                <tr key={index}>
                  <td className="text-break">
                    {documentType || row.DocumentType}
                  </td>

                  <td className="text-break">{department || row.Department}</td>
                  <td className="text-break">
                    {row.name || row.OrganizationName}
                  </td>
                  <td>{row.otherTitle || row.DocumentName}</td>
                  <td className="text-break">{status || row.DocumentStatus}</td>
                  <td className="text-break">{locationMap}</td>
                  <td className="text-break">{createdUser || row.username}</td>
                  <td>
                    <Link
                      className="btn btn-sm btn-brand btn-primary"
                      to={metaRoutes.documentsView + "?i=" + A.getHash(row.id)}
                    >
                      <i className="fa fa-eye"></i>
                    </Link>
                  </td>
                </tr>
              );
              // }
              // return null;
            })}
          </tbody>
        </Table>
       */}
      </CardBody>
    </Card>
  );
};

NotificationList.propTypes = {
  title: PropTypes.string,
  documentList: PropTypes.array,
  showControl: PropTypes.bool,
  deleteDocument: PropTypes.func,
  permissions: PropTypes.object,
};

export default connect((state) => ({
  ...state.allFields,
  docPagination: state.docPageNo,
  totalPages: state.docTotalPages,
  docLimit: state.docLimitDocumentNumber,
}))(NotificationList);
