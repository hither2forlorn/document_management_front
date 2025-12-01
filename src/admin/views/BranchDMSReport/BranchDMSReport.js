import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Select, DatePicker, Button, Input, Spin, Tabs } from "antd";
import { CSVLink } from "react-csv";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { AllBranchDMSReport, getDMSBranchReport } from "./api/BranchDMSReportAPI";
import moment from "moment";
import { toast } from "react-toastify";
import branchList from "./branches.json";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const BranchDMSReport = () => {
  const [reportingData, setReportingData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dmsCount, setDmsCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReportData = async () => {
    setLoading(true);

    try {
      const requestBody = {
        branchName: selectedBranch,
        fromDate: dateRange[0] ? moment(dateRange[0]).format("DD-MM-YYYY") : null,
        toDate: dateRange[1] ? moment(dateRange[1]).format("DD-MM-YYYY") : null,
      };

      getDMSBranchReport(requestBody, (err, data) => {
        if (err) {
          toast.error(err.response.data.message);
          setLoading(false);
        } else {
          if (Array.isArray(data)) {
            setReportingData(data);
            const notApprovedCount = data.filter((item) => item.isExistsOnDMS.includes("not approved")).length;
            const noCount = data.filter((item) => item.isExistsOnDMS === "no").length;
            setDmsCount(notApprovedCount + noCount);
            setTotalCount(data.length);
            setLoading(false);
          } else {
            setReportingData([]);
            toast.warn(data.message);
          }
        }
      });
    } catch (error) {
      setLoading(false);
      console.error("Unexpected error occurred:", error);
      toast.error("Unexpected error occurred");
    }
  };

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
  };

  const handleFilter = () => {
    fetchReportData();
  };

  const handleSearch = (selectedKeys, confirm) => {
    confirm();
  };

  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const columns = [
    {
      title: "S.N",
      dataIndex: "S.N",
      key: "S.N",
    },
    {
      title: "Branch ID",
      dataIndex: "BRANCHID",
      key: "BRANCHID",
    },
    {
      title: "Branch Name",
      dataIndex: "BRANCHNAME",
      key: "BRANCHNAME",
    },
    {
      title: "Account Name",
      dataIndex: "ACCT_NAME",
      key: "ACCT_NAME",
    },
    {
      title: "Account Number",
      dataIndex: "ACCOUNT_NO",
      key: "ACCOUNT_NO",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Account Number"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />,
      onFilter: (value, record) => record.ACCOUNT_NO.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Account Open Date",
      dataIndex: "ACCT_OPN_DATE",
      key: "ACCT_OPN_DATE",
    },
    {
      title: "Scheme Code",
      dataIndex: "SCHM_CODE",
      key: "SCHM_CODE",
    },
    {
      title: "Scheme Description",
      dataIndex: "SCHM_DESC",
      key: "SCHM_DESC",
    },
    {
      title: "isExistsOnDMS",
      dataIndex: "isExistsOnDMS",
      key: "isExistsOnDMS",
    },
  ];

  const paginationSettings = { defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ["3", "5", "10", "20", "30"] };

  const getSummaryData = () => {
    return [
      {
        "S.N": "",
        BRANCHID: "",
        BRANCHNAME: "",
        ACCT_NAME: "",
        ACCOUNT_NO: "",
        ACCT_OPN_DATE: "",
        SCHM_CODE: "",
        SCHM_DESC: "",
        isExistsOnDMS: "",
        summary: `The total document that doesn't exist on DMS of ${selectedBranch} branch from ${
          dateRange[0] ? moment(dateRange[0]).format("DD-MM-YYYY") : "start"
        } to ${
          dateRange[1] ? moment(dateRange[1]).format("DD-MM-YYYY") : "end"
        } is ${dmsCount}. The total accounts opened between the date range is ${totalCount}`,
      },
    ];
  };

  const csvData = [...reportingData, ...getSummaryData()];

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Branch DMS Report" key="1">
        <div>
          <h3 style={{ marginBottom: "10px" }}>DMS / Finnacle Difference Report</h3>
          <p style={{ color: "red" }}>Please select branch and date.</p>
          <Select
            showSearch
            placeholder="Select a Branch"
            style={{ width: 200, marginRight: 10 }}
            onChange={handleBranchChange}
          >
            {branchList.map((branch) => (
              <Option key={branch.name} value={branch.value}>
                {branch.name}
              </Option>
            ))}
          </Select>
          <RangePicker style={{ marginRight: 10, marginBottom: 20 }} onChange={handleDateRangeChange} />
          <Button type="primary" onClick={handleFilter}>
            Filter
          </Button>

          <CSVLink data={csvData} filename={"report.csv"}>
            <Button type="primary" style={{ marginLeft: 10 }}>
              Export to Excel
            </Button>
          </CSVLink>
          {reportingData.length > 0 ? (
            <p
              style={{
                fontWeight: "500",
                fontSize: "18px",
                fontFamily: "sans-serif",
              }}
            >
              The total document that doesn't exist on DMS of {selectedBranch} branch from &nbsp;
              {dateRange[0] ? dateRange[0].format("DD-MM-YYYY") : "start"} to{" "}
              {dateRange[1] ? dateRange[1].format("DD-MM-YYYY") : "end"} is{" "}
              <span
                style={{
                  color: "red",
                  fontWeight: "bold",
                }}
              >
                {dmsCount}
              </span>{" "}
              .The total accounts opened between the date range is{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color: "green",
                }}
              >
                {totalCount}.
              </span>
            </p>
          ) : (
            ""
          )}
        </div>
        {loading ? (
          <Spin
            size="large"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "2rem",
            }}
          />
        ) : (
          <Table dataSource={reportingData} columns={columns} pagination={paginationSettings} rowKey="ACCOUNT_NO" />
        )}
      </TabPane>
      <TabPane tab="All Branch DMS Report" key="2">
        <AllBranchReport />
      </TabPane>
    </Tabs>
  );
};

