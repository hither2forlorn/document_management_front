// import A from "./Util";
import { server } from "admin/config/server";
const url = "/DMS-branch-report";

function getDMSBranchReport(body, callback) {
  server
    .post(`${url}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}
function AllBranchDMSReport(body, callback) {
  server
    .post(`/all-branch-data`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

export { getDMSBranchReport, AllBranchDMSReport };
