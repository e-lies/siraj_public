import React, { Component, useReducer, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Select from "react-select";
import * as fcts from "../../reducers/Functions";
import { ContextForms } from "../../context/Forms";
import { CrudContext } from "../../context/ServerContext";
import {
  IconButton,
  Icon,
  Tooltip,
  Typography,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  Switch,
} from "@material-ui/core";
//import { Autocomplete } from "@material-ui/lab";
import ClientTab from "./ClientTab";
import Alerts from "../Alerts";
import Charts from "./Charts";
import Ranking from "../Ranking";
import { useSize } from "../../reducers/Hooks";
//import TheRoot from "../ML/TheRoot";

//import { handleExport } from '../../reducers/excelExport';

const useStyles = makeStyles((theme) => ({
  alerts: {
    //minWidth: 360,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

function reducer(state, action) {
  switch (action.type) {
    case "groupCols":
      let groupCols = action.groupCols.map((g) => g.value);
      return { ...state, groupCols };

    case "precision":
      let groupedColumns = {
        ...state.groupedColumns,
        [action.key]: {
          ...state.groupedColumns[action.key],
          precision: action.value,
        },
      };
      return { ...state, groupedColumns };

    case "openRanking":
      return { ...state, isOpenRanking: !state.isOpenRanking };

    case "ranking":
      return {
        ...state,
        ranking: {
          groupCol: action.group || state.ranking.groupCol,
          rankingCol: action.ranking || state.ranking.rankingCol,
        },
      };

    case "newOp":
      return {
        ...state,
        opCols: state.opCols.concat({ col: null, op: null, label: null }),
      };

    case "deleteOp":
      let opCols = [...state.opCols];
      opCols.splice(action.index, 1);
      return { ...state, opCols };

    case "opCols":
      let opc = [...state.opCols];
      if (action.oc === "op") {
        opc[action.index]["label"] = action.label;
      }
      opc[action.index][action.oc] = action.value;
      return { ...state, opc };

    case "grouped":
      return {
        ...state,
        groupedColumns: state.number
          ? {
              Number: { label: "Nombre", type: "int", length: 1 },
              ...action.columns,
            }
          : action.columns,
      };

    case "data":
      return {
        ...state,
        groupedData: action.data,
      };

    case "params":
      return { ...state, params: action.params };

    case "fonction":
      return { ...state, chart: action.fonction, dataFonction: action.data };

    case "number":
      let gc = { ...state.groupedColumns };
      if (state.number) {
        delete gc["Number"];
      } else {
        gc = { Number: { label: "Nombre", type: "int", length: 1 }, ...gc };
      }
      return { ...state, number: !state.number, groupedColumns: gc };

    case "ml":
      return { ...state, ml: !state.ml };
    default:
      return false;
  }
}

const GroupBy = (props) => {
  const { columns, data, rule, whereParams } = props;
  const classes = useStyles();
  const forms = useContext(ContextForms);
  const server = useContext(CrudContext);
  //groupedColumns est le l'équivalent du schema.columns pour le tableau groupé
  const [state, dispatch] = useReducer(reducer, {
    groupCols: [],
    opCols: [],
    groupedData: [],
    groupedColumns: {},
    fonction: null,
    isOpenRanking: false,
    ranking: { groupCol: null, rankingCol: null },
    ml: false,
    params: { filters: [], order: [] },
  });
  const { width } = useSize();
  const [reportTitle, setReportTitle] = React.useState("");

  const precisionTransform = (value, precision, type) => {
    if (precision && type.includes("date")) {
      let d = new Date(value);
      switch (
        precision //Bon exemple d'un code qui serait moins bon en clean code
      ) {
        case "year":
          return d.getFullYear();
          break;
        case "month":
          return d.getFullYear() + "-" + parseInt(d.getMonth() + 1);
          break;
        case "day":
          return (
            d.getFullYear() + "-" + parseInt(d.getMonth() + 1) + d.getDate()
          );
          break;
        default:
          return value;
      }
    } else if (precision && type === "time") {
      let timeArray = value.split(":");
      switch (precision) {
        case "hour":
          return timeArray[0];
          break;
        case "minute":
          return timeArray[0] + ":" + timeArray[1];
          break;
        default:
          return timeArray.join(":");
      }
    }
  };

  useEffect(() => {
    if (state.groupCols.length > 0) {
      //recréer les columns du new tableau
      let groupedColumns = state.groupCols.reduce((acc, cur) => {
        return state.groupCols.includes(cur)
          ? { ...acc, [cur]: state.groupedColumns[cur] || columns[cur] }
          : acc;
      }, {});
      state.opCols.forEach((oc) => {
        if (oc.col && oc.op) {
          groupedColumns[oc.op + "(" + oc.col + ")"] = {
            label: oc.label + "(" + (columns[oc.col]["label"] || oc.col) + ")",
            type: columns[oc.col].type,
          };
        }
      });
      dispatch({ type: "grouped", columns: groupedColumns });
      dispatch({ type: "params", params: { filters: [], order: [] } });
    }
  }, [JSON.stringify(state.groupCols), JSON.stringify(state.opCols)]);

  useEffect(() => {
    let fct = fcts.nestData(state.groupCols);
    let precisions = Object.keys(state.groupedColumns).reduce((acc, cur) => {
      return state.groupedColumns[cur].precision
        ? { ...acc, [cur]: state.groupedColumns[cur].precision }
        : acc;
    }, {});
    let dt = data.map((d) => {
      let dd = { ...d };
      return Object.keys(state.groupedColumns).reduce((acc, cur) => {
        if (Object.keys(precisions).includes(cur)) {
          dd[cur] = precisionTransform(
            dd[cur],
            precisions[cur],
            state.groupedColumns[cur]["type"]
          );
        }
        return dd;
      }, {});
    });
    let grps = fct(dt);
    for (let i = 0; i < grps.length; i++) {
      state.opCols.map((oc) => {
        if (oc.col && oc.op) {
          //let opLabel = operations[fcts.globalType(columns[oc.col]['type'])].filter(p=>p.value===oc.op)[0]['label']
          grps[i][oc.op + "(" + oc["col"] + ")"] = grps[i]["children"][
            oc["op"]
          ](oc["col"]);
        }
        return false;
      });
    }
    let grpData = [...grps];
    grpData.forEach((g) => {
      g["Number"] = g["children"].length;
      delete g["children"];
    });
    dispatch({ type: "data", data: grpData });
  }, [JSON.stringify(state.groupedColumns)]);

  const options = Object.keys(columns).map((col) => {
    return { label: columns[col]["label"] || col, value: col };
  });
  const operations = {
    number: [
      { label: "Minimum", value: "minim" },
      { label: "Maximum", value: "maxim" },
      { label: "Somme", value: "sum" },
      { label: "Moyenne", value: "avg" },
      { label: "Médiane", value: "median" },
    ],
    date: [
      { label: "Minimum", value: "minim" },
      { label: "Maximum", value: "maxim" },
      { label: "Moyenne", value: "avgDate" },
      { label: "Médiane", value: "medianDate" },
    ],
    time: [
      { label: "Minimum", value: "minim" },
      { label: "Maximum", value: "maxim" },
      { label: "Moyenne", value: "avgDate" },
      { label: "Médiane", value: "medianDate" },
    ],
    text: [{ label: "Différents", value: "count" }],
  };

  const functions =
    width > 480
      ? [
          {
            icon: "pie_chart",
            title: "Camembert",
            fonction: "pie",
            fct: (dat) =>
              dispatch({ type: "fonction", data: dat, fonction: "pie" }),
          },
          {
            icon: "bar_chart",
            title: "Diagramme",
            fonction: "bar",
            fct: (dat) =>
              dispatch({ type: "fonction", data: dat, fonction: "bar" }),
          },
          {
            icon: "multiline_chart",
            title: "Courbes",
            fonction: "line",
            fct: (dat) =>
              dispatch({ type: "fonction", data: dat, fonction: "line" }),
          },
          {
            icon: "wifi_tethering",
            title: "Radar",
            fonction: "radar",
            fct: (dat) =>
              dispatch({ type: "fonction", data: dat, fonction: "radar" }),
          },
          {
            icon: "view_comfy",
            title: "Matrice",
            fonction: "matrix",
            fct: (dat) =>
              dispatch({ type: "fonction", data: dat, fonction: "matrix" }),
          },
          {
            icon: "sort",
            title: "Classement",
            cond: () => state.params.order?.length > 0,
            fct: (dat) => dispatch({ type: "openRanking" }),
          },
          {
            title: "Machine Learning",
            icon: "lightbulb",
            fct: (data) => dispatch({ type: "ml" }),
          },
        ]
      : [
          {
            icon: "multiline_chart",
            title: "Graphes",
            fct: (data) =>
              dispatch({ type: "fonction", data, fonction: "charts" }),
          },
          {
            icon: "sort",
            title: "Classement",
            cond: () => state.params.order?.length > 0,
            fct: (dat) => dispatch({ type: "openRanking" }),
          },
          {
            title: "Machine Learning",
            icon: "build",
            fct: (data) => dispatch({ type: "ml" }),
          },
        ];
  const opTranslation = (op) => {
    switch (op) {
      case "maxim":
        return "max";
      case "minim":
        return "min";
      case "avgDate":
        return "avg";
      default:
        return op;
    }
  };
  const saveReport = (component, form) => {
    let cols = [
      ...state.groupCols.map((gc) => {
        return { col: gc };
      }),
      ...state.opCols
        .filter((oc) => oc.op && oc.col)
        .map((oc) => {
          return {
            col: oc["col"],
            alias: oc.op + "(" + oc["col"] + ")",
            op: opTranslation(oc.op),
          };
        }),
    ];
    let ord =
      state.params?.order?.length > 0 ? state.params.order[0] : undefined;
    let ordre = ord
      ? [
          {
            ...ord,
            col: ord.col.includes("(")
              ? opTranslation(ord.col.split("(")[0]) +
                "(" +
                ord.col.split("(")[1]
              : ord.col,
          },
        ]
      : [];

    forms.addForm("insert", "Reports", {
      defaultData: [
        {
          component:
            component === "table"
              ? "Tableaux/ClientTab"
              : component === "ranking"
              ? "./Ranking"
              : "./Tableaux/Charts",
          rule,
          params: JSON.stringify({
            where:
              whereParams && whereParams["where"] ? whereParams["where"] : [],
            group: state.groupCols,
            cols:
              component === "ranking"
                ? state.groupCols.map((gc) => {
                    return { col: gc };
                  })
                : cols,
            orderBy: ordre, //state.params.order
          }),
          paramState: JSON.stringify(state.params),
          props: JSON.stringify(
            component === "table"
              ? {
                  title: reportTitle,
                  defaultFilter: state.params.filters,
                  export: true,
                }
              : component === "ranking"
              ? { title: reportTitle, index: Object.keys(state.groupedColumns) }
              : { title: reportTitle, type: component, chartParams: form }
          ),
        },
      ],
      complement: {
        idCategory: (dt, inp, id) => {
          return (
            <IconButton
              onClick={() => {
                forms.removeForm("insert", "Reports");
                setTimeout(
                  () =>
                    forms.addForm("insert", "categoryReport", {
                      callback: (r, s) => {
                        if (s < 400) {
                          alert("Catégorie bien ajoutée !");
                          forms.removeForm("insert", "categoryReport");
                          server.getSchema("insert", "Reports", "Group", true);
                          saveReport(component, form);
                        }
                      },
                    }),
                  1000
                );
              }}
            >
              <Icon size="medium" color="secondary">
                {" "}
                add_sign{" "}
              </Icon>
            </IconButton>
          );
        },
      },
      onChange: (st) => setReportTitle(st[0]["name"]),
      hidden: ["component", "rule", "params", "paramState", "props"],
      callback: (rep, st) => {
        if (st < 400) {
          alert("Ajout du rapport réussi");
          forms.removeForm("insert", "Reports");
        } else {
          alert("Une erreur s'est produite lors de la création du rapport !");
        }
      },
    });
  };

  return (
    <div>
      <div id="grouping" style={{ display: "flex", justifyContent: "start" }}>
        <IconButton color="secondary" onClick={() => saveReport("table")}>
          <Icon size="medium">save</Icon>
        </IconButton>
        <FormControl component="fieldset" style={{ minWidth: "312px" }}>
          <FormLabel component="legend">
            <Icon>format_list_bulleted</Icon> Regroupement
          </FormLabel>
          <Select
            name="selGroupColumns"
            isSearchable
            isClearable
            isMulti
            placeholder="Choisissez les colonnes"
            required
            onChange={(e) => {
              dispatch({ type: "groupCols", groupCols: e });
            }}
            label="Choisir"
            options={options}
            fullWidth
            // styles={customStyles}
            value={options.filter((opt) => state.groupCols.includes(opt.value))}
          />
          <div
            id="precisions"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >
            <FormLabel id="demo-controlled-radio-buttons-group">
              Métrique
            </FormLabel>
            {state.groupCols
              .filter(
                (col) =>
                  state.groupedColumns[col] &&
                  ["date", "time"].includes(state.groupedColumns[col]["type"])
              )
              .map((col) => {
                return state.groupedColumns[col]["type"] === "date" ? (
                  <RadioGroup
                    aria-labelledby="datePrecision"
                    defaultValue="day"
                    value={state.groupedColumns[col]["precision"]}
                    name="datePrecision"
                    onChange={(e) =>
                      dispatch({
                        type: "precision",
                        key: col,
                        value: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="day"
                      control={<Radio />}
                      label="Jour"
                    />
                    <FormControlLabel
                      value="month"
                      control={<Radio />}
                      label="Mois"
                    />
                    <FormControlLabel
                      value="year"
                      control={<Radio />}
                      label="Année"
                    />
                  </RadioGroup>
                ) : (
                  <RadioGroup
                    aria-labelledby="datePrecision"
                    defaultValue="day"
                    value={state.groupedColumns[col]["precision"]}
                    name="datePrecision"
                    onChange={(e) =>
                      dispatch({
                        type: "precision",
                        key: col,
                        value: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="hour"
                      control={<Radio />}
                      label="Heure"
                    />
                    <FormControlLabel
                      value="minute"
                      control={<Radio />}
                      label="Minute"
                    />
                  </RadioGroup>
                );
              })}
          </div>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={state.number}
              onChange={(e) => dispatch({ type: "number" })}
              name="number"
            />
          }
          label="Nombre"
        />
        <Tooltip title="Ajouter une colonne de calcul">
          <IconButton
            onClick={(e) => dispatch({ type: "newOp" })}
            color="primary"
          >
            <Icon fontSize="large">add</Icon>
          </IconButton>
        </Tooltip>
        <div id="opCols" style={{ width: "100%", display: "flex" }}>
          {state.opCols.map((oc, i) => {
            return (
              <div key={`oc${i}`} style={{ marginLeft: "15px" }}>
                <FormControl
                  component="fieldset"
                  style={{
                    minWidth: "200px",
                    minHeight: "125px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                  }}
                >
                  <FormLabel component="legend">
                    <IconButton
                      color="secondary"
                      onClick={(e) => dispatch({ type: "deleteOp", index: i })}
                    >
                      <Icon>delete</Icon>
                    </IconButton>
                    Calcul {i}
                  </FormLabel>
                  <Select
                    key={`col${i}`}
                    fullWidth
                    isSearchable={false}
                    placeholder="Choisir une colonne"
                    required
                    options={options.filter((opt) =>
                      Object.keys(operations).includes(
                        fcts.globalType(columns[opt["value"]]["type"])
                      )
                    )}
                    value={
                      options.filter((opt) => opt.value === oc["col"])[0] ||
                      null
                    }
                    onChange={(e) =>
                      dispatch({
                        type: "opCols",
                        oc: "col",
                        index: i,
                        value: e.value,
                      })
                    }
                  />
                  <Select
                    key={`op${i}`}
                    fullWidth
                    isSearchable={false}
                    placeholder="Choisir une opération"
                    required
                    options={
                      state.opCols[i]["col"] !== null
                        ? operations[
                            fcts.globalType(
                              columns[state.opCols[i]["col"]]["type"]
                            )
                          ]
                        : []
                    }
                    value={
                      state.opCols[i]["col"] !== null
                        ? operations[
                            fcts.globalType(
                              columns[state.opCols[i]["col"]]["type"]
                            )
                          ].filter((ope) => ope.value === oc["op"])[0]
                        : null
                    }
                    onChange={(e) =>
                      dispatch({
                        type: "opCols",
                        oc: "op",
                        index: i,
                        label: e.label,
                        value: e.value,
                      })
                    }
                  />
                </FormControl>
              </div>
            );
          })}
        </div>
      </div>
      {state.groupedData.length > 0 && (
        <ClientTab
          schema={{ columns: state.groupedColumns }}
          data={state.groupedData}
          filterKeys={[]}
          onChangeParams={(params) => dispatch({ type: "params", params })}
          checkedFunctions={functions}
          exports
          headerFct={displayStats}
          //{icon:'cloud_download',title:'Exporter',fct:data=>handleExport(data,state.groupedColumns,'Export',[])}
        />
      )}
      <Alerts
        id="dialogCharts"
        //draggable={width > 520 && ["bar","line","matrix"].includes(state.fonction) ? false : true}
        fullScreen
        open={state.chart}
        handleClose={() => dispatch({ type: "fonction", fonction: null })}
        headerFooterFormat={{ classes: classes.alerts }} //{state.functions.filter(f=>f.fonction===state.fonction)[0]}
      >
        <Charts
          type={state.chart}
          schema={{ columns: state.groupedColumns }}
          data={state.dataFonction}
          saveReport={saveReport}
        />
      </Alerts>
      <Alerts
        id="rankingChart"
        fullScreen
        open={state.isOpenRanking}
        handleClose={() => dispatch({ type: "openRanking" })}
        headerFooterFormat={{
          title: "Créer un classement",
          icon: "sort",
          classes: classes.alerts,
        }}
      >
        <div id="rankingForm">
          <div style={{ display: "flex" }}>
            <IconButton color="secondary" onClick={() => saveReport("ranking")}>
              <Icon size="medium">save</Icon>
            </IconButton>
            <h5 id="rankingMessage">
              {state.params?.order?.length > 0
                ? `Triè par ${state.params.order[0]["col"]} de façon ${
                    state.params.order[0]["ordre"] === "asc"
                      ? "ascendante"
                      : "déscendante"
                  }`
                : "Veuillez trier votre tableau avant de configurer un classement !"}
            </h5>
          </div>
          {/*<Select             
						name="selValueRanking"
						placeholder="Choisissez les colonnes"
						required
						onChange={ e=>{dispatch({type:'ranking',ranking:e.value})} }
						label="Choisir"
						options={state.opCols.map((g,i)=>{return {label:`${g.label}(${g.col})`,value:i} })}
						fullWidth
					// styles={customStyles}
						value={options.find(opt=>state.ranking.rankingCol === opt.value)}
					/>*/}
          <Ranking
            data={
              state.params?.order && state.params.order?.[0]?.col
                ? state.groupedData.sort(
                    fcts.sorting(
                      fcts.globalType(
                        state.groupedColumns[state.params.order[0].col]
                          ? state.groupedColumns[state.params.order[0].col].type
                          : "varchar"
                      ),
                      state.params.order[0].ordre,
                      state.params.order[0].col
                    )
                  )
                : state.groupedData
            }
            //{fcts.OrderBy(state.groupedData,{columns:{...state.groupedColumns,},state.params ? state.params.order : [])}
            index={state.groupCols} //{state.ranking.groupCol}
          />
        </div>
      </Alerts>
    </div>
  );
};
export default GroupBy;
