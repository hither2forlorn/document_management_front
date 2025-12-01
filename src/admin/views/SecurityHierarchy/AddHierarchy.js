import React from "react";
import { addSecurityHierarchy, getFilterBranch } from "./api";
import { getFormData } from "config/form";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";
import { Card, CardBody, CardHeader, Row, Col, CardFooter, Label, Input, FormGroup, Form } from "reactstrap";
import Select from "react-select";
let switchFind;
class AddHierarchy extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      branches: [],
      hierarchy: [],
      branchSelect: [],
      branchSelectedOptions: [],
      filterBranch: [],
      provinceUnit: "",
      hierarchyName: "",
      departmentAndNameToggle: false,
      departments: [],
      departmentValue: "",
      departmentName: "",
      findUnitOrDept: "",
    };
  }

  componentDidMount() {
    // const securityHierarchy = this.props.allFields.map();
    this.setState(this.props.allFields, () => {
      const select = [];
      // this.state.branches.forEach((item) => {
      //   const value = { value: item.id, label: item.name };
      //   select.push(value);
      // });
      this.setState({
        filterBranch: getFilterBranch((err, data) => {
          if (!err) {
            data.forEach((item) => {
              const value = { value: item.id, label: item.name };
              select.push(value);
            });
          }
        }),
      });
      this.setState({
        branchSelect: select,
      });
    });
  }

  MultiSelectChange = (value, { action, removedValue }) => {
    switch (action) {
      case "remove-value":
        break;
      case "pop-value":
        if (removedValue && removedValue.isFixed) {
          return;
        }
        break;
      case "clear":
        value = this.state.branchSelect.filter((v) => v.isFixed);
        break;
      default:
        break;
    }
    this.setState({ branchSelectedOptions: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    let formData = getFormData(event);

    // for filtering hirarchy
    const parent = this.state.hierarchy.find((item) => item.id == formData.parentId);

    // for parent selection +1 for making hierarchy below parent hierarchy
    if (parent) {
      formData.level = parent.level + 1;
    } else {
      formData.level = 0;
    }
    // for department insert
    if (this.state.departmentValue) {
      if (this.state.findUnitOrDept == "Unit_") {
        formData.name = `Unit${this.state.hierarchyName ? "_" + this.state.hierarchyName.replace(/ /g, "") : ""}${
          this.state.departmentName ? "_" + this.state.departmentName : ""
        }`;
        formData.type = "unit";
      } else {
        formData.type = "department";
        formData.name = "Dept_" + this.state.departmentName;
      }
    }

    //for branch insent
    if (this.state.branchSelectedOptions && this.state.branchSelectedOptions.length > 0) {
      formData = {
        branchData: this.state.branchSelectedOptions,
        level: formData.level,
        parentId: formData.parentId,
        type: "branch",
      };
    }
    addSecurityHierarchy(formData, (err, data) => {
      if (err || !data.success) {
        toast.error(data?.message || "Error");
      } else {
        toast.success(data?.message || "Successful");
        this.props.history.push(metaRoutes.adminSecurityHierarchy);
        this.props.dispatch(loadAllFields());
      }
    });
  };

  handleProvinceunitChange = (e) => {
    this.setState({
      provinceUnit: e.target.value,
      departmentAndNameToggle: false,
      hierarchyName: "",
      departmentValue: "",
      departmentName: "",
    });

    let value;
    if (e.target.value == "Dept_") {
      value = "Dept_";
    } else {
      value = "Unit_";
    }

    this.setState({
      departmentAndNameToggle: true,
      findUnitOrDept: value,
    });

    // checked Department then departmentAndNameToggle is true
    if (e.target.value == "Dept_" || e.target.value == "Unit_") {
      this.setState({
        departmentAndNameToggle: true,
      });
    }
  };

  handleNameChange = (e) => {
    this.setState({
      hierarchyName: e.target.value,
    });
  };

  handleChangeUnitDepartment = (e) => {
    this.setState({
      departmentValue: e.target.value,
      departmentName: e.target.value,
    });
  };

  handleDepartmentChange = (e) => {
    const department = this.state.departments.find((dept) => dept.id == e.target.value);
    console.log(e.target, department);
    this.setState({
      departmentValue: e.target.value,
      departmentName: department.name,
    });
  };

  renderItems() {
    const isUnit = this.state.findUnitOrDept == "Unit_";
    let code = `${this.state.provinceUnit}${this.state.departmentValue}${
      this.state.hierarchyName ? "_" + this.state.hierarchyName.replace(/ /g, "") : ""
    } `;

    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              <i className="fas fa-sitemap mr-1" />
              Add Security Hierarchy
            </Col>
          </Row>
        </CardHeader>
        <Form onSubmit={this.handleSubmit}>
          <CardBody>
            <Row>
              <Col>
                <>
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label>
                          Parent Group
                          <span className="text-danger h6 ml-1">
                            <b>*</b>
                          </span>
                        </Label>
                      </Col>
                      <Col md={8}>
                        <Input type="select" name="parentId" id="parentId" required>
                          <option value="">--- NONE ---</option>
                          {this.state.hierarchy.map((row) => {
                            let padding = "";
                            let level = row.level;
                            while (level-- > 0) {
                              padding += "---";
                            }
                            return (
                              <option key={row.id} value={row.id}>
                                {padding + " " + row.name}
                              </option>
                            );
                          })}
                        </Input>
                      </Col>
                    </Row>
                  </FormGroup>
                  {this.state?.provinceUnit == "" && (
                    <FormGroup>
                      <Row>
                        <Col md={4}>
                          <Label>Branch</Label>
                        </Col>
                        <Col md={8}>
                          <Select
                            isMulti
                            onChange={this.MultiSelectChange}
                            value={this.state.branchSelectedOptions}
                            name="branchList"
                            options={this.state.branchSelect}
                            className="basic-multi-select react-select-style"
                            classNamePrefix="select"
                            isDisabled={this.disabled}
                          />
                        </Col>
                      </Row>
                    </FormGroup>
                  )}
                </>
              </Col>
              <Col>
                {!this.state?.branchSelectedOptions?.length > 0 && (
                  <>
                    <FormGroup>
                      <Row>
                        <Col md={4}>
                          <Label>Province/Unit</Label>
                        </Col>
                        <Col md={8}>
                          <Input
                            type="select"
                            name="provinceUnit"
                            required
                            id="provinceUnit"
                            onChange={this.handleProvinceunitChange}
                          >
                            <option value="">--- NONE ---</option>
                            {/* <option value="Province_">Province</option> */}
                            <option value="Unit_">Unit</option>
                            <option value="Dept_">Department</option>
                          </Input>
                        </Col>
                      </Row>
                    </FormGroup>
                    {isUnit && (
                      <div className="alert alert-dark" role="alert">
                        Please select department hierarchy
                      </div>
                    )}
                    {this.state.departmentAndNameToggle ? (
                      <FormGroup>
                        <Row>
                          <Col md={4}>
                            <Label>Departments</Label>
                            <span className="text-danger h6 ml-1">
                              <b>*</b>
                            </span>
                          </Col>
                          <Col md={8}>
                            <Input
                              type="select"
                              required
                              name="department"
                              onChange={isUnit ? this.handleChangeUnitDepartment : this.handleDepartmentChange}
                            >
                              <option value="">--- NONE ---</option>

                              {isUnit
                                ? this.state.hierarchy.map((row) => {
                                    let padding = "";
                                    let level = row.level;
                                    while (level-- > 0) {
                                      padding += "---";
                                    }
                                    return (
                                      <option key={row.id} value={row.id}>
                                        {padding + " " + row.name}
                                      </option>
                                    );
                                  })
                                : this.state.departments.map((row) => {
                                    let padding = "";
                                    let level = row.level;
                                    while (level-- > 0) {
                                      padding += "---";
                                    }
                                    return (
                                      <option key={row.id} value={row.id} name="">
                                        {padding + " " + row.name}
                                      </option>
                                    );
                                  })}
                            </Input>
                          </Col>
                        </Row>
                      </FormGroup>
                    ) : null}
                    {this.state.departmentAndNameToggle ? (
                      <>
                        <FormGroup>
                          <Row>
                            <Col md={4}>
                              <Label>Name</Label>{" "}
                              {isUnit && (
                                <span className="text-danger h6 ml-1">
                                  <b>*</b>
                                </span>
                              )}{" "}
                            </Col>
                            <Col md={8}>
                              <Input required={isUnit} name="name" id="name" onChange={this.handleNameChange} />
                            </Col>
                          </Row>
                        </FormGroup>
                      </>
                    ) : null}
                  </>
                )}

                <FormGroup>
                  <Row>
                    <Col md={4}>
                      <Label>Hierarchy Code</Label>
                    </Col>
                    <Col md={8}>
                      <Input name="code" id="code" value={code == "_" ? "" : code} disabled />
                    </Col>
                  </Row>
                </FormGroup>
              </Col>
            </Row>{" "}
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <CustomCancel onClick={() => window.history.back()} />
            <CustomSubmit />
          </CardFooter>
        </Form>
      </Card>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({ allFields: state.allFields }))(AddHierarchy);
