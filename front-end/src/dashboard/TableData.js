import React from "react";
import { finishTable } from "../utils/api";

// table data
function TableData({ table, loadDashboard }) {
  const { table_name, capacity, table_id, status, reservation_id } = table;
  if (!table) return null;

  // handeler
  const handeler = () => {
    const msg = "Is this table ready to seat new guests? This cannot be undone";
    if (window.confirm(msg)) {
      // abort controller
      const abortController = new AbortController();

      finishTable(table.table_id, abortController.signal).then(loadDashboard);
      // abort controller
      return () => abortController.abort();
    }
  };

  // JSX render
  return (
    <tr>
      <th scope="row">{table_id}</th>
      <td>{table_name}</td>
      <td>{capacity}</td>
      <td data-table-id-status={table_id}>{status}</td>
      <td>{reservation_id ? reservation_id : "--"}</td>

      {/* conditional rendering */}
      {status === "occupied" && (
        <td>
          <button
            className="btn btn-warning"
            data-table-id-finish={table_id}
            onClick={handeler}
            type="button"
          >
            Finish
          </button>
        </td>
      )}
    </tr>
  );
}

export default TableData;
