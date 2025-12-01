import React, { useState, useEffect } from "react";
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu, Card, CardHeader, Row, Col } from "reactstrap";
import _ from "lodash";

import FileViewer from "react-file-viewer"; //FILE VIEWER
import Viewer from "react-viewer"; //IMAGE VIEWER
import { previewAttachment } from "../api";
import moment from "moment";
import { connect } from "react-redux";
import { SERVER_URL } from "admin/config/server";
import { toast } from "react-toastify";
import NoFileSelected from "./Preview/NoFileSelected";
import ImageViewer from "./Preview/ImageViewer";
import HeaderPreview from "./Preview/HeaderPreview";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import FilePreview from "./Preview/FilePreview";
import { Spin } from "antd";

const PreviewAttachments = (props) => {
  const p = props.permissions;
  const [loading, setLoading] = useState(false);
  // show single attachment.
  let attachments = props.attachment ? props.attachments.filter((row) => row.id === props.attachId) : props.attachments;

  // remove file type parent=> only for indexes.
  attachments = attachments?.filter((attach) => attach.fileType != "parent");

  const imageAttachments = _.filter(attachments || [], (att) => att.fileType.includes("image"));
  const [state, setState] = useState({
    previewFileType: null,
    previewFilePath: null,
    isPDF: true,
    isImage: true,
    isDropdownOpen: false,
  });
  const getFileType = (type) => {
    type = type.toLowerCase();
    switch (type) {
      case "jpg":
        type = "jpeg";
        break;
      default:
        break;
    }
    return type;
  };

  const previewFile = (id) => {
    // for hourly access
    props.setSelectedAttachmentId(id);
    setLoading(true);
    if (id) {
      previewAttachment(id, (err, json) => {
        if (err) {
          console.log(err);
          toast.error("Error ");
        }
        if (json.success) {
          const fileType = getFileType(json.fileType);
          const filePath = SERVER_URL + "/" + json.filePath;
          setState({
            ...state,
            previewFileType: fileType,
            previewFilePath: filePath,
            isPDF: fileType === "pdf" || fileType === "PDF" || fileType === "txt",
            isImage: false,
            isDropdownOpen: false,
          });
          setLoading(false);
        } else {
          window.alert(json.message);
        }
      });
    } else {
      setState({
        ...state,
        isImage: true,
      });
    }
  };

  useEffect(() => {
    // show pdf if there is no image
    if (attachments.length > 0 && imageAttachments == 0) {
      previewFile(attachments[0]?.id);
    }
    // set default attachment if it not
    setState({
      previewFileType: null,
      previewFilePath: null,
      isPDF: true,
      isImage: true,
      isDropdownOpen: false,
    });
    // props.attachment && previewFile(props?.attachId);
  }, [props.isDeleted]);
  return (
    <Card className="shadow">
      <CardHeader>
        <HeaderPreview setState={setState} state={state} attachments={attachments} previewFile={previewFile} />
      </CardHeader>
      {/* HEADING END */}
      {loading ? (
        <div
          className="component-content-container"
          style={{
            textAlign: "center",
            height: "450px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin />
        </div>
      ) : (
        <div className="component-content-container">
          {/*  File Preview */}
          <FilePreview state={state} p={p} />

          {/* image preview */}

          <ImageViewer imageAttachments={imageAttachments} state={state} p={p} />
        </div>
      )}
      {/* </div> */}
    </Card>
  );
};

export default connect((state) => ({
  user: state.userProfile,
}))(PreviewAttachments);
