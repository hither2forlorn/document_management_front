import React from "react";
import Util from "./Util";
import { addBranch } from "./api";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";
import titleCase from "../../../utils/textCapital";
import { Card, CardHeader, CardBody, CardFooter, Row, Col, Label, Input, Form, FormGroup } from "reactstrap";
import Select from "react-select";
import { banks, excludeThisVendor, onlyForThisVendor } from "config/bank";
import { connect } from "react-redux";
import InfoModal from "admin/components/infoModal";
class AddBranch extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    capitalName: "",
    isDisabled: false,
    districts: [],
    value: "",
  };
  handleNumChange = (event) => {
    const limit = 3;
    this.setState({ value: event.target.value.slice(0, limit) });

    if (event.target.value.length >= 4) {
      toast.error("Branch Code can only be 3 digits");
    }
  };
  handleSubmit = (event) => {
    event.preventDefault();
    const formData = Util.getFormData(event);
    this.parseBranchLogo((logo) => {
      if (logo) {
        formData.branchLogo = logo;
      }
      addBranch(formData, (err, data) => {
        if (err) return;
        if (data.success) {
          toast.success(data.message);
          this.props.history.push(metaRoutes.adminBranches);
          this.setState({ isDisabled: true });
        }
      });
    });
  };
  parseBranchLogo(callback) {
    var filesSelected = document.getElementById("branchLogo").files;
    if (filesSelected.length > 0) {
      var fileToLoad = filesSelected[0];
      var fileReader = new FileReader();
      fileReader.onload = function (fileLoadedEvent) {
        var srcData = fileLoadedEvent.target.result;
        callback(srcData);
      };
      fileReader.readAsDataURL(fileToLoad);
    } else {
      callback("NULL");
    }
  }

  // for required fields
  mandatory = (
    <span className="text-danger h6 ml-1">
      <b>*</b>
    </span>
  );
  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col sm={11}>
              <p className="h5 ">Add Branch</p>
            </Col>
            {/* <Col
              style={{ cursor: "pointer" }}
              onClick={() => this.props.onFilter(null)}
            ></Col> */}
            <Col sm={1} className="d-flex justify-content-end">
              <InfoModal type="branch" ModalTitle="Branch Field Information"></InfoModal>
            </Col>
          </Row>
        </CardHeader>
        <Form onSubmit={this.handleSubmit}>
          <CardBody>
            <Row>
              <Col md={3}>
                <FormGroup>
                  <Label>Name:{this.mandatory}</Label>
                  <Input
                    required
                    name="name"
                    className="rounded"
                    id="name"
                    value={this.state.capitalName}
                    onChange={(e) => this.setState({ capitalName: titleCase(e.target.value) })}
                  />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Address: {this.mandatory}</Label>
                  <Input required className="rounded" name="street" id="street" />
                </FormGroup>
              </Col>

              <Col md={3}>
                <FormGroup>
                  <Label>District:</Label>
                  <Select
                    required
                    name="city"
                    options={this.props.districts.map((list) => ({
                      value: list.id,
                      label: list.name,
                    }))}
                  />
                </FormGroup>
              </Col>

              <Col md={3}>
                <FormGroup>
                  <Label>Branch Code: {this.mandatory}</Label>
                  <Input
                    required
                    className="rounded"
                    name="branchCode"
                    type="number"
                    id="branchCode"
                    value={onlyForThisVendor(banks.citizen.name) ? this.state.value : null}
                    onChange={onlyForThisVendor(banks.citizen.name) ? this.handleNumChange : null}
                  />
                </FormGroup>
              </Col>

              {excludeThisVendor([banks.rbb.name, banks.citizen.name]) && (
                <Col md={3}>
                  <FormGroup>
                    <Label>SOL branch id: {this.mandatory}</Label>
                    <Input type="number" required className="rounded" name="branchNumber" id="branchNumber" />
                  </FormGroup>
                </Col>
              )}
              <Col md={3}>
                <FormGroup>
                  <Label>Province:</Label>
                  <Select
                    required
                    name="province"
                    options={this.props.provinces.map((list) => ({
                      value: list.id,
                      label: list.name,
                    }))}
                  />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Country: </Label>
                  <Input className="rounded" name="country" id="country" value="Nepal" disabled />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Postal Code: </Label>
                  <Input className="rounded" name="postalCode" id="postalCode" />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Contact: </Label>
                  <Input className="rounded" name="phoneNumber" id="phoneNumber" />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Website: </Label>
                  <Input className="rounded" name="website" id="website" />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Branch Logo: </Label>
                  <Input type="file" name="branchLogo" id="branchLogo" />
                </FormGroup>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <CustomCancel onClick={() => window.history.back()} />
            <CustomSubmit isDisabled={this.state.isDisabled} />
          </CardFooter>
        </Form>
      </Card>
    );
  }
}
export default connect((state) => ({ ...state.allFields }))(AddBranch);
