import React from "react";
import Joi from "joi";
import "./Login.css";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";

import { server, SERVER_URL } from "admin/config/server";
import { CURRENT_USER_ID, TOKEN } from "config/values";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import metaRoutes from "config/meta_routes";
import { banks, dms_features, includeThisFeature, onlyForThisVendor } from "config/bank";
import { toast } from "react-toastify";
import ChangePassword from "admin/views/Users/ChangePassword";
import { loadCaptchaEnginge, LoadCanvasTemplate, LoadCanvasTemplateNoReload, validateCaptcha } from "react-simple-captcha";
import { Spin } from "antd";

const logo = "/img/logo.svg";

class Login extends React.Component {
  state = {
    email: "",
    password: "",
    remember: false,
    forgotpassword: false,
    errors: {},
    isVerified: includeThisFeature(dms_features.ReCAPTCHA) ? false : true,
    expiryPassword: false,
    modalOpen: false,
    isCaptchaVerified: false,
    token: {},
    otpModalOpen: false,
    otp: ["", "", "", "", "", ""],
    loading: false,
    timer: 60,
    isTimerActive: true,
  };

  handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value) && value !== "") return;

    const newOtp = [...this.state.otp];
    newOtp[index] = value;
    this.setState({ otp: newOtp });

    // Move cursor to the next or previous input field
    if (value && index < this.state.otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    } else if (!value && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  validateOtp = async () => {
    const { otp } = this.state;
    if (!otp.join("")) {
      return toast.error("Enter OTP from your email");
    }
    const userEmail = localStorage.getItem("email");
    server
      .post("verify-otp", { otp: otp.join(""), email: userEmail })
      .then((res) => {
        const json = res.data;
        if (json.success) {
          this.setState({
            token: { jsonToken: json?.user[0]?.token, userId: json?.user[0]?.id },
          });

          // expired password must change password
          if (json?.user[0]?.isExpirePassword === true) {
            window.alert("Your password is expired. Please change your password");
            this.setState({
              modalOpen: true,
            });
          } else {
            this.props.history.push(metaRoutes.adminDashboard);
            localStorage.removeItem("email");
            localStorage.setItem(TOKEN, json.user[0].token);
            localStorage.setItem(CURRENT_USER_ID, json.user[0].id);
            return window.location.reload();
          }
        }
      })
      .catch((err) => {
        console.log(err);
        return toast.error(err.response?.data?.message);
      });
  };

 resendOtp = async () => {
  const userEmail = localStorage.getItem("email");
   this.setState({ otp: Array(this.state.otp.length).fill(''), loading: true });

  server
    .post("/resend-otp", { email: userEmail })
    .then((res) => {
      this.setState({ loading: false });
      if (res.data.success) {
        toast.success("OTP sent successfully");
      } else {
        toast.error(res.data.message || "Failed to resend OTP");
      }
    })
    .catch((error) => {
      this.setState({ loading: false });

      if (error.response) {
        // Server responded with a status code outside 2xx
        if (error.response.status === 429) {
          toast.error(error.response.data.message || "Too many resend-otp attempts. Please try again after 1 hour.");
        } else {
          toast.error(error.response.data.message || "An error occurred.");
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from server. Please try again.");
      } else {
        // Something else happened
        toast.error("Error: " + error.message);
      }

      console.error(error);
    });
};



  schema = Joi.object().keys({
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().min(8).label("Password"),
  });

  componentDidMount() {
    loadCaptchaEnginge(6);
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if the OTP modal has just been opened
    if (this.state.otpModalOpen && prevState.otpModalOpen !== this.state.otpModalOpen) {
      this.startTimer();
    }
  }

  doSubmit = (e) => {
    e.preventDefault();
    let user_captcha = document.getElementById("user_captcha_input").value;

    if (validateCaptcha(user_captcha) === true) {
      this.setState({
        isVerified: true,
        isCaptchaVerified: true,
      });
      loadCaptchaEnginge(6);
      document.getElementById("user_captcha_input").value = "";
    } else {
      alert("Captcha Does Not Match");
      this.setState({
        isVerified: false,
        isCaptchaVerified: false,
      });
      document.getElementById("user_captcha_input").value = "";
    }
  };

  validate = () => {
    const data = { email: this.state.email, password: this.state.password };
    const { error } = this.schema.validate(data);
    if (!error) return null;
    return {
      [error.details[0].context.key]: error.details[0].message,
    };
  };

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = ({ target: input }) => {
    const state = {};
    switch (input.type) {
      case "checkbox":
        state[input.name] = input.checked;
        break;
      default:
        state[input.name] = input.value;
        break;
    }
    this.setState({
      ...state,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const error = this.validate();
    this.setState({ errors: error || {} });
    if (error) return;
    if (this.state.forgotpassword) {
      this.forgotpassword();
    } else {
      this.signin();
    }
  };

  forgotpassword = () => {
    const body = JSON.stringify({ email: this.state.email });
    fetch(SERVER_URL + "/forgotpassword", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: body,
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log(json);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  signin = () => {
    const body = {
      email: this.state.email,
      password: this.state.password,
      remember: this.state.remember,
    };

    // for recaptcha verification
    if (this.state.isVerified) {
      this.setState({ loading: true });
      server
        .post("/signin", body)
        .then((res) => {
          const json = res.data;
          localStorage.setItem("email", body.email);
          if (json.success) {
            this.setState({ otpModalOpen: true, loading: false });
          } else {
            this.setState({ loading: false });
            toast.error(json.message);
          }
        })
        .catch((err) => {
          this.setState({ loading: false });
          if (err?.response?.data?.message) {
            toast.error(err?.response?.data?.message);
          } else toast.error("Internal server error");
        });
    } else {
      window.alert("Please use the reCaptcha!");
    }
  };
  //handling the google-reCaptcha v2
  handleCaptcha = () => {
    if (this.state.isVerified) {
      return;
    } else {
      this.setState({ isVerified: true });
    }
  };

  hanldeLoginToDashboard = () => {
    this.props.history.push(metaRoutes.adminDashboard);

    localStorage.setItem(TOKEN, this.state.token.jsonToken);
    localStorage.setItem(CURRENT_USER_ID, this.state.token.userId);
    return window.location.reload();
  };

  startTimer = () => {
    this.setState({ timer: 60, isTimerActive: true }, () => {
      if (this.state.isTimerActive) {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
          this.setState((prevState) => {
            if (prevState.timer > 0) {
              return { timer: prevState.timer - 1 };
            } else {
              clearInterval(this.timerInterval);
              return { isTimerActive: false };
            }
          });
        }, 1000);
      }
    });
  };


  render() {
    const { errors, email, password } = this.state;

    if (this.state.expiryPassword == true && this.props.auth.isAuthenticated) {
      return <Redirect to={metaRoutes.adminDashboard} />;
    }
    return (
      <>
        {this.state.loading ? (
          <div
            className="component-content-container"
            style={{
              textAlign: "center",
              height: "450px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <div className="app flex-row align-items-center">
            <Container>
              <Row className="justify-content-center">
                <Col md="8">
                  <CardGroup className="shadow-lg">
                    <Card className="p-4">
                      <CardBody>
                        {!this.state.forgotpassword ? (
                          <Form id="signin-form" onSubmit={this.handleSubmit}>
                            <h1>Log In</h1>
                            <p className="text-muted">Sign In to your account</p>
                            <InputGroup className="mb-3">
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="fas fa-user"></i>
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                type="email"
                                value={this.state.email}
                                onChange={this.handleChange}
                                placeholder="Username"
                                name="email"
                              />
                            </InputGroup>
                            <InputGroup className="mb-4">
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="fas fa-key"></i>
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                type="password"
                                onChange={this.handleChange}
                                value={this.state.password}
                                placeholder="Password"
                                name="password"
                              />
                            </InputGroup>
                            {errors.password || errors.email ? (
                              <div className="w-100">
                                <div className="ml-auto text-center font-weight-bold alert alert-danger">
                                  {errors.password || errors.email}
                                </div>
                              </div>
                            ) : (
                              ""
                            )}

                            <Row>
                              <Col xs="8">
                                <div style={{ display: includeThisFeature(dms_features.ReCAPTCHA) ? "block" : "none" }}>
                                  <LoadCanvasTemplate />
                                  <div className="d-flex align-items-center">

                                    <input
                                      placeholder="Enter Captcha Value"
                                      id="user_captcha_input"
                                      name="user_captcha_input"
                                      type="text"
                                      style={{
                                        border: "1px solid #edf0ee",
                                        padding: "10px",
                                        outline: "none",
                                        borderRadius: "5px",
                                        height: "30px",
                                      }}
                                    />

                                    <div className="mt-3">
                                      <div>
                                        <span
                                          className="btn btn-secondary"
                                          onClick={(e) => this.doSubmit(e)}
                                          style={{
                                            border: "1px solid #edf0ee",
                                            padding: "5px 10px",
                                            borderRadius: "5px",
                                            fontWeight: "bold",
                                            background: "lightblue",
                                            color: "darkblue",
                                            cursor: "pointer",
                                            marginBottom: "18px",
                                            fontStyle: " normal",
                                            fontSize: "14px",
                                          }}
                                        >
                                          {this.state.isCaptchaVerified ? (
                                            <i className="fa  fa-check bg-success" />
                                          ) : (
                                            <i className="fa  fa-check" />
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-success text-sm ">
                                    {this.state.isCaptchaVerified ? "Captcha Verified" : null}
                                  </span>
                                </div>

                                <Button
                                  color="primary"
                                  type="submit"
                                  disabled={
                                    (includeThisFeature(dms_features.ReCAPTCHA) && !this.state.isVerified) ||
                                    !email ||
                                    !password
                                  }
                                  className="px-4 mt-4"
                                >
                                  Login
                                </Button>
                              </Col>
                            </Row>
                          </Form>
                        ) : (
                          <Form id="forgotpassword-form" onSubmit={this.handleSubmit}>
                            <h1>Log In</h1>
                            <p className="text-muted">Sign In to your account</p>
                            <InputGroup className="mb-3">
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="icon-user"></i>
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                type="email"
                                value={this.state.email}
                                onChange={this.handleChange}
                                placeholder="Username"
                                name="email"
                              />
                            </InputGroup>
                            <InputGroup className="mb-4">
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <i className="icon-lock"></i>
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                type="password"
                                onChange={this.handleChange}
                                value={this.state.password}
                                placeholder="Password"
                                name="password"
                              />
                            </InputGroup>
                            {errors.password || errors.email ? (
                              <div className="w-100">
                                <div className="ml-auto text-center font-weight-bold alert alert-danger">
                                  {errors.password || errors.email}
                                </div>
                              </div>
                            ) : (
                              ""
                            )}

                            <Row>
                              <Col xs="6">
                                <Button color="primary" type="submit" disabled={!email || !password} className="px-4 ">
                                  Login
                                </Button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                      </CardBody>
                    </Card>
                    <Card
                      className="text-white py-5 d-md-down-none"
                      style={{
                        width: "44%",
                        // backgroundColor: "#c1cbff",
                        background: "#c1cbff",
                        background: "-moz-radial-gradient(center, ellipse cover,  #c1cbff 0%, #6bb4e5 100%)",
                        background: "-webkit-radial-gradient(center, ellipse cover,  #c1cbff 0%,#6bb4e5 100%)",
                        background: "radial-gradient(ellipse at center,  #c1cbff 0%,#6bb4e5 100%)",
                        filter:
                          "progid:DXImageTransform.Microsoft.gradient( startColorstr='#c1cbff', endColorstr='#6bb4e5',GradientType=1 )",
                      }}
                    >
                      <CardBody className="text-center d-flex justify-content-center flex-wrap align-items-center">
                        <div className="">
                          {/* <img src={logo} alt="company logo" /> */}
                          <span className="copyright-text text-dark mt-2 d-block">2021 © General Doc System</span>
                        </div>
                      </CardBody>
                    </Card>
                  </CardGroup>
                </Col>
              </Row>
            </Container>
          </div>
        )}

        <Modal isOpen={this.state.modalOpen}>
          <ModalHeader>Please reset your password.</ModalHeader>
          <ModalBody>
            <ChangePassword token={this.state.token} hanldeLoginToDashboard={this.hanldeLoginToDashboard} />
          </ModalBody>
        </Modal>

        <Modal isOpen={this.state.otpModalOpen} style={{ maxWidth: "600px", margin: "auto" }}>
          <div className="flex">
            <button
              className="close px-4 py-2"
              onClick={() => this.setState({ otpModalOpen: false })}
              style={{
                fontSize: "28px",
                color: "#000",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
          </div>
          <div className="d-flex justify-content-center align-items-center bg-light">
            <div className="bg-white p-4 rounded shadow-lg w-100">
              <h5 className="text-center fw-bold mb-3">Enter OTP</h5>
              <p className="text-center text-muted">
                We have sent a 6-digit OTP to your email.
              </p>

              <form onSubmit={this.validateOtp}>
                <div className="d-flex justify-content-center gap-4 mb-3">
                  {this.state.otp.map((_, index) => (
                    <input
                      id={`otp-input-${index}`}
                      key={index}
                      value={this.state.otp[index]}
                      onChange={(e) => this.handleOtpChange(e, index)}
                      maxLength={1}
                      className="form-control text-center fs-5 ml-4"
                      style={{ width: "45px", height: "45px" }}
                    />
                  ))}
                </div>
                <div className="w-100 d-flex justify-content-center mt-4">
                  <Button
                    onClick={this.validateOtp}
                    className="btn btn-primary text-white"
                  >
                    Verify OTP
                  </Button>
                </div>
                {/* Resend OTP Button */}
                {!this.state.isTimerActive && (

                  <div className="w-100 d-flex justify-content-center">
                    <Button
                      onClick={this.resendOtp}
                      className="bg-white text-primary mt-2"
                      style={{ border: "1px solid #367FA9" }}
                    >
                      Send OTP Again
                    </Button>
                  </div>
                )}

                {/* Timer */}
                {this.state.isTimerActive && (
                  <div className="text-center mt-4 text-muted" style={{ fontSize: "16px" }}>
                    <span>Resend OTP in</span>
                    <div className="mt-4" style={{ fontSize: "22px" }}>
                      <span style={{ color: "white", borderRadius: "100%", background: "#367FA9", padding: "20px" }}>
                        {this.state.timer}
                      </span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </Modal >
      </>
    );
  }
}

export default connect((state) => ({
  auth: state.auth,
}))(Login);
