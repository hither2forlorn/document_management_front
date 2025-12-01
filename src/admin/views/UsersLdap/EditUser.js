import React, { Component } from "react";
import { Card, CardBody, CardHeader, CardFooter, Form, Button, Col, Row, FormGroup, Input, Label } from "reactstrap";
import { editUser, getUser } from "./api";
import A from "config/url";
import query from "querystring";
import Select from "react-select";
import metaRoutes from "config/meta_routes";
import { connect } from "react-redux";

import { toast } from "react-toastify";
import ReactSelect from "admin/components/ReactSelect";
class EditUser extends Component {
  state = {
    user: {},
    roles: [],
    selectedBranch: null,
    hierarchy: null,
    branches: [],
    departments: [],
  };

  handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const user = this.state.user;
    user[name] = value;
    this.setState({ user: user });
  };

  handleBranchChange = (selectedBranch) => {
    const branchId = selectedBranch.value;
    if (branchId) {
      this.setState({ selectedBranch });
    }
  };

  handleHierarchyChange = (selectedBranch) => {
    this.setState({ hierarchy: selectedBranch?.value || null });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      ...this.state.user,
      branchId: this.state.selectedBranch.value,
      hierarchy: this.state.hierarchy,
    };
    if (user.branchId) {
      editUser(user, (err, json) => {
        if (err) return;
        if (json) {
          this.props.history.push(metaRoutes.adminLdapUsers);

          toast.success("Successfully edited user details");
        }
      });
    } else {
      window.alert("Please select a branch");
    }
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    if (!Number(id)) {
      this.props.history.push(metaRoutes.adminLdapUsers);
      return;
    }
    const branches = this.props.branches.map((d) => {
      return {
        value: d.id,
        label: d.name,
      };
    });
    this.setState({
      branches: branches,
    });
    getUser(id, (err, user) => {
      if (err) return;
      const selectedBranch = branches.filter((b) => (b.value === user.branchId ? 1 : 0))[0];
      this.setState({ user: user, selectedBranch: selectedBranch });
    });
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Form onSubmit={this.handleSubmit} onChange={this.handleChange}>
              <Card className="shadow">
                <CardHeader>
                  <p className="h5">AD Users</p>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="isActive">
                          <strong>Status</strong>
                        </Label>
                        <Input
                          className="rounded"
                          type="select"
                          id="isActive"
                          name="isActive"
                          onChange={this.handleChange}
                          placeholder="Active"
                          value={this.state.user.isActive ? this.state.user.isActive : false}
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="email"
                          name="email"
                          placeholder="Email"
                          value={this.state.user.email ? this.state.user.email : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="phoneNumber"
                          name="phoneNumber"
                          placeholder="Phone Number"
                          value={this.state.user.phoneNumber ? this.state.user.phoneNumber : ""}
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
                          name="username"
                          placeholder="User Name"
                          value={this.state.user.username ? this.state.user.username : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Name"
                          value={this.state.user.name ? this.state.user.name : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="roleId">Role</Label>
                        <Input
                          className="rounded"
                          type="select"
                          id="roleId"
                          name="roleId"
                          required
                          value={this.state.user.roleId}
                        >
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
                        onChange={this.handleHierarchyChange}
                        // value={this.state.user.hierarchy}
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
                          options={this.state.branches ? this.state.branches : []}
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="departmentId">Department</Label>
                        <Input
                          className="rounded"
                          type="select"
                          id="departmentId"
                          name="departmentId"
                          value={this.state.user.departmentId}
                        >
                          <option value="">Select Department</option>
                          {this.props.departments.map((department, index) => {
                            let padding = "- ";
                            let level = department.level;
                            while (level-- > 0) {
                              padding += "--> ";
                            }
                            return (
                              <option key={index} value={department.id}>
                                {padding + department.name}
                              </option>
                            );
                          })}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="loginAttempts">Login Attempts</Label>
                        <Input
                          className="rounded"
                          type="select"
                          id="loginAttempts"
                          name="loginAttempts"
                          required
                          value={this.state.user.loginAttempts}
                        >
                          <option value={3}>3</option>
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter className="d-flex justify-content-end">
                  <Button onClick={() => window.history.back()} type="button" color="danger" className="mx-2 text-white">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary">
                    Update
                  </Button>
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
  users: state.allFields.users,
  roles: state.allFields.roles,
  branches: state.allFields.branches,
  departments: state.allFields.departments,
  allFields: state.allFields,
}))(EditUser);
