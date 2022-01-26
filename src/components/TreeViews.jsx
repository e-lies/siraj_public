import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { TreeView, TreeItem } from "@material-ui/lab";
import { Typography } from "@material-ui/core";
import { indexation } from "../reducers/Functions";
import clsx from "clsx";
import Icon from "./OutlinedIcon";

const useTreeItemStyles = makeStyles((theme) => ({
  root: {
    "&.Mui-selected > $content $label, &.Mui-selected:focus > $content $label": {
      backgroundColor: "unset",
    },
    color: theme.palette.text.secondary,
  },
  content: ({ nodeId, open, selected }) => ({
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightMedium,
    "$expanded > &": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    width: `calc(100% - ${theme.spacing(nodeId.length)}px)`,
    paddingLeft: open ? theme.spacing(nodeId.length - 1) : 0,
    backgroundColor:
      selected && open ? theme.palette.action.selected : "transparent",
  }),
  group: {
    marginLeft: 0,
    marginBottom: 10,
    padding: 10,
  },
  expanded: ({ open, selected }) => ({}),
  label: {
    fontWeight: "inherit",
    color: "inherit",
  },
  labelRoot: ({ selected, open }) => ({
    display: "flex",
    alignItems: "center",
    color: selected ? theme.palette.primary.main : "inherit",
  }),
  labelIcon: ({ open, selected }) => ({
    marginRight: open ? theme.spacing(1) : 0,
    borderRadius: "100%",
    backgroundColor:
      selected && !open ? theme.palette.action.selected : "transparent",
  }),
  labelText: {
    fontWeight: "inherit",
    flexGrow: 1,
  },
}));

function StyledTreeItem(props) {
  const {
    labelText,
    labelIcon,
    labelInfo,
    color,
    bgColor,
    onClick,
    nodeId,
    open,
    classes: {
      labelRoot,
      root,
      content,
      expanded,
      group,
      label,
      iconContainer,
      icon,
    },
    selected,
    ...other
  } = props;
  const classes = useTreeItemStyles({ nodeId, open, selected });
  return (
    <TreeItem
      onClick={onClick}
      label={
        <div className={clsx(classes.labelRoot, labelRoot)}>
          <Icon className={clsx(classes.labelIcon, icon)}>{labelIcon}</Icon>{" "}
          {open && labelText}
        </div>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
      classes={{
        root: clsx(classes.root, root),
        content: clsx(classes.content, content),
        expanded: clsx(classes.expanded, expanded),
        group: clsx(classes.group, group),
        label: clsx(classes.label, label),
        iconContainer: clsx(classes.iconContainer, iconContainer),
      }}
      nodeId={nodeId}
      {...other}
    />
  );
}

export default function TreeViews(props) {
  // onClickReducer: sera un reducer qui prendra en entrée la json du node, l'index de celui-ci et le schema (qu'il pourra éventuellement passer par 1 switch/case) et donnera la fct onClick en sortie
  // labelReducer: meme chose mais pour l'affichage à mettre dans le node
  const {
    schema,
    data,
    icon,
    select,
    labelReducer,
    styleReducer,
    onClickReducer,
    open,
    selected,
    classes: propClasses,
    ...others
  } = props;
  const handleClick = (node) => {
    onClickReducer(node, schema);
  };
  const displayNode = (node) => {
    if (!node.index) {
      node = indexation(node);
    }
    const isSelected =
      selected && JSON.stringify(node.index) === JSON.stringify(selected);
    return node.children ? (
      <StyledTreeItem
        nodeId={node.index.join("")}
        labelIcon={node.icon || null}
        labelText={labelReducer(node, schema, selected)}
        onClick={() => handleClick(node)}
        style={styleReducer && styleReducer(node, isSelected)}
        selected={isSelected}
        classes={propClasses}
        open={open}
      >
        {node.children.map((n) => displayNode(n))}
      </StyledTreeItem>
    ) : (
      <StyledTreeItem
        nodeId={node.index.join("")}
        labelIcon={node.icon || null}
        //labelInfo={node.label || null}
        labelText={labelReducer(node, schema, selected)}
        onClick={() => handleClick(node)}
        style={styleReducer && styleReducer(node, isSelected)}
        classes={propClasses}
        selected={isSelected}
        open={open}
      />
    );
  };
  return (
    <TreeView
      style={{ width: "100%" }}
      classes={{ root: propClasses.treeViewRoot }}
      {...others}
    >
      {data.map((node) => displayNode(node))}
    </TreeView>
  );
}

TreeViews.propTypes = {
  schema: PropTypes.shape({}),
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  icon: PropTypes.string,
  labelReducer: PropTypes.func,
  onClickReducer: PropTypes.func,
  /** Whether to show icons only, or labels and indentation aswell. Useful for MenuAppBar */
  open: PropTypes.bool,
  classes: PropTypes.shape({}),
  /** Index of the currently selected entry */
  selected: PropTypes.array,
};

TreeViews.defaultProps = {
  schema: {},
  icon: "icon",
  labelReducer: (jsn, ind) => <></>,
  onClickReducer: (jsn, index, schm) =>
    console.log("jsn = ", jsn, " index = ", index, " schema = ", schm),
  defaultExpanded: [],
  defaultCollapseIcon: <Icon>arrow_drop_down</Icon>,
  defaultExpandIcon: <Icon>arrow_right_icon</Icon>,
  defaultEndIcon: <div style={{ width: 24 }} />,
  open: true,
  classes: {},
};