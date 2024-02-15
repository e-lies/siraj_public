import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Link } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ServerContext from "./context/ServerContext";
//import SessionContext from "./context/SessionContext";
import FormsContext from "./context/Forms";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import Theme from "./Themes/Red";
import Reports from "./pages/Reports";
import NotFound from "./NotFound";

const theme = createMuiTheme(Theme);
const Rout = () => (
  <Switch>
    <Route path="/reports/:title/:hash" component={Reports} />
    <Route default comp={NotFound} />
  </Switch>
);

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <HashRouter>
      <ServerContext>
        <FormsContext>
          <Rout />
        </FormsContext>
      </ServerContext>
    </HashRouter>
  </ThemeProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
