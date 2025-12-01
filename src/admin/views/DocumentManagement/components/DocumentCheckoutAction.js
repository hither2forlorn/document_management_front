import React, { useState } from "react";
import { Card, CardHeader, CardBody, Input, Form, Button } from "reactstrap";
import { connect } from "react-redux";
import { getOptions } from "config/util";
import { checkoutDocument } from "../api";
import { toast } from "react-toastify";

const DocumentInOut = (props) => {
  const document = props.document || {};
  const documentId = document.id;
  const [userId, setUserId] = useState("");
  const [description, setDescription] = useState("");
  const onSubmit = (e) => {
    e.preventDefault();
    const data = {
      documentId,
      userId,
      description,
    };
    // console.log(data);
    checkoutDocument(data, (err, data) => {
      // console.log(data);
      if (err) {
        toast.error("Error occurred!");
      } else {
        if (data.success) {
          // console.log(data.message);
          toast.success(data.message);
        } else {
          // console.log(data.message);
          toast.warn(data.message);
        }
      }
    });
  };
  return (
    <Card>
      <CardHeader>Document Checkout</CardHeader>
      <CardBody>
        <Form onSubmit={onSubmit}>
          <Input
            className="my-2"
            required
            value={userId}
            onChange={({ target: { value } }) => setUserId(value)}
            type="select"
          >
            <option value="">---- NONE ----</option>
            {getOptions(props.users)}
          </Input>
          <Input
            type="textarea"
            className="my-2"
            required
            value={description}
            onChange={({ target: { value } }) => setDescription(value)}
          />
          <Button size="sm" color="success">
            Checkout
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default connect((state) => ({
  users: state.allFields.users,
  statuses: state.allFields.statuses,
}))(DocumentInOut);
