import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Grid,
  IconButton,
  Icon,
  Select,
  FormControl,
  FormHelperText,
  MenuItem,
} from "@material-ui/core";
import Bouttons from "./Bouttons";
import { useSize } from "../reducers/Hooks";
import {
  cleanFromKeys,
  dateSinceToNow,
  numberOfUnitsFromNow,
} from "../reducers/Functions";
import Inputs from "./Inputs";

const useStyles = makeStyles((theme) => ({
  form: { marginTop: "10px", marginBottom: "10px", padding: "8px" },
  grid: {
    margin: 12,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
  },
  group: {
    height: "125px",
    padding: "4px",
    // backgroundColor: theme.palette.background.paper
  },
  unique: {
    display: "flex",
    alignItems: "column",
    justifyContent: "center",
    height: "125px",
    minWidth: "200px",
    // backgroundColor: theme.palette.background.paper
  },
}));
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default function Filtres(props) {
  // inp = {age:{type:'int',operators:['>','<']},Nom:{type:'varchar(40)',operators:['like']},Poste:{type:'foreign',operators:['in'],possibles:[{col:'operateur',id:1},{col:'ingenieur',id:2}]}]}}
  // defaultWidth est 12 par défaut mais peut changer si le container du filtre est + petit par exemple
  //vriant can be client, withConfirm, server
  const {
    title,
    confirmation,
    inputs,
    keys,
    disabled,
    spacing,
    widthCoef,
    initialState,
    onChange,
    onConfirm,
  } = props;
  const classes = useStyles();
  const [stateInput, setStateInput] = useState(inputs);
  const [state, setState] = useState(initialState || []);
  const [errors, setError] = useState([]);

  const Complement = (input, inp) => {
    return (
      <>
        <IconButton
          onClick={() => {
            let st = [...state];
            setStateInput({
              ...stateInput,
              [input]: {
                ...stateInput[input],
                metric: ["year", "month", "day", "hour", "minute"].includes(
                  stateInput[input]?.metric || ""
                )
                  ? null
                  : "day",
              },
            });
            let stateCol = st
              .filter((s) => s.col === input)
              .map((s) => {
                return {
                  ...s,
                  metric: ["year", "month", "day", "hour", "minute"].includes(
                    stateInput[input]?.metric
                  )
                    ? null
                    : "day",
                  value: ["year", "month", "day", "hour", "minute"].includes(
                    stateInput[input]?.metric
                  )
                    ? dateSinceToNow(s.value, stateInput[input].metric)
                    : numberOfUnitsFromNow(s.value, "day"),
                };
              });
            /*st[index] = {
              ...(st[index]?.metric
                ? cleanFromKeys(st[index], ["metric"])
                : {
                    ...st[index],
                    metric: inp.type === "time" ? "hour" : "day",
                  }),
              value: st[index]?.value
                ? ["year", "month", "day", "hour", "minute"].includes(
                    st[index]?.metric
                  )
                  ? dateSinceToNow(st[index].value, st[index]?.metric)
                  : numberOfUnitsFromNow(st[index].value, "day")
                : null,
            };*/
            setState([...st.filter((s) => s.col !== input), ...stateCol]);
          }}
        >
          <Icon color="secondary">
            {" "}
            {["year", "month", "day", "hour", "minute"].includes(
              stateInput[input]?.metric
            )
              ? "date_range"
              : "update"}{" "}
          </Icon>
        </IconButton>
        {stateInput[input]?.metric && (
          <FormControl style={{ width: 80 }} error={errors.includes(input)}>
            <FormHelperText>Unité de temps</FormHelperText>
            <Select
              label="Unité de temps"
              value={stateInput[input].metric}
              style={{ width: 80 }}
              onChange={(e) => {
                let st = [...state]
                  .filter((s) => s.col === input)
                  .map((s) => {
                    return {
                      ...s,
                      metric: e.target.value,
                      value: numberOfUnitsFromNow(
                        dateSinceToNow(s.value, stateInput[input]?.metric),
                        e.target.value
                      ),
                    };
                  });
                setStateInput({
                  ...stateInput,
                  [input]: {
                    ...stateInput[input],
                    metric: e.target.value,
                  },
                });
                setState([...state.filter((s) => s.col !== input), ...st]);
              }}
            >
              <MenuItem value="year"> Année </MenuItem>
              <MenuItem value="month"> Mois </MenuItem>
              <MenuItem value="day"> Jour </MenuItem>
              {inp.type === "datetime" && (
                <MenuItem value="hour"> Heure </MenuItem>
              )}
              {inp.type === "datetime" && (
                <MenuItem value="minute"> Minute </MenuItem>
              )}
            </Select>
          </FormControl>
        )}
      </>
    );
  };

  useEffect(() => {
    const k = keys || Object.keys(inputs);
    // ne garder que les éléments affichables et transfomer les set/enum/foreign en foreigns
    const si = Object.keys(inputs).reduce((acc, cur) => {
      if (k.includes(cur)) {
        acc[cur] = { ...inputs[cur] };
        if (acc[cur].type.includes("enum") || acc[cur].type.includes("set")) {
          const pos = acc[cur].type
            .replace(/(\w+)\((.+)\)/, "$2")
            .replace(/'/gi, "")
            .split(",")
            .reduce((a, c) => a.concat({ label: c, value: c }), []);
          acc[cur].possibles = pos;
          acc[cur].type = "foreigns";
        }
        if (acc[cur].type === "foreign") {
          acc[cur].type = "foreigns";
        }
        let initial = initialState.find((f) => f.col === cur);
        if (initial && initial.metric) {
          acc[cur].metric = initial.metric;
        }
      }
      return acc;
    }, {});
    setStateInput(si);
  }, [JSON.stringify(inputs), keys]);
  useEffect(() => {
    if (!confirmation) {
      onChange(state);
    }
  }, [JSON.stringify(state)]);

  const handleChange = (e, type, label, operator) => {
    let val;
    const st = [...state];
    const err = [...errors];
    const inp = stateInput[label];
    let filterObj = st.filter(
      (s) => s.col === label && s.operator === operator
    )[0];
    if (e === null) {
      // cas du vidage d'un <Select
      val = null;
    } else if (
      (type.includes("date") || type.includes("time")) &&
      !inp.metric
    ) {
      val =
        type === "time"
          ? `${e.getHours()}:${e.getMinutes()}:${e.getSeconds()}`
          : e;
    } else if (["foreigns", "autocompletes"].includes(type)) {
      val = e.map((m) => m.value);
    } else {
      val = e.value || e.target?.value || null;
    }
    if (
      type.includes("int") ||
      type.includes("float") ||
      type.includes("decimal")
    ) {
      const oop = operator === ">" ? "<" : ">";
      const other = state.filter((s) => s.col === label && s.operator === oop);
      if (!isNumeric(val) && !err.includes(label)) {
        setError(err.concat(label));
      } else if (other.length > 0) {
        if (
          ((operator === ">" && val > other[0].value) ||
            (operator === "<" && val < other[0].value)) &&
          !err.includes(label)
        ) {
          setError(err.concat(label));
        } else {
          setError(err.filter((er) => er !== label));
        }
      } else {
        setError(err.filter((er) => er !== label));
      }
    }
    const ft = st.filter((f) => f.col !== label || f.operator !== operator);
    const fil =
      val !== null && val !== ""
        ? ft.concat({
            col: label,
            operator,
            value: val,
            metric: inp.metric || null,
          })
        : ft;
    setState(fil);
  };
  const prp = {
    color: "secondary",
    icon: "refresh",
    callback: () => {
      setState([]);
    },
  };
  const { width } = useSize("filterGrid");
  return (
    <Grid
      id="filterGrid"
      container
      className={classes.grid}
      spacing={spacing || 0}
    >
      {title && (
        <Typography variant="h4" style={{ marginLeft: "10%" }}>
          {" "}
          {title}
        </Typography>
      )}
      <Grid
        spacing={25}
        style={{
          width: "90%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}
      >
        {Object.keys(stateInput).map((input, ind) => {
          const inp = stateInput[input];
          if (
            inp.type.includes("varchar") ||
            inp.type.includes("text") ||
            inp.type.includes("foreign") ||
            inp.type.includes("autocomplete")
          ) {
            const op =
              inp.type === "foreigns" || inp.type === "autocompletes"
                ? "in"
                : "like";
            const exp = "contient";
            const search = state.filter((s) => s.col === input);
            return (
              <Grid id={`grid${input}`} item className={classes.unique}>
                <Inputs
                  autoFocus={ind === 0}
                  key={`${inp.col}(${exp})`}
                  id={`inp_${ind}`}
                  widthCoef={width}
                  filtre
                  disabled={
                    disabled !== undefined &&
                    (disabled.includes(inp.col) || disabled.length === 0)
                  }
                  type={inp.type}
                  possibles={inp.possibles || []}
                  // length = {inp].length === undefined ? 50 : inputs[inp].length}
                  icon={inp.icon || null}
                  value={search.length > 0 ? search[0].value : ""}
                  label={`${inp.col || input}(${exp})`}
                  //error={errors[inp]}
                  //required = {inputs[inp].required || false}
                  onValidate={() => onChange(state)}
                  onChange={(e) => handleChange(e, inp.type, input, op)}
                />
              </Grid>
            );
          }
          if (
            inp.type.includes("int") ||
            inp.type.includes("float") ||
            inp.type.includes("decimal")
          ) {
            const min = state.filter(
              (s) => s.col === input && s.operator === ">="
            );
            const max = state.filter(
              (s) => s.col === input && s.operator === "<="
            );
            return (
              <Grid id={`grid${input}`} item className={classes.group}>
                {(!inp.filtrable || inp.filtrable.includes("min")) && (
                  <Inputs
                    key={`${inp.col}(>=)`}
                    id={`inp_${ind}`}
                    autoFocus={ind === 0}
                    widthCoef={width}
                    filtre
                    disabled={
                      disabled !== undefined &&
                      (disabled.includes(input) || disabled.length === 0)
                    }
                    type={inp.type}
                    possibles={inp.possibles || []}
                    // length = {inp.length === undefined ? 50 : inputs[inp].length}
                    icon={inp.icon || null}
                    value={min.length > 0 ? min[0].value : ""}
                    label={`${inp.col || input}(>=)`}
                    //error={errors[inp]}
                    // required = {inputs[inp].required || false}
                    onChange={(e) => handleChange(e, inp.type, input, ">=")}
                  />
                )}
                {(!inp.filtrable || inp.filtrable.includes("max")) && (
                  <Inputs
                    key={`${inp.col}(<=)`}
                    id={`inp_${ind}f`}
                    widthCoef={width}
                    filtre
                    disabled={
                      disabled !== undefined &&
                      (disabled.includes(input) || disabled.length === 0)
                    }
                    type={inp.type}
                    possibles={inp.possibles || []}
                    // length = {inp.length === undefined ? 50 : inputs[inp].length}
                    icon={inp.icon || null}
                    value={max.length > 0 ? max[0].value : ""}
                    label={`${inp.col || input}(<=)`}
                    //error={errors[inp]}
                    // required = {inputs[inp].required || false}
                    onChange={(e) => handleChange(e, inp.type, input, "<=")}
                  />
                )}
              </Grid>
            );
          }
          if (inp.type.includes("date") || inp.type.includes("time")) {
            const debut = state.filter(
              (s) => s.col === input && s.operator === ">="
            );
            const fin = state.filter(
              (s) => s.col === input && s.operator === "<="
            );
            return (
              <Grid id={`grid${input}`} item className={classes.group}>
                {(!inp.filtrable || inp.filtrable.includes("min")) && (
                  <Inputs
                    key={`${inp.col}(debut)`}
                    id={`inp_${ind}`}
                    autoFocus={ind === 0}
                    widthCoef={width}
                    filtre
                    disabled={
                      disabled !== undefined &&
                      (disabled.includes(input) || disabled.length === 0)
                    }
                    type={inp.metric ? "int" : inp.type}
                    possibles={inp.possibles || []}
                    metric={debut[0]?.metric}
                    // length = {inp.length === undefined ? 50 : inputs[inp].length}
                    icon={inp.icon || null}
                    value={debut.length > 0 ? debut[0].value : null}
                    label={`${inp.col || input}(debut)`}
                    //error={errors[inp]}
                    // required = {inputs[inp].required || false}
                    onChange={(e) =>
                      handleChange(
                        e,
                        debut[0]?.metric ? "int" : inp.type,
                        input,
                        ">="
                      )
                    }
                    complement={Complement(input, inp, debut, ">=")}
                  />
                )}
                {(!inp.filtrable || inp.filtrable.includes("max")) && (
                  <Inputs
                    key={`${inp.col}(fin)`}
                    id={`inp_${ind}f`}
                    widthCoef={width}
                    filtre
                    disabled={
                      disabled !== undefined &&
                      (disabled.includes(input) || disabled.length === 0)
                    }
                    type={inp.metric ? "int" : inp.type}
                    possibles={inp.possibles || []}
                    // length = {inp.length === undefined ? 50 : inputs[inp].length}
                    icon={inp.icon || null}
                    value={fin.length > 0 ? fin[0].value : null}
                    label={`${inp.col || input}(fin)`}
                    metric={fin[0]?.metric}
                    //{errors[inp]}
                    // required = {inputs[inp].required || false}
                    onChange={(e) =>
                      handleChange(e, fin[0] ? "int" : inp.type, input, "<=")
                    }
                    //complement={Complement(input, inp, fin, "<=")}
                  />
                )}
              </Grid>
            );
          }
        })}
      </Grid>
      <Grid
        container
        xs={6}
        sm={4}
        md={3}
        lg={2}
        xl={1}
        style={{
          margin: 16,
          width: 180,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Bouttons {...prp} />
        {confirmation && (
          <Bouttons
            icon="search"
            color="primary"
            callback={() => {
              onChange(state);
              onConfirm(state);
            }}
          />
        )}
      </Grid>
    </Grid>
  );
}