const AllBranchReport = () => {
  const [reportingData, setReportingData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);

    try {
      const requestBody = {
        fromDate: dateRange[0] ? moment(dateRange[0]).format("DD-MM-YYYY") : null,
        toDate: dateRange[1] ? moment(dateRange[1]).format("DD-MM-YYYY") : null,
      };

      AllBranchDMSReport(requestBody, (error, data) => {
        if (error) {
          console.error("Unexpected error occurred:", error);
          toast.error("Unexpected error occurred");
        } else {
          if (data.length === 0) {
            toast.warn("No data found");
          } else {
            const adjustedData = data.map((item, index) => ({
              key: index,
              sn: item.SN,
              branchName: item.BRANCH_NAME,
              AOF_OPENED_IN_FINACLE: item.AOF_OPENED_IN_FINACLE,
              AOF_OPENED_IN_DMS: item.AOF_OPENED_IN_SYSTEM,
              AOF_NOT_IN_DMS: item.AOF_NOT_IN_DMS, // Adding the new field
            }));

            setReportingData(adjustedData);
          }
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Unexpected error occurred:", error);
      toast.error("Unexpected error occurred");
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
  };

  const handleFilter = () => {
    fetchReportData();
  };

  const columns = [
    {
      title: "S.N",
      dataIndex: "sn", // This should match the key in adjustedData
      key: "sn",
    },
    {
      title: "Branch Name",
      dataIndex: "branchName", // This should match the key in adjustedData
      key: "branchName",
    },
    {
      title: "AOF Opened in Finacle",
      dataIndex: "AOF_OPENED_IN_FINACLE",
      key: "AOF_OPENED_IN_FINACLE",
    },
    {
      title: "AOF Opened in DMS",
      dataIndex: "AOF_OPENED_IN_DMS",
      key: "AOF_OPENED_IN_DMS",
    },
  ];

  const paginationSettings = {
    defaultPageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "30"],
  };

  // Function to prepare CSV data for export
  const getCsvData = () => {
    // Prepare CSV data from reportingData
    const csvData = reportingData.map((item) => ({
      "S.N": item.sn,
      "Branch Name": item.branchName,
      "AOF Opened in Finacle": item.AOF_OPENED_IN_FINACLE,
      "AOF Opened in DMS": item.AOF_OPENED_IN_DMS,
      "AOF Not in DMS": item.AOF_NOT_IN_DMS,
    }));

    return csvData;
  };

  return (
    <div>
      <h3 style={{ marginBottom: "10px" }}>All Branch DMS / Finnacle Report</h3>
      <p style={{ color: "red" }}>Please select a date range.</p>
      <RangePicker style={{ marginRight: 10, marginBottom: 20 }} onChange={handleDateRangeChange} />
      <Button type="primary" onClick={handleFilter}>
        Filter
      </Button>

      <CSVLink data={getCsvData()} filename={"report.csv"}>
        <Button type="primary" style={{ marginLeft: 10 }}>
          Export to Excel
        </Button>
      </CSVLink>

      {loading ? (
        <Spin
          size="large"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "2rem",
          }}
        />
      ) : (
        <Table dataSource={reportingData} columns={columns} pagination={paginationSettings} rowKey="key" />
      )}
    </div>
  );
};

export default BranchDMSReport;
