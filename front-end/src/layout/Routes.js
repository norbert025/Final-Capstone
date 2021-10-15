import React, { useState, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { today } from "../utils/date-time";
import CreateTable from "../table/CreateTable";
import Search from "../search/Search";
import useQuery from "../utils/useQuery";
import NotFound from "./NotFound";
import Reservation from "../reservation/Reservation";
import Seats from "../reservation/Seats";
import Dashboard from "../dashboard/Dashboard";
import { listReservations, listTables } from "../utils/api";

function Routes() {
  // state variables
  const [reservationsError, setReservationsError] = useState(null);
  const [tablesError, setTablesError] = useState(null);
  const [tables, setTables] = useState([]);

  // useQuery
  const query = useQuery();
  const date = query.get("date") ? query.get("date") : today();
  const [reservations, setReservations] = useState([]);

  // useEffect
  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();

    setReservationsError(null);
    setTablesError(null);

    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    listTables(abortController.signal)
      .then((tables) =>
        tables.sort((tableA, tableB) => tableA.table_id - tableB.table_id)
      )
      .then(setTables)
      .catch(setTablesError);
    // abort controller
    return () => abortController.abort();
  }

  // routes
  return (
    <Switch>
      {/* "/dashboard" */}
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>

      {/* "/reservations" */}
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>

      {/* "/reservations/new" */}
      <Route path="/reservations/new">
        <Reservation loadDashboard={loadDashboard} />
      </Route>

      {/* "/reservations/:reservation_id/edit" */}
      <Route path="/reservations/:reservation_id/edit">
        <Reservation loadDashboard={loadDashboard} edit={true} />
      </Route>

      {/* "/reservations/:reservation_id/seat" */}
      <Route path="/reservations/:reservation_id/seat">
        <Seats loadDashboard={loadDashboard} tables={tables} />
      </Route>

      {/* "/tables/new" */}
      <Route path="/tables/new">
        <CreateTable loadDashboard={loadDashboard} />
      </Route>

      {/* "/dashboard" */}
      <Route path="/dashboard">
        <Dashboard
          date={date}
          tables={tables}
          tablesError={tablesError}
          loadDashboard={loadDashboard}
          reservations={reservations}
          reservationsError={reservationsError}
        />
      </Route>

      {/* "/search" */}
      <Route exact={true} path="/search">
        <Search />
      </Route>

      <Route>
        {/* NotFound */}
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
