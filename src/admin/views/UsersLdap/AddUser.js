import React, { Component } from "react";
import { Card, CardBody, CardHeader, CardFooter, Form, Col, Row, FormGroup, Input, Label } from "reactstrap";
import Select from "react-select";
import { getFormData } from "config/form";
import { getLdapUsers, addUser } from "./api";
import { connect } from "react-redux";
import metaRoutes from "config/meta_routes";
import { toast } from "react-toastify";
import CustomSubmit from "admin/components/CustomSubmit";
import CustomCancel from "admin/components/CustomCancel";
import { CustomSelect } from "admin/components";
import ReactSelect from "admin/components/ReactSelect";

class AddUser extends Component {
  state = {
    users: [],
    user: {},
    selectedBranch: null,
    branches: [],
    selectedOption: {},
    selectedOptions: [],
    isDisabled: false,
  };

  handleBranchChange = (selectedBranch) => {
    const branchId = selectedBranch.value;
    if (branchId) {
      this.setState({ selectedBranch });
    }
  };

  handleUserChange = (selectedOption) => {
    // console.log("Selsected", selectedOption);
    // console.log("users", this.props.users);
    // console.log("users", this.props.users);
    // console.log("User", this.state.user);
    const distinguishedName = selectedOption.value;
    if (distinguishedName) {
      this.setState({ selectedOption });
      const user = this.state.users.filter((u) => (u.distinguishedName === distinguishedName ? 1 : 0))[0];
      this.setState({ user: user ? user : {} });
    } else {
      const keys = Object.keys(this.state.user);
      const user = {};
      keys.forEach((k) => (user[k] = ""));
      this.setState({ user: user });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const formData = getFormData(e);

    if (!formData.hierarchy) return toast.warn("Hierarchy must be selected");
    if (!this.state.user.distinguishedName) return toast.warn("User must be selected");

    if (formData.branchId) {
      const user = {
        ...this.state.user,
        ...formData,
      };
      addUser(user, (err, json) => {
        if (err) return;
        if (json) {
          this.props.history.push(metaRoutes.adminLdapUsers);
          this.setState({ isDisabled: true });
        }
      });
    } else {
      window.alert("Please select a branch");
    }
  };

  componentDidMount() {
    this._isMounted = true;
    const branches = this.props.branches.map((d) => {
      return {
        value: d.id,
        label: d.name,
      };
    });
    this.setState({
      branches: branches,
    });
    getLdapUsers((err, users) => {
      if (err) return;
      const selectedOptions = users.map((u) => {
        return {
          value: u.distinguishedName,
          label: u.displayName,
        };
      });
      this.setState({
        users: users,
        selectedOptions: selectedOptions,
      });
    });
  }

  render() {
    const { selectedOptions, branches } = this.state;
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Form onSubmit={this.handleSubmit}>
              <Card className="shadow">
                <CardHeader>
                  <p className="h5">AD Users</p>
                </CardHeader>
                <CardBody>
                  <FormGroup>
                    <Label htmlFor="user">User</Label>
                    <Select
                      value={this.state.selectedOption}
                      onChange={this.handleUserChange}
                      options={selectedOptions ? selectedOptions : []}
                    />
                  </FormGroup>

                  <Row>
                    <Col xs="6">
                      <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          type="text"
                          id="email"
                          placeholder="Email"
                          value={this.state.user.userPrincipalName ? this.state.user.userPrincipalName : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="6">
                      <FormGroup>
                        <Label htmlFor="telephoneNumber">Phone Number</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="telephoneNumber"
                          placeholder="Phone Number"
                          value={this.state.user.telephoneNumber ? this.state.user.telephoneNumber : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="username"
                          placeholder="User Name"
                          value={this.state.user.sAMAccountName ? this.state.user.sAMAccountName : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="Name">Name</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="name"
                          placeholder="Name"
                          value={
                            (this.state.user.givenName ? this.state.user.givenName : "") +
                            " " +
                            (this.state.user.sn ? this.state.user.sn : "")
                          }
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="roleId">Role</Label>
                        <Input className="rounded" type="select" id="roleId" name="roleId" required>
                          <option value="">Select Role for the user</option>
                          {this.props.roles.map((role, index) => (
                            <option key={index} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>

                    <Col xs="4">
                      <ReactSelect
                        required
                        getFieldValue="code"
                        label="Security Hierarchy"
                        name="hierarchy"
                        options={this.props.allFields.hierarchy}
                      />
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="branchId">Branch</Label>
                        <Select
                          className="rounded"
                          id="branchId"
                          name="branchId"
                          value={this.state.selectedBranch ? this.state.selectedBranch : ""}
                          onChange={this.handleBranchChange}
                          options={branches ? branches : []}
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <ReactSelect label="DepartmentId" name="departmentId" options={this.props.departments} />
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="loginAttempts">Login Attempts</Label>
                        <Input className="rounded" type="select" id="loginAttempts" name="loginAttempts" required>
                          <option value={10}>10</option>
                          <option value={5}>5</option>
                          <option value={3}>3</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  {/* <Button  type="submit" size="sm" color="success">
                    Submit
                  </Button> */}
                  <div className="float-right">
                    <CustomCancel onClick={() => window.history.back()} />
                    <CustomSubmit isDisabled={this.state.isDisabled} />
                  </div>
                </CardFooter>
              </Card>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  roles: state.allFields.roles,
  branches: state.allFields.branches,
  departments: state.allFields.departments,
}))(AddUser);
