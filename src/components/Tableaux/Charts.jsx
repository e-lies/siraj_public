import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ErrorBoundary from "../../ErrorBoundary";
import Pies from "../Nivos/Pies";
import Bars from "../Nivos/Bars";
import Lines from "../Nivos/Lines";
import Radars from "../Nivos/Radars";
import Matrix from "../Nivos/Matrix";
import {
  FormPies,
  FormBars,
  FormLines,
  FormRadars,
  FormMatrix,
} from "../Nivos/FormGenerator";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Tooltip,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Icon,
} from "@material-ui/core";
import {
  clientPies,
  clientLines,
  clientBMR,
  serverPies,
  serverLines,
  serverBMR,
} from "../../reducers/Functions";

const useStyles = makeStyles((theme) => ({
  tooltipTitle: {
    display: "flex",
    justifyContent: "center",
    whiteSpace: "nowrap",
    marginRight: 16,
    marginLeft: 16,
    fontFamily: "Roboto",
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
}));

const Charts = (props) => {
  const {
    title,
    type,
    schema,
    data,
    chartParams,
    chartProps,
    onChange,
    saveReport,
  } = props;
  const [chartType, setChartType] = useState(type);
  const [params, setParams] = useState(chartProps || {});
  const [form, setForm] = useState(chartParams || {});
  const [newSchema, setNewSchema] = useState(schema);
  const classes = useStyles();

  useEffect(() => {
    if (chartParams) {
      eval(`${type}Update(${JSON.stringify(form)})`);
    }
    if (schema && schema.columns && data && data.length > 0) {
      let sch = Object.keys(data[0] || schema.columns).reduce((acc, cur) => {
        let key = cur.includes("(") ? cur.match(/\((.+)\)/)[1] : cur;
        return { ...acc, [cur]: schema.columns[key] };
      }, {});
      setNewSchema({ columns: sch });
    }
  }, [JSON.stringify(data), JSON.stringify(schema)]);
  useEffect(() => {
    if (chartParams) {
      eval(`${type}Update(${JSON.stringify(form)})`);
    }
  }, [JSON.stringify(newSchema)]);

  const pieUpdate = (obj) => {
    setForm(obj);
    if (newSchema && newSchema.columns && obj.label && obj.value) {
      var dt = newSchema.columns[obj.label]?.type.includes("foreign")
        ? data.map((d) => {
            return {
              ...d,
              [obj.label]: newSchema.columns[obj.label].possibles.find((p) => {
                return parseInt(p.value) === parseInt(d[obj.label]);
              })
                ? newSchema.columns[obj.label].possibles.find((p) => {
                    return parseInt(p.value) === parseInt(d[obj.label]);
                  })["label"]
                : d[obj.label],
            };
          })
        : data;
      const formattedData = clientPies(
        dt,
        obj.label,
        obj.value,
        obj.op,
        obj.color
      );
      obj.color
        ? setParams({ data: formattedData, colorKey: obj.color })
        : setParams({ data: formattedData });
    }
  };

  const radarUpdate = (obj) => {
    setForm(obj);
    if (
      newSchema &&
      newSchema.columns &&
      obj.group &&
      obj.index &&
      obj.Y &&
      obj.op
    ) {
      var dt = newSchema.columns[obj.group]?.type.includes("foreign")
        ? data.map((d) => {
            return {
              ...d,
              [obj.group]: newSchema.columns[obj.group].possibles.find((p) => {
                return parseInt(p.value) === parseInt(d[obj.group]);
              })
                ? newSchema.columns[obj.group].possibles.find((p) => {
                    return parseInt(p.value) === parseInt(d[obj.group]);
                  })["label"]
                : d[obj.group],
            };
          })
        : data;
      const formattedData = clientBMR(dt, obj.group, obj.index, obj.Y, obj.op);
      // récupérer toutes les aretes possibles
      const keys = formattedData.reduce((acc, cur) => {
        const newk = Object.keys(cur).filter(
          (k) => !acc.includes(k) && k !== obj.index
        );
        acc = acc.concat(newk);
        return acc;
      }, []);
      setParams({
        data: formattedData,
        index: obj.index,
        group: obj.group,
        keys,
      });
    } else {
      setParams({});
    }
  };

  const matrixUpdate = (obj) => {
    setForm(obj);
    if (
      newSchema &&
      newSchema.columns &&
      obj.group &&
      obj.index &&
      obj.Y &&
      obj.op
    ) {
      var dt = newSchema.columns[obj.index]?.type.includes("foreign")
        ? data.map((d) => {
            return {
              ...d,
              [obj.index]: newSchema.columns[obj.index].possibles.find((p) => {
                return parseInt(p.value) === parseInt(d[obj.index]);
              })
                ? newSchema.columns[obj.index].possibles.find((p) => {
                    return parseInt(p.value) === parseInt(d[obj.index]);
                  })["label"]
                : d[obj.index],
            };
          })
        : data;
      dt = newSchema.columns[obj.group]?.type.includes("foreign")
        ? dt.map((d) => {
            return {
              ...d,
              [obj.group]: newSchema.columns[obj.group].possibles.find((p) => {
                return parseInt(p.value) === parseInt(d[obj.group]);
              })
                ? newSchema.columns[obj.group].possibles.find((p) => {
                    return parseInt(p.value) === parseInt(d[obj.group]);
                  })["label"]
                : d[obj.group],
            };
          })
        : dt;
      const formattedData = clientBMR(dt, obj.group, obj.index, obj.Y, obj.op);
      // récupérer toutes les aretes possibles
      const keys = formattedData.reduce((acc, cur) => {
        const newk = Object.keys(cur).filter(
          (k) => !acc.includes(k) && k !== obj.index && k !== obj.group
        );
        acc = acc.concat(newk);
        return acc;
      }, []);
      setParams({
        data: formattedData,
        index: obj.index,
        group: obj.group,
        keys,
      });
    } else {
      setParams({});
    }
  };

  const barUpdate = (obj) => {
    setForm(obj);
    if (
      newSchema &&
      newSchema.columns &&
      obj.X !== null &&
      obj.Y !== null &&
      obj.op !== null
    ) {
      var dt = newSchema.columns[obj.index]?.type.includes("foreign")
        ? data.map((d) => {
            return {
              ...d,
              [obj.index]: newSchema.columns[obj.index].possibles.find((p) => {
                return parseInt(p.value) === parseInt(d[obj.index]);
              })
                ? newSchema.columns[obj.index].possibles.find((p) => {
                    return parseInt(p.value) === parseInt(d[obj.index]);
                  })["label"]
                : d[obj.index],
            };
          })
        : data;
      if (newSchema.columns[obj.X]?.type.includes("foreign")) {
        dt = dt.map((d) => {
          return {
            ...d,
            [obj.X]: newSchema.columns[obj.X].possibles.find((p) => {
              return parseInt(p.value) === parseInt(d[obj.X]);
            })
              ? newSchema.columns[obj.X].possibles.find((p) => {
                  return parseInt(p.value) === parseInt(d[obj.X]);
                })["label"]
              : d[obj.X],
          };
        });
      }
      const formattedData = clientBMR(dt, obj.index, obj.X, obj.Y, obj.op);
      // récupérer toutes les aretes possibles
      const keys = formattedData.reduce((acc, cur) => {
        const newk = Object.keys(cur).filter(
          (k) =>
            !acc.includes(k) && k !== obj.index && k !== obj.X && k !== obj.Y
        );
        if (newk !== obj.index) {
          acc = acc.concat(newk);
        }
        return acc;
      }, []);
      setParams({
        data: formattedData,
        index: obj.index,
        X: obj.X,
        Y: obj.Y,
        grouped: obj.grouped,
        keys,
      });
    } else {
      setParams({});
    }
  };
  const lineUpdate = (obj) => {
    setForm(obj);
    if (newSchema && newSchema.columns && obj.X && obj.Y && obj.op) {
      var dt =
        newSchema &&
        newSchema.columns &&
        newSchema.columns[obj.id]?.type.includes("foreign")
          ? data.map((d) => {
              return {
                ...d,
                [obj.id]: newSchema.columns[obj.id].possibles.find((p) => {
                  return parseInt(p.value) === parseInt(d[obj.id]);
                })
                  ? newSchema.columns[obj.id].possibles.find((p) => {
                      return parseInt(p.value) === parseInt(d[obj.id]);
                    })["label"]
                  : d[obj.id],
              };
            })
          : data;
      if (
        newSchema &&
        newSchema.columns &&
        newSchema.columns[obj.X] &&
        newSchema.columns[obj.X].type === "time"
      ) {
        dt = dt.map((d) => {
          return { ...d, [obj.X]: "1970-01-01T" + d[obj.X] };
        });
      }
      const formattedData = clientLines(
        dt,
        obj.id || null,
        obj.X,
        obj.Y,
        obj.op,
        obj.color,
        obj.precision,
        newSchema && newSchema.columns[obj.X]
          ? newSchema.columns[obj.X].type
          : "date"
      );
      let xLabel =
        newSchema && newSchema.columns[obj.X]
          ? newSchema.columns[obj.X].label
          : obj.X;
      let yLabel =
        newSchema && newSchema.columns[obj.Y]
          ? newSchema.columns[obj.Y].label
          : obj.Y;
      let colorKey = obj.color || null;
      setParams({
        data: formattedData,
        precision: obj.precision,
        interpolated: obj.interpolated,
        xLabel,
        yLabel,
        colorKey: obj.color,
      });
    } else {
      setParams({});
    }
  };
  const display = () => {
    let allProps = { ...params, ...chartProps };
    if (newSchema && newSchema.columns) {
      switch (chartType) {
        case "pie":
          return (
            <div>
              {!chartParams && (
                <FormPies
                  /*width={400} height={400}*/ schema={schema}
                  fct={pieUpdate}
                />
              )}
              {params.data && <Pies {...allProps} />}
            </div>
          );
          break;
        case "bar":
          return (
            <div>
              {!chartParams && <FormBars schema={schema} fct={barUpdate} />}
              {params.data && <Bars {...allProps} />}
            </div>
          );
          break;
        case "line":
          return (
            <div style={{ width: "100%", height: "100%" }}>
              {!chartParams && <FormLines schema={schema} fct={lineUpdate} />}
              {params.data && <Lines {...allProps} />}
            </div>
          );
          break;
        case "radar":
          return (
            <div /*style={{width:500,height:500}}*/>
              {!chartParams && (
                <FormRadars
                  id="radarContainer"
                  schema={schema}
                  fct={radarUpdate}
                />
              )}
              {params.data && <Radars {...allProps} />}
            </div>
          );
          break;
        case "matrix":
          return (
            <div>
              {!chartParams && (
                <FormMatrix schema={schema} fct={matrixUpdate} />
              )}
              {params.data && <Matrix {...allProps} />}
            </div>
          );
          break;
        default:
          return <span> Pas de type valable </span>;
      }
    } else {
      return <span> Format de données non valable ! </span>;
    }
  };
  if (newSchema && newSchema.columns) {
    return (
      <div>
        {!chartParams && (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Select
              labelId={`TypeChart${title}`}
              id={`SelectChart${title}`}
              //className={classes.selectEmpty}
              value={chartType}
              onChange={(e) => {
                setChartType(e.target.value);
              }}
            >
              <MenuItem value="charts">Type de graphe:</MenuItem>
              <MenuItem value="pie">Camembert</MenuItem>
              <MenuItem value="bar">Colonnes</MenuItem>
              <MenuItem value="line">Temporel</MenuItem>
              <MenuItem value="radar">Radar</MenuItem>
              <MenuItem value="matrix">Matrice</MenuItem>
            </Select>
            {saveReport && (
              <IconButton
                color="secondary"
                onClick={() => saveReport(chartType, form)}
              >
                <Icon size="medium">save</Icon>
              </IconButton>
            )}
          </div>
        )}
        <Tooltip
          title={title || schema?.name}
          classes={{ tooltip: classes.tooltipTitle }}
        >
          <Typography
            className={classes.tooltipTitle}
            variant={document.body.clientWidth < 500 ? "h6" : "h5"}
          >
            {title || schema?.name || ""}
          </Typography>
        </Tooltip>
        {display()}
      </div>
    );
  } else {
    return <span>Schéma pas encore chargé...</span>;
  }
};
Charts.propTypes = {
  /** Type de graphe (pie, lines, radar, matrix, bars...) */
  type: PropTypes.string,
  /** Schema de la source de data depuis rules */
  schema: PropTypes.shape({}),
  /** Les données du serveur */
  data: PropTypes.arrayOf(PropTypes.shape({})),
  /**Params from the parent comp to save the chart */
  parentParams: PropTypes.shape({
    order: PropTypes.arrayOf(PropTypes.shape()),
    filters: PropTypes.arrayOf(PropTypes.shape()),
  }),
  /** Les paramètres du chart qui permettent de calculer les formattedData (x, y, groupe....), si undefined, des formulaires permettent de les introduire */
  chartParams: PropTypes.shape({}),
  /** Autres props du graphe (onLegendClick, onPointClick, interpollated...etc) */
  chartProps: PropTypes.shape({}),
  saveReport: PropTypes.bool,
};
Charts.defaulProps = {
  title: "",
  data: [],
  chartParams: undefined,
  chartProps: {},
};
export default Charts;
