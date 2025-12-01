import React, { useState, useRef, useEffect } from "react";

import ReportingBox from "./ReportingBox";
import { Route, useLocation } from "react-router-dom";
import PaginationTable from "./PaginationTable";
import axios from "axios";
import { server } from "admin/config/server";

export default function LogsPage(props) {
  const queryId = useLocation().search.split("=")[1];
  const [data, setData] = useState("");

  useEffect(() => {
    server.get("/metalink").then((response) => {
      console.log(response.data.iframeUrl);
      setData(response.data.iframeUrl);
    });
  }, []);

  return (
    <>
      <iframe src={data[1]} frameborder="0" width="100%" height="600" allowtransparency></iframe>
      <iframe src={data[0]} frameborder="0" width="100%" height="600" allowtransparency></iframe>
    </>
  );
}
