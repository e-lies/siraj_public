import React, { useState } from "react";
import PropTypes from "prop-types";
import Alerts from "./Alerts";
import Inputs from "./Inputs";
import LocalSaves from "./LocalSaves";

import { Icon, IconButton } from "@material-ui/core";

function Configurator({
  open,
  options,
  config,
  onChange,
  onClose,
  icon,
  title,
  saveKey,
}) {
  const [openLocalSave, setOpenLocalSave] = useState(false);
  console.log(config, options);
  return (
    <Alerts
      type="info"
      open={open}
      headerFooterFormat={{
        icon: icon,
        title: title,
        footer: undefined,
      }}
      handleClose={onClose}
    >
      <LocalSaves
        storageKey={saveKey}
        title="Sauvegarde de configuration"
        open={openLocalSave}
        onClose={() => setOpenLocalSave(false)}
        onClick={(save) => onChange(save["value"])}
        stateToSave={config}
      />
      <IconButton onClick={() => setOpenLocalSave(true)}>
        <Icon>save</Icon>
      </IconButton>
      {Object.keys(options).map((option, ind) => {
        const { min, max, step } = options[option];
        if (!(isNaN(min) || isNaN(max))) {
          return (
            <div key={ind} style={{ display: "flex" }}>
              <Inputs
                type="slider"
                min={min}
                max={max}
                step={step || 1}
                label={option[0].toUpperCase() + option.slice(1)}
                onChange={(ev, val) => onChange({ [option]: val })}
                value={config[option]}
              />
            </div>
          );
        }
        // Multiple choice
        else if (Array.isArray(options[option])) {
          return (
            <div style={{ display: "flex" }}>
              <Inputs
                type={`select(${options[option].join(",")})`}
                label={option}
                onChange={(val) => onChange({ [option]: val })}
                value={config[option]}
              />
            </div>
          );
        } else if (options[option].data) {
          return (
            <div style={{ display: "flex" }}>
              <Inputs
                type={`select(${options[option].data.join(",")})`}
                label={option}
                onChange={(val) => onChange({ [option]: val })}
                value={config[option]}
                multiple={true}
              />
            </div>
          );
        } else if (typeof options[option] === "boolean")
          return (
            <div style={{ display: "flex" }}>
              <Inputs
                type="boolean"
                label={option}
                onChange={(e) => onChange({ [option]: e.target.checked })}
                value={config[option]}
              />
            </div>
          );
        else return null;
      })}
    </Alerts>
  );
}

Configurator.propTypes = {
  /** Whether the Dialog is open */
  open: PropTypes.bool,
  /** List of options */
  options: PropTypes.object,
  /** Current configuration */
  config: PropTypes.object,
  /** Callback fired upon changing a value */
  onChange: PropTypes.func,
  /** Callback fired upon closing the Dialog */
  onClose: PropTypes.func,
  /** Icon displayed on the top bar */
  icon: PropTypes.string,
  /** Title displayed on the top bar */
  title: PropTypes.string,
  /** Key used for LocalStorage configuration saving */
};

Configurator.defaultProps = {
  options: {},
  config: {},
  onChange: () => {},
  onClose: () => {},
};

export default Configurator;