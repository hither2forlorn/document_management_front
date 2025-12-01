import React from "react";
import { editDepartment, getDepartment } from "./api";
import A from "config/url";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import { Card, CardBody, CardHeader, Row, Col, CardFooter, Label, Input, FormGroup, Form } from "reactstrap";
import titleCase from "utils/textCapital";

class EditDepartment extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    department: {},
    departments: [],
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    if (!id) {
      window.location.replace(metaRoutes.adminDepartments);
      return;
    }
    getDepartment(id, (err, data) => {
      if (err) return;
      if (data.success && data.data) {
        this.setState({
          department: data.data,
        });
      }
    });
    this.setState({
      ...this.props.allFields,
    });
  }

  handleChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    const department = this.state.department;
    if (name == "name") {
      value = titleCase(value);
    }
    if (name === "parentId") {
      const parent = this.state.departments.filter((item) => {
        if (item.id === Number(value)) {
          return 1;
        }
        return 0;
      })[0];
      if (parent) {
        if (parent.id === this.state.department.id) {
          toast.warn("Cannot select itself as parent!");
          return;
        }
        department.parentId = parent.id;
        department.level = parent.level + 1;
      } else {
        department.parentId = null;
        department.level = 0;
      }
    } else {
      value = titleCase(value);
    }
    this.setState({
      department: { ...this.state.department, [name]: value },
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    editDepartment(this.state.department, (err, data) => {
      if (err) {
        toast.error("Error!");
      }
      toast.success(data.message);
      this.props.history.push(metaRoutes.adminDepartments);
      this.props.dispatch(loadAllFields());
    });
  };

  renderItems() {
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              {" "}
              <i className="fas fa-sitemap mr-1" />
              Edit Department
            </Col>
          </Row>
        </CardHeader>
        <Form onSubmit={this.handleSubmit}>
          <CardBody>
            <FormGroup className="d-flex">
              <Col md={4}>
                <Label>Name</Label>
              </Col>
              <Col md={8}>
                <Input
                  onChange={this.handleChange}
                  value={this.state.department.name ? this.state.department.name : ""}
                  required
                  name="name"
                  id="name"
                />
              </Col>
            </FormGroup>
            <FormGroup className="d-flex">
              <Col md={4}>
                <Label>Parent Category</Label>
              </Col>
              <Col md={8}>
                {" "}
                <Input
                  type="select"
                  onChange={this.handleChange}
                  name="parentId"
                  id="parentId"
                  value={this.state.department.parentId ? this.state.department.parentId : ""}
                >
                  <option value="">--- NONE ---</option>
                  {this.state.departments.map((row) => {
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
            </FormGroup>
            <FormGroup className="d-flex">
              <Col md={4}>
                <Label>Color</Label>
              </Col>
              <Col md={8}>
                <Label>
                  <div
                    style={{
                      alignItems: "center",
                      display: "inline-block",
                      borderRadius: "50%",
                      border: "1px solid",
                      width: 50,
                      height: 50,
                      background: this.state.department.colorCode ? this.state.department.colorCode : "",
                    }}
                  />
                  <Input
                    onChange={this.handleChange}
                    style={{ display: "none" }}
                    type="color"
                    name="colorCode"
                    id="colorCode"
                    value={this.state.department.colorCode ? this.state.department.colorCode : ""}
                  />
                </Label>
              </Col>
            </FormGroup>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <Button onClick={() => window.history.back()} type="button" color="danger" className="mx-2 text-white">
              Cancel
            </Button>
            <Button color="primary">Update</Button>
          </CardFooter>
        </Form>
      </Card>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({ allFields: state.allFields }))(EditDepartment);
