import { SERVER_URL } from "admin/config/server";
import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import Viewer from "react-viewer";
import NoFileSelected from "./NoFileSelected";
import _ from "lodash";

export default function ImageViewer(props) {
  const { imageAttachments, state, p } = props;
  const user = useSelector((state) => state.userProfile);
  return (
    <div
      id="image-preview-container"
      style={{
        height: 630,
        width: "100%",
        textAlign: "center",
        alignContent: "center",
        display: state.isImage ? "block" : "none",
      }}
    >
      {imageAttachments.length !== 0 ? (
        <div>
          <span
            style={{
              opacity: "60%",
              position: "absolute",
              left: "10%",
              top: "78%",
              textAlign: "left",
              zIndex: 1010,
              color: "black",
              fontWeight: "bold",
              fontSize: "1.2em",
            }}
          >
            {user.username}
          </span>
          <span
            style={{
              opacity: "60%",
              position: "absolute",
              left: "78%",
              top: "78%",
              textAlign: "left",
              // verticalAlign: 'middle',
              zIndex: 1010,
              color: "black",
              fontWeight: "bold",
              fontSize: "1em",
            }}
          >
            {moment().format("YYYY-MM-DD HH:mm")}
          </span>
          <Viewer
            // noImgDetails
            noClose
            downloadable={p.download}
            container={document.getElementById("image-preview-container")}
            visible={state.isImage}
            images={_.map(imageAttachments, (att) => {
              return {
                src: SERVER_URL + att.filePath,
                alt: att.name,
              };
            })}
          />
        </div>
      ) : (
        <NoFileSelected />
      )}
    </div>
  );
}
