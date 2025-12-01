import React from "react";
import { addUser } from "./api";
import UserForm from "./UserForm";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import { Card, CardHeader, Col, Row } from "reactstrap";
import { selectedVendor, banks, onlyForThisVendor } from "config/bank";
import { loadAllFields } from "redux/actions/apiAction";

class AddUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roles: [],
      userStatuses: [],
      branches: [],
      departments: [],
      showPassword: false,
      hierarchy: [],
      hierarchies: [],
      security_hierarchy: null,
      userGroup: [],
      unit: false,
      validationErrors: {},
      isDisabled: false,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    switch (name) {
      // for switching department to
      case "hierarchy":
        const branchOrDept = this.props.allFields.hierarchy.find((row) => row.code === value);

        // autocomplete for unit
        if (branchOrDept.type === "unit") {
          const hierarchyId = branchOrDept?.departmentId;
          // find hierarchy departmentID from hierarchies
          const hierarchy = this.props.allFields.hierarchy.find((row) => row.id === hierarchyId);

          this.setState({
            unit: true,
            security_hierarchy: value,
            // departmentId: hierarchy.departmentId || null,
            // branchId: branchOrDept?.branchId || null,
          });
        } else
          this.setState({
            unit: false,
            security_hierarchy: value,
            branchId: branchOrDept?.branchId || null,
            departmentId: branchOrDept?.departmentId || null,
          });
        break;
      case "branchId":
      case "departmentId":
        // is unit then dont change hierarchy

        if (this.state.unit) {
          this.setState({
            [name]: value,
          });
        } else {
          const hierarchy = this.props.allFields.hierarchy.find((row) => row?.[name] == value);
          this.setState({
            [name]: value,
            security_hierarchy: hierarchy?.code,
          });
          break;
        }
    }
  }

  handleReset = () => {
    this.forceUpdate();
  };

  // profile picture
  // parseProfilePicture(callback) {
  //   var filesSelected = document.getElementById("profilePicture").files;
  //   if (filesSelected.length > 0) {
  //     var fileToLoad = filesSelected[0];
  //     var fileReader = new FileReader();
  //     fileReader.onload = function (fileLoadedEvent) {
  //       var srcData = fileLoadedEvent.target.result;
  //       callback(srcData);
  //     };
  //     fileReader.readAsDataURL(fileToLoad);
  //   } else {
  //     callback("NULL");
  //   }
  // }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({
      isDisabled: true,
    });
    const formData = {};
    const form = event.target;
    for (let i = 0; i < form.length; i++) {
      const name = form.elements[i].name;
      const value = form.elements[i].value;

      if (value) {
        formData[name] = value;
      }
    }
    if (!this.validatePasswordConf(formData.password, formData.confirmPassword)) {
      this.setState({
        isDisabled: false,
      });
      return;
    }
    delete formData.confirmPassword;

    // for profile picture
    // if (onlyForThisVendor([banks.rbb.name, banks.citizen.name])) {
    //   this.parseProfilePicture((profilePicture) => {
    //     formData.profilePicture = profilePicture;
    //   });
    // }

    // Generates random password
    if (!formData?.password) {
      let randomPassword = [...Array(10)].map((i) => (~~(Math.random() * 36)).toString(36)).join("");
      formData.password = randomPassword;
    }

    addUser({ ...formData, userType: "admin" }, (err, data) => {
      if (err) {
        this.setState({
          validationErrors: err.response.data.data,
          isDisabled: false,
        });

        toast.error("There are some errors with the data provided.");
        return;
      }
      if (data) {
        this.props.dispatch(loadAllFields());
        toast.success("Successfull!");
        this.props.history.push(metaRoutes.adminUsers);
      }
    });
  };

  validatePasswordConf = (p, pConf) => {
    if (p !== pConf) {
      document.getElementById("confirmPassword").focus();
      toast.warn("Passwords do not match!");
      return false;
    } else {
      return true;
    }
  };

  componentDidMount() {
    this.setState(this.props.allFields);
  }

  handleShowPassword = (e) => {
    const showPassword = this.state.showPassword;
    this.setState({ showPassword: !showPassword });
  };
  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">{this.props.name}</p>
        </CardHeader>
        <UserForm
          validationErrors={this.state.validationErrors ? this.state.validationErrors : null}
          onReset={this.handleReset}
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
          onShowPassword={this.handleShowPassword}
          showPassword={this.state.showPassword}
          {...this.props}
          {...this.state}
        />
      </Card>
    );
  }
}

export default connect((state) => ({ allFields: state.allFields }))(AddUser);
