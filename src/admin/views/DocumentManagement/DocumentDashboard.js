import React, { useState, useEffect } from "react";
import DocumentListTable from "./components/DocumentListTable";
import { connect } from "react-redux";
import SearchDocument from "./SearchDocument";
import { getFormData } from "config/form";
import { deleteDocument } from "./api";
import { searchDocumentsPagination } from "./api/document";
import { setDocumentSearchData } from "redux/actions/documentAc";
import { Col, Row } from "reactstrap";
import Axios from "axios";
import { useSelector } from "react-redux";
import { banks, excludeThisVendor, onlyForThisVendor } from "config/bank";
import { toast } from "react-toastify";
import { Loader } from "@mantine/core";
import CustomLoadingOverlay from "./CustomOverlayLoading";

const DocumentDashboard = (props) => {
  const [documentList, setDocumentList] = useState([]);
  const [count, setCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [accountSearchData, setAccountSearchData] = useState({});
  const [loading, setLoading] = useState(false); // Loading state

  const limit = useSelector((state) => state.docLimitDocumentNumber);

  const handleChangePage = (event, newPage) => {
    setPageNumber(newPage);
  };

  const showControl =
    excludeThisVendor([banks.rbb.name]) || props.userProfile.id === 1 || props.userProfile.hierarchy === "Super-001";

  const onChange = (e) => {
    let data = {};
    if (e?.length >= 0) {
      data = { tags: e };
    } else {
      const {
        target: { checked, name, value, type },
      } = e;
      switch (type) {
        case "checkbox":
          data = { [name]: checked };
          break;
        default:
          data = { [name]: value };
      }
    }
    if (data.branchId) {
      localStorage.setItem("branchId", data.branchId);
    }

    // Reset the search query when Document type is not selected
    if (data.documentTypeId === "") {
      onReset();
    } else {
      setPageNumber(1);
      props.dispatch(setDocumentSearchData({ ...props.searchData, ...data }));
    }
  };

  const onReset = () => {
    props.dispatch(setDocumentSearchData({}));
    localStorage.removeItem("branchId");
  };

  const onSearch = (event) => {
    event.preventDefault();
    const data = getFormData(event);
    props.dispatch(setDocumentSearchData({ ...props.searchData, ...data }));
  };

  const handleAccountSearch = () => {
    let accountSearchData = props.searchData;
    setAccountSearchData(accountSearchData);

    const CancelToken = Axios.CancelToken;
    const source = CancelToken.source();

    setLoading(true); // Enable loader

    setTimeout(() => {
      searchDocumentsPagination(
        accountSearchData,
        (err, res) => {
          setLoading(false); // Disable loader

          if (err) return;
          if (res.success) {
            setDocumentList(res.paginationDocument);
            setTotalDocuments(res.total);
          } else {
            window.alert(res.message);
          }
        },
        { page: pageNumber, limit: props.docLimit },
        source
      );
    }, 10); // Simulated delay of 2 seconds
  };

  const loadData = (source) => {
    let newSearchData = { ...props.searchData };
    if (typeof newSearchData.branchId === "string") {
      let hasSelectedBranchId = localStorage.getItem("branchId");
      if (hasSelectedBranchId) {
        newSearchData.branchId = hasSelectedBranchId;
      }
    }
    let searchData = props.searchData;

    if (searchData.documentTypeId) {
      return;
    } else {
      setLoading(true); // Enable loader

      searchDocumentsPagination(
        newSearchData,
        (err, res) => {
          setLoading(false); // Disable loader

          if (err) return;
          if (res.success) {
            setDocumentList(res.paginationDocument);
            setTotalDocuments(res.total);
          } else {
            window.alert(res.message);
          }
        },
        { page: pageNumber, limit: props.docLimit },
        source
      );
    }
  };

  const delDocument = (id) => {
    if (!window.confirm("Do you want to delete this file?")) {
      return;
    }
    deleteDocument(id, (err, json) => {
      if (err) return;
      if (!json?.success) {
        return toast.error(json?.message);
      }
      loadData();
    });
  };

  useEffect(() => {
    if (count === 0 && !localStorage.getItem("branchId")) {
      onReset();
      setCount((pre) => pre + 1);
      return;
    }

    const CancelToken = Axios.CancelToken;
    const source = CancelToken.source();

    loadData(source);
  }, [props.searchData, props.docPageNo, props.docLimit, pageNumber, limit]);

  return (
    <Row>
      <Col md={3}>
        <SearchDocument
          onChange={onChange}
          onSearch={onSearch}
          permissions={props.permissions}
          onReset={onReset}
          archivedAccess={props.permissions.archived}
          handleAccountSearch={handleAccountSearch}
        />
      </Col>
      <Col md={9} className="pl-3 pl-md-0">
        <DocumentListTable
          isLoading={loading}
          title="Document List"
          showControl={showControl}
          deleteDocument={delDocument}
          documentList={documentList}
          permissions={props.permissions}
          setPageNumber={setPageNumber}
          handleChangePage={handleChangePage}
          pageNumber={pageNumber}
          totalDocuments={totalDocuments}
        />
      </Col>
    </Row>
  );
};

export default connect((state) => ({
  searchData: state.docSearchData,
  docLimit: state.docLimitDocumentNumber,
  userProfile: state.userProfile,
}))(DocumentDashboard);
