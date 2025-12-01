import React from "react";
import DepartmentMapStructure from "./DepartmentMapStructure";
import DepartmentList from "./DepartmentList";
import { getDepartments, deleteDepartment } from "./api";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import { Row, Col } from "reactstrap";

class DepartmentDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.onFilter = this.onFilter.bind(this);
  }

  state = {
    departments: [],
    departmentsOnTable: [],
  };

  onFilter(parentId) {
    const filteredData = this.state.departments.filter((item) => {
      if (item.parentId === parentId) {
        return 1;
      }
      return 0;
    });
    this.setState({
      departmentsOnTable: filteredData,
    });
  }

  deleteDepartment = (id) => {
    if (window.confirm("Do you want to delete?")) {
      deleteDepartment(id, (err, data) => {
        if (err) this.history.push(metaRoutes.adminDepartments);
        if (data.success) {
          toast.success("Success!");
          this.updateData();
          this.props.dispatch(loadAllFields());
        } else {
          toast.error(data.message);
        }
      });
    }
  };

  updateData() {
    getDepartments((err, departments) => {
      if (err) return;
      this.setState(
        {
          departments: departments,
        },
        () => {
          this.onFilter(null);
        }
      );
    });
  }

  componentDidMount() {
    this.updateData();
  }

  renderItems() {
    return (
      <Row>
        <Col md={4}>
          <DepartmentMapStructure departments={this.state.departments} onFilter={this.onFilter} {...this.props} />
        </Col>
        <Col md={8} className="pl-3 pl-md-0">
          {" "}
          <DepartmentList
            departmentsOnTable={this.state.departmentsOnTable}
            deleteDepartment={this.deleteDepartment}
            {...this.props}
          />
        </Col>
      </Row>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect()(DepartmentDashboard);
