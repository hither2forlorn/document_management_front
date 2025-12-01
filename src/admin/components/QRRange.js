import React, { useState, useRef, Childern, useEffect } from "react";
import QRCode from "qrcode.react";
import { QrCode } from "react-qrcode-pretty";
import { connect } from "react-redux";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import { searchDocuments } from "admin/views/DocumentManagement/api";
import { server } from "admin/config/server";
import ExcelExport from "./Excelexport";

const QRRange = () => {
  const componentRef = useRef();
  const [first, setFirst] = useState();
  const [second, setSecond] = useState();
  const [toggle, setToggle] = useState(false);
  const [data, setData] = useState([]);
  const [res, setRes] = useState(false);
  const [excelData, setExcelData] = useState([]);

  const [qrLength, setQrLength] = useState(0);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleQRPrint = (e) => {
    e.preventDefault();
    getQRDataFromDb();
    // if (res) {
    handlePrint();
    setToggle(!toggle);
    setFirst("");
    setSecond("");

    setData([]);
    // }
  };

  const getQRDataFromDb = () => {
    server
      .get(`/document-range?first=${first}&second=${second}`)
      .then((qrData) => {
        const accountLength = qrData?.data?.accountInformation?.length;
        setQrLength(accountLength);
        setExcelData((excelData) => [...excelData, qrData.data.excelInformation]);

        console.log(accountLength, "this is data");
        if (qrData.data.success === false) {
          setRes(!res);
          return alert(
            "QR won't show data because data length ie. 1500 exceeds. (Please Change Document Range upto 40 or 50) Please Refresh To Work Smooth!"
          );
        } else {
          setData((data) => [...data, qrData.data.accountInformation]);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <form onSubmit={(e) => handleQRPrint(e)} className=" d-flex row ml-4 mt-2">
        {toggle && (
          <div ref={componentRef} className="small">
            <div style={{ padding: 20 }}>
              <span
                style={{
                  margin: "20px",
                  fontSize: "2rem",
                }}
              >
                <b>TOTAL ACCOUNTS : {qrLength}</b>
              </span>
              {/* <QRCode value={data.toString()} className="border p-1 w-50 h-50 " /> */}
              <QrCode
                className="small"
                value={data.toString()}
                variant={{
                  eyes: "gravity",
                  body: "fluid",
                }}
                color={{
                  eyes: "#223344",
                  body: "#335577",
                }}
                padding={20}
                margin={30}
                bgColor="#ddeeff"
                bgRounded
                divider
                resize={1000}
                supressErrors={true}
              />
            </div>
          </div>
        )}
        <div className="d-flex m-0">
          <div className="form-group">
            <label for="" className=" font-weight-bold">
              Enter Account Number (From)
            </label>
            <input
              type="number"
              className="form-control"
              name="initial"
              onChange={(e) => setFirst(e.target.value)}
              value={first}
            />
          </div>

          <div className="form-group ml-2">
            <label for="" className=" font-weight-bold">
              Enter Account Number (To)
            </label>
            <input
              type="number"
              className="form-control"
              name="final"
              onChange={(e) => setSecond(e.target.value)}
              value={second}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-sm btn-default h-25  ml-2" style={{ marginTop: "27px" }}>
          <i className="fas fa-print"></i>
          {!toggle ? " View QR" : " Print this QR out!!"}
        </button>
      </form>
      <div>{excelData && excelData.length > 0 ? <ExcelExport excelData={excelData} /> : ""}</div>
    </>
  );
};

export default QRRange;
