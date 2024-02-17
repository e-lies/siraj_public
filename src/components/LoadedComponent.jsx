/**
 * Pass Filters component to children
 * If the child component does not support being passed the Filters component, load it with another component that will simply put Filters on top of it
 * Specifying load/<componentName/path> will indicate that
 */
import React, { Suspense, lazy, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { useTheme } from "@material-ui/core/styles";
import {
  Typography,
  CircularProgress,
  Tooltip,
  Badge,
  Icon,
  Button,
  Popover,
  IconButton,
} from "@material-ui/core";
import ErrorBoundary from "../ErrorBoundary";
import { CrudContext } from "../context/ServerContext";
import { path } from "../Params";
import Filtres from "./Filtres";
import { nestData, filt, keepKeys } from "../reducers/Functions";
import { developmentMode } from "../Params";

let idComp = "";
const fctToType = {
  avg: (type) =>
    type.includes("date") ? "date" : type === "time" ? "time" : "float",
  sum: (type) => type,
  median: (type) => type,
  max: (type) => type,
  min: (type) => type,
  count: () => "int",
  date: () => "date",
  time: () => "time",
};

export default function LoadedComponent({
  id,
  component,
  rule,
  params,
  globalStyle,
  optionStyle,
  contentStyle,
  filterFromLC,
  filterKeys,
  filterProps,
  onFilterUpdate,
  defaultFilter,
  saveState,
  levels,
  fromServer,
  extra,
  mutation,
  propToRender,
  otherProps,
  onDataChange,
  children,
  autoloadData,
  propsToReload,
}) {
  const theme = useTheme();
  const location = useLocation();
  const comp = component.includes("./") ? `${component}` : `./${component}`;
  const context = useContext(CrudContext);
  const [visibleFilter, setVisibleFilter] = useState(false);
  let prm = { ...params };
  let cols = prm?.cols?.map((c) => c.col) || [];
  //ajouter les colonnes de filtre à la data
  prm = prm.cols
    ? {
        ...prm,
        cols: [
          ...prm.cols,
          ...prm.where
            .filter((w) => !cols.includes(w.col))
            .map((w) => {
              return { col: w.col };
            }),
        ],
      }
    : prm;
  const [stateParams, setStateParams] = useState(prm);
  const [filtre, setFiltre] = useState(params?.where || null);
  const [data, setData] = useState([]);
  const [MyComponent, setMyComponent] = useState(null);
  const [schema, setSchema] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // la fct key formate la clé pour récupérer les data du context
  const key = () => {
    return stateParams && Object.keys(stateParams).length > 0
      ? JSON.stringify(stateParams)
      : "all";
  };

  function Read() {
    setIsLoading(true);
    const par = stateParams ? [{ rule, params: stateParams }] : [{ rule }];
    context.read(par, idComp, true, (d) => {
      setData(loadData(mutation ? mutation(d) : d));
      setIsLoading(false);
    });
  }

  useEffect(() => {
    //MyComponent = lazy(() => import(`${comp}`))
    let fil = location ? location.search.match(/filtre=(\[(.+)\])/) : null; //dans JSON.parse, les clés doivent etre entre ""
    //let defaultFilter = "[]" // fil !== null && fil.length > 0 ? JSON.parse(unescape(fil[1])) : [];
    idComp = context.componentCreation(component);
    context.getSchema("select", rule, idComp, developmentMode);
  }, []);

  useEffect(() => {
    setMyComponent(lazy(() => import(`${comp}`)));
  }, [component]);

  useEffect(() => {
    let prm = { ...params };
    let cols = prm?.cols?.map((c) => c.col) || [];
    //ajouter les colonnes de filtre à la data
    prm = prm.cols
      ? {
          ...prm,
          cols: [
            ...prm.cols,
            ...prm.where
              .filter((w) => !cols.includes(w.col))
              .map((w) => {
                return { col: w.col };
              }),
          ],
        }
      : prm;
    setStateParams(prm);
    if (context.schemas.select[rule]) {
      let whereCols = params?.where
        ? params.where
            .filter((w) => !cols.includes(w.col))
            .reduce((acc, cur) => {
              let col = cur?.label || cur?.col;
              return {
                ...acc,
                [col]: context.schemas.select[rule]?.columns[col],
              };
            }, {})
        : {};
      setSchema(
        params && params.cols
          ? {
              columns: params.cols.reduce((acc, cur) => {
                let col = cur.col.split(",")[0];
                let type = cur.op
                  ? fctToType[cur.op](
                      context.schemas.select[rule]["columns"][col]["type"]
                    )
                  : context.schemas.select[rule]["columns"][col]["type"];
                return {
                  ...acc,
                  [cur.alias || cur.col || cur]: {
                    label: cur.alias || cur.col || cur,
                    type,
                    possibles:
                      context.schemas.select[rule]["columns"][col][
                        "possibles"
                      ] || undefined,
                  },
                };
              }, whereCols),
            }
          : context.schemas.select[rule]
      );
    }
  }, [JSON.stringify(params)]);
  /*useEffect(()=>{
    setStateParams(params || {})
    //setFiltre([])
    if(autoloadData) {
      Read() 
    }
  },[rule])*/

  useEffect(() => {
    if (autoloadData && stateParams) {
      console.log("read useEffect sp", JSON.stringify(stateParams));
      Read();
    }
  }, [JSON.stringify(stateParams)]);

  useEffect(() => {
    console.log("read useEffect pt", stateParams, filtre);
    //Read();
  }, [JSON.stringify(propsToReload)]);

  useEffect(() => {
    //vérifier si filtre client ou serveur
    onFilterUpdate && onFilterUpdate(filtre);
    if (
      fromServer &&
      JSON.stringify(filtre) !== JSON.stringify(stateParams?.where || [])
    ) {
      console.log("read onFiltre change");
      setStateParams({ ...stateParams, where: filtre });
      /*let fk = filtre.map(f=>f.col)
      if(!stateParams.where || stateParams.where.length < 1){
        setStateParams({...stateParams, where: filtre || []})
      }
      else if (Array.isArray(stateParams.where[0])){
        setStateParams({...stateParams, where: stateParams.where.map(spw=>[...spw.filter(s=>!fk.includes(s.col)),...filtre]) })
      }
      else{
        setStateParams({ ...stateParams, where: [...(stateParams.where.filter(s=>!fk.includes(s.col)) || []),...filtre]}); //le changement de stateParams provoquera un read
      }*/
    } else {
      setData(loadData());
    }
  }, [JSON.stringify(filtre)]);

  /*useEffect(() => {
    let ld = loadData();
    setData(ld);
  }, [JSON.stringify(context.data[rule])]); */

  useEffect(() => {
    if (context.schemas.select[rule]) {
      let cols = params?.cols?.map((c) => c.col) || [];
      let whereCols = params?.where
        ? params.where
            .filter((w) => !cols.includes(w.col))
            .reduce((acc, cur) => {
              let col = cur?.label || cur?.col;
              return {
                ...acc,
                [col]: context.schemas.select[rule]?.columns[col],
              };
            }, {})
        : {};

      setSchema(
        params && params.cols
          ? {
              columns: {
                ...whereCols,
                ...params.cols.reduce((acc, cur) => {
                  let col = cur.col.split(",")[0];
                  let type = cur.op
                    ? fctToType[cur.op](
                        context.schemas.select[rule]["columns"][col]["type"]
                      )
                    : context.schemas.select[rule]["columns"][col]["type"];
                  return {
                    ...acc,
                    [cur.alias || cur.col || cur]: {
                      label: cur.alias || cur.col || cur,
                      type,
                      possibles:
                        context.schemas.select[rule]["columns"][col][
                          "possibles"
                        ] || undefined,
                    },
                  };
                }, {}),
              },
            }
          : context.schemas.select[rule]
      );
    }
  }, [JSON.stringify(context.schemas.select[rule])]);

  /*useEffect(() => {
    onDataChange(data, id);
  }, [JSON.stringify(data)]); */

  const SaveState = () => {
    fetch(`${path}/Models/SaveState.php`, {
      method: "post",
      body: { component, rule, params: stateParams, filtre, otherProps },
    })
      .then((prm) => {
        if (prm.status >= 400) {
          alert(
            "Une erreur s'est produite sur le serveur au moment de la sauvegarde !\n Veuillez vérifier le résultat"
          );
        } else {
          return prm.text().then((rep) => {
            alert("Rapport bien sauvegardé");
          });
        }
      })
      .catch((rep, err) => {
        alert("Erreur d'envoi de la sauvegarde ! \n" + rep + " \n" + err);
      });
  };
  const refFilter = React.useRef();
  const loadData = (data) => {
    let dt = [];
    if (data || (context.data[rule] && context.data[rule][key()])) {
      dt =
        filtre?.length > 0 && schema && !fromServer
          ? filt(data || context.data[rule][key()].data, filtre, schema.columns)
          : data || context.data[rule][key()].data;
      if (levels && levels.length > 0) {
        const fctData = nestData(...levels);
        dt = fctData(dt);
      }
    }
    return dt;
  };

  const onParamsChange = (p) => {
    console.log("read onParamsChange");
    Read(); //va provoquer un nouveau loadData
  };

  //Component filtre qui se collera à un des élements du child
  const FilterComp = React.useMemo(() => {
    return filterKeys ? (
      <Filtres
        inputs={schema ? schema.columns : {}}
        keys={filterKeys}
        //confirmation
        onChange={(st) => setFiltre(st)}
      />
    ) : null;
  }, [rule, context.schemas.select, filterKeys, JSON.stringify(params)]);
  const render = React.useCallback(
    (x) => {
      return (
        <Suspense
          className="Suspense"
          fallback={
            <h5>
              {" "}
              {`Composant ${
                comp.split("/").slice(-1)[0]
              } en cours de chargement...`}{" "}
            </h5>
          }
        >
          {MyComponent && (
            <MyComponent
              key={comp + rule + JSON.stringify(params)}
              data={data}
              FilterComp={filterFromLC ? FilterComp : null}
              schema={schema} //{{...schema, columns: keepKeys(schema?.columns || {}, stateParams?.cols?.map(c=>c.alias || c.col) || [])}}
              onParamsChange={onParamsChange}
              {...otherProps}
            />
          )}
        </Suspense>
      );
    },
    [
      JSON.stringify(data),
      JSON.stringify(schema),
      component,
      rule,
      JSON.stringify(propToRender),
    ]
  );

  return (
    <div className="fragmentDiv">
      {" "}
      {/*<ErrorBoundary>*/}
      <div className="fragmentDiv">
        <div className="styleDiv" style={optionStyle}>
          {extra}
          {schema && filterKeys && !filterFromLC && (
            <div className="filters">
              <Button
                ref={refFilter}
                onClick={(e) => setVisibleFilter(!visibleFilter)}
                color={filtre?.length > 0 ? "primary" : "secondary"}
                variant="contained"
                //style={{maxHeight:32}}
              >
                <Tooltip
                  title={filtre
                    ?.map((f) => `${f.col} ${f.operator} ${f.value}`)
                    .join("\n")}
                >
                  <Badge badgeContent={filtre?.length} color="error">
                    <Typography
                      style={{
                        marginRight: 10,
                        fontFamily: theme.typography.fontFamily,
                      }}
                      variant="subtitle1"
                    >
                      Filtrer
                    </Typography>
                    <Icon
                      fontSize="medium"
                      style={{
                        transform: visibleFilter && "rotate(-180deg)",
                        transition: "transform .6s ease-in-out",
                      }}
                    >
                      filter_list
                    </Icon>
                  </Badge>
                </Tooltip>
              </Button>
              <Popover
                id={`popover_${rule}`}
                open={visibleFilter}
                anchorEl={refFilter.current}
                onClose={(e) => setVisibleFilter(false)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <Filtres
                  initialState={filtre} //{fromServer ? [...filtre,...stateParams?.where] : filtre}
                  inputs={schema ? schema.columns : {}}
                  keys={
                    filterKeys
                      ? filterKeys.length > 0
                        ? filterKeys
                        : Object.keys(schema.columns)
                      : []
                  }
                  onChange={(st) => {
                    setFiltre(st);
                  }}
                  onConfirm={() => setVisibleFilter(false)}
                  {...filterProps}
                />
              </Popover>
            </div>
          )}
          {saveState && (
            <IconButton onClick={SaveState}>
              <Icon color="action"> save </Icon>
            </IconButton>
          )}
          {children}
        </div>
        <div style={contentStyle} className="divContent">
          {schema && schema.columns && data ? ( //context.data[rule] && context.data[rule][key()]
            <> {render()} </>
          ) : (
            <div
              style={{
                width: "100%",
                height: 300,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                width={parseInt(document.body.clientWidth / 4)}
                height={parseInt(document.body.clientWidth / 4)}
                alt={"En attente"}
                src={path + "/Images/LoadedComponent.gif"}
              />
              {/*<CircularProgress color="secondary" size={100} />*/}
            </div>
          )}
        </div>
        {!autoloadData && (
          <Button
            onClick={(e) => Read()}
            color="primary"
            variant="contained"
            style={{ margin: 12 }}
          >
            <Icon> download </Icon>
            <Typography variant="h6"> Charger </Typography>
          </Button>
        )}
      </div>
      {/*</ErrorBoundary>*/}{" "}
    </div>
  );
}
LoadedComponent.propTypes = {
  /** Identifiant du LoadedComponent */
  id: PropTypes.string,
  /**
   * Type de composant
   */
  component: PropTypes.string.isRequired,
  /**
   * Rule à utiliser pour charger
   */
  rule: PropTypes.string.isRequired,
  /**
   * Params à ajouter au moment du Read(colonnes, filtres, group...etc)
   */
  params: PropTypes.object,
  /**
   * Style à appliquer au bloc principal
   */
  globalStyle: PropTypes.shape(),
  /**
   * Style du bloc contenant le children et le filtre
   */
  optionStyle: PropTypes.shape(),
  /**
   * Style à appliquer au conteneur interne
   */
  contentStyle: PropTypes.shape(),
  /**
   * Les keys de data avec lesquels filtrer, si undefined, aucun component Filtre ne sera généré
   */
  filterKeys: PropTypes.array,
  /**
   * Le chargement se fait-il coté client ou serveur
   */
  fromServer: PropTypes.bool,
  /**
   * S'ils existent, la data sera transformée en arbre hiérarichique avec des children
   */
  levels: PropTypes.array,
  /**
   * Passer ou pas le component Filtre au child
   */
  filterFromLC: PropTypes.bool,
  /** Props à rajouter au composant Filtres */
  filterProps: PropTypes.shape({
    resetable: PropTypes.bool,
    confiramtion: PropTypes.bool,
    initialState: PropTypes.shape({}),
    onChange: PropTypes.func,
  }),
  /** Filtrage par défaut */
  defaultFilter: PropTypes.shape(),
  /**
   * Elément à ajouter au début si nécéssaire
   */
  extra: PropTypes.element,
  /** Fonctionqui fera muter les données à la réception */
  mutation: PropTypes.func,
  /**
   * Variables qui doivent déclencher un render si elles changent (on peut mettre plusieurs variables dans un array, le changement d'1 seule, déclenchera un rerender)
   */
  propToRender: PropTypes.array,
  /**
   * Variables qui doivent déclencher un data read si elles changent (on peut mettre plusieurs variables dans un array, le changement d'1 seule, déclenchera un rerender)
   */
  propsToReload: PropTypes.array,
  /**
   * Les props à ajouter au component
   */
  otherProps: PropTypes.object,
  autoloadData: PropTypes.bool,
};
LoadedComponent.defaultProps = {
  fromServer: false,
  params: undefined,
  filterFromLC: false,
  defaultFilter: [],
  otherProps: {},
  globalStyle: { width: "100%" },
  optionStyle: { display: "flex", padding: 6 },
  contentStyle: { width: "100%" },
  extra: <span> </span>,
  onDataChange: (data, id) =>
    console.log(`LoadedComponent ${id} has updated data`),
  autoloadData: true,
};
// export default LoadedComponent;
