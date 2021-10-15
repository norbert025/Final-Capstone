import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";

// creates new table
function CreateTable({ loadDashboard }) {
  const history = useHistory();
  const defaultFormState = {
    table_name: "",
    capacity: "",
  };

  const [renderData, setrenderData] = useState({ ...defaultFormState });
  const { table_name, capacity } = renderData;

  // on changle handeler
  const handleChange = ({ target: { name, value } }) => {
    setrenderData({
      ...renderData,
      [name]: name === "capacity" ? Number(value) : value,
    });
  };

  // on submit handeler
  const handleSubmit = (event) => {
    event.preventDefault();
    // abort controller
    const abortController = new AbortController();

    if (validateFields()) {
      createTable(renderData, abortController.signal)
        .then(loadDashboard)
        .then(() => history.push(`/dashboard`))
        .catch();
    }
    // abort controller
    return () => abortController.abort();
  };

  // validation function
  function validateFields() {
    let found_Errors = null;

    if (renderData.table_name === "" || capacity === "") {
      const message = "Please fill out all fields.";
      found_Errors = { message };
    } else if (table_name.length < 2) {
      const message = "Table name must be at least 2 characters.";
      found_Errors = { message };
    }

    return found_Errors === null;
  }

  // JSX render
  return (
    <div>
      <h1>Create New Table</h1>
      <form onSubmit={handleSubmit}>
        <div className="TableName">
          <label>
            Table Name:
            <input type="text" name="table_name" onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Capacity:
            <input type="number" name="capacity" onChange={handleChange} />
          </label>
        </div>
        <div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          <button className="btn btn-secondary" onClick={history.goBack}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTable;
