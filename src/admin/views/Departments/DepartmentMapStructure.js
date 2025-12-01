import React from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import A from "config/url";
import metaRoutes from "config/meta_routes";

export default class DepartmentMapStructure extends React.Component {
  constructor(props) {
    super(props);
    this.getDepartmentChildren = this.getDepartmentChildren.bind(this);
    this.toggleChildren = this.toggleChildren.bind(this);
  }

  state = {
    editButtonShow: false,
  };

  toggleChildren(parentId) {
    const id = "cursor-pointer" + parentId;
    const elements = document.getElementsByClassName(id);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.style.display === "none") {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  }

  getDepartmentChildren(parentId) {
    const departments = this.props.departments;
    let items = [];
    const children = departments.filter((childItem) => {
      if (childItem.parentId === parentId) {
        return 1;
      }
      return 0;
    });

    children &&
      children.forEach((row, index, data) => {
        items.push(
          <div
            key={index}
            className={"cursor-pointer" + row.parentId}
            style={{
              marginLeft: 20,
              cursor: "pointer",
              display: "none",
            }}
          >
            <i className="fa fa-angle-down mr-2" onClick={() => this.toggleChildren(row.id)} />
            <span onClick={() => this.props.onFilter(row.id) & this.toggleChildren(row.id)}>
              <i className="fa fa-folder-o mr-2" />
              {row.name + " "}
              {/**
             [EDIT] toggled when hovering over a child component in the tree leading to the Edit form of the concerned link
             **/}
              <Link
                to={metaRoutes.adminDepartmentsEdit + "?i=" + A.getHash(row.id)}
                style={{
                  display: this.state.editButtonShow ? "inline" : "none",
                  cursor: this.state.editButtonShow ? "pointer" : "none",
                }}
              >
                [EDIT]
              </Link>
            </span>
            <br />
            {this.getDepartmentChildren(row.id)}
          </div>
        );
      });
    return items;
  }

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <p className="h5">
              <i className="fas fa-building mr-1" />
              Department List
            </p>
            {/* <Col
              style={{ cursor: "pointer" }}
              onClick={() => this.props.onFilter(null)}
            ></Col> */}
            <span
              style={{ cursor: "pointer" }}
              onClick={() => this.props.onFilter(null)}
              className="btn-header btn btn-outline-dark btn-sm border-dark border"
            >
              <i className="fa fa-refresh" />
            </span>
          </Row>
        </CardHeader>
        <CardBody>
          {this.props.departments.map((row, index) => {
            let lowestLevel = this.props.departments[0]?.level;
            this.props.departments.forEach((d) => {
              if (lowestLevel >= d.level) {
                lowestLevel = d.level;
              }
            });

            if (row.level === lowestLevel) {
              return (
                <div
                  key={index}
                  id="cursor-pointer"
                  className="cursor-pointer"
                  style={{ marginLeft: row.level * 20, cursor: "pointer" }}
                  onMouseOver={() => this.setState({ editButtonShow: true })}
                  onMouseOut={() => this.setState({ editButtonShow: false })}
                >
                  <i className="fa fa-caret-down mr-2" onClick={() => this.toggleChildren(row.id)} />
                  <span onClick={() => this.props.onFilter(row.id) & this.toggleChildren(row.id)}>
                    <i className="fa fa-folder-o mr-2" />
                    {row.name + " "}
                    {/**
             [EDIT] toggled when hovering over a parent component in the tree leading to the Edit form of the concerned link
             **/}
                    <Link
                      to={metaRoutes.adminDepartmentsEdit + "?i=" + A.getHash(row.id)}
                      style={{
                        display: this.state.editButtonShow ? "inline" : "none",
                        cursor: this.state.editButtonShow ? "pointer" : "none",
                      }}
                    >
                      [EDIT]
                    </Link>
                  </span>
                  <br />
                  {this.getDepartmentChildren(row.id)}
                </div>
              );
            } else {
              return null;
            }
          })}
        </CardBody>
      </Card>
    );
  }
}
