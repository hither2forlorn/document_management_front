import React from "react";
import { addDepartment } from "./api";
import { getFormData } from "config/form";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";
import { Card, CardBody, CardHeader, Row, Col, CardFooter, Label, Input, FormGroup, Form } from "reactstrap";
import CustomLoading from "admin/components/CustomLoading";
import titleCase from "utils/textCapital";

class AddDepartment extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    departments: [],
    color: "#ffffff",
    isDisabled: false,
    capitalName: "",
  };

  componentDidMount() {
    this.setState({
      ...this.props.allFields,
    });
  }

  handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "colorCode") {
      this.setState({
        color: value,
      });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const formData = getFormData(event);
    const parent = this.state.departments.filter((item) => {
      if (item.id === Number(formData.parentId)) {
        return 1;
      }
      return 0;
    })[0];
    if (parent) {
      formData.level = parent.level + 1;
    } else {
      formData.level = 0;
    }
    addDepartment(formData, (err, data) => {
      if (err) {
        console.log(err.data, data);
        toast.error(err.response.data.message);
      } else {
        toast.success(data.message);
        this.props.history.push(metaRoutes.adminDepartments);
        this.props.dispatch(loadAllFields());
        this.setState({ isDisabled: true });
      }
    });
  };

  renderItems() {
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              {" "}
              <i className="fa fa-cogs mr-1" />
              Add Department
            </Col>
          </Row>
        </CardHeader>
        <Form onSubmit={this.handleSubmit} onChange={this.handleChange}>
          <CardBody>
            <FormGroup>
              <Row>
                <Col md={4}>
                  {" "}
                  <Label>Name</Label>
                </Col>
                <Col md={8}>
                  <Input
                    required
                    name="name"
                    id="name"
                    value={this.state.capitalName}
                    onChange={(e) => this.setState({ capitalName: titleCase(e.target.value) })}
                  />
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Parent Category</Label>
                </Col>
                <Col md={8}>
                  <Input type="select" name="parentId" id="parentId">
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
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col md={4}>
                  {" "}
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
                        background: this.state.color,
                      }}
                    />
                    <Input
                      style={{ display: "none" }}
                      type="color"
                      name="colorCode"
                      value={this.state.color}
                      id="colorCode"
                    />
                  </Label>
                </Col>
              </Row>
            </FormGroup>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            {" "}
            {/* <button className="btn btn-sm btn-success" type="submit">
                Submit
              </button> */}
            <CustomCancel onClick={() => window.history.back()} />
            <CustomSubmit isDisabled={this.state.isDisabled} />
          </CardFooter>
        </Form>
      </Card>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({ allFields: state.allFields }))(AddDepartment);
