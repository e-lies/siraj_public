import React, { Fragment, useEffect, useState, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import { ContextSessions } from "./context/SessionContext";
//import { Cards } from "./context/AllCards";
import ResetPsw from "./ResetPsw";
import Alerts from "./components/Alerts";
import {
  IconButton,
  Dialog,
  Divider,
  Avatar,
  Card,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  CardHeader,
  Button,
} from "@material-ui/core";
import Unsent from "./Unsent";
import OutlinedIcon from "./components/OutlinedIcon";
import Bouttons from "./components/Bouttons";
import { path } from "./context/Params";

const useStyles = makeStyles((theme) => ({
  iconButton: {
    backgroundColor: "#F1F3F3",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.04)",
    borderRadius: 10,
    padding: 0,
    margin: 12,
  },
}));

const Profile = ({ open, onClose }) => {
  const classes = useStyles();
  const theme = useTheme();
  const session = useContext(ContextSessions);
  //const cards = useContext(Cards);
  const [gps, setGps] = useState(false);
  const [micro, setMicro] = useState(false);
  const [psw, setPsw] = useState(false);
  const goHome = () => {
    return <Redirect to={`${path}/${session.session.role}/Accueil`} />;
  };

  function resetPsw() {
    setPsw(true);
  }
  /*	useEffect(()=>{
		navigator.mediaDevices.getUserMedia({ audio: micro })
	},[micro])*/
  return (
    <Dialog open={open} onClose={onClose}>
      <Card>
        <CardHeader
          style={{
            alignSelf: "center",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          avatar={
            <div
              style={{
                alignSelf: "center",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Avatar
                style={{
                  width: 69,
                  height: 69,
                  margin: 10,
                  backgroundColor: "#c4c4c4",
                }}
              >
                {session.session.userName &&
                  session.session.userName.split(" ").reduce((acc, cur) => {
                    return acc + cur[0];
                  }, "")}
              </Avatar>
              <div
                className={!open.open && classes.hide}
                style={{ margin: 10 }}
              >
                <Typography
                  variant="span"
                  style={{
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "17px",
                  }}
                >
                  {session.session.userName}
                </Typography>
                <br />
                <Typography
                  variant="span"
                  style={{
                    fontSize: "10px",
                    lineHeight: "12px",
                    color: "#828282",
                    margin: "7.5px",
                  }}
                >
                  Description
                </Typography>
              </div>
            </div>
          }
          action={
            <>
              {session.session.role === "Technicien" && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={gps}
                      onChange={(e) => setGps(!gps)}
                      //value={state.grouped}
                      color="primary"
                    />
                  }
                  label="GPS actif"
                />
              )}
              <FormControlLabel
                control={
                  <Switch
                    checked={micro}
                    onChange={(e) => setMicro(!micro)}
                    //value={state.grouped}
                    color="secondary"
                  />
                }
                label="Microphone actif"
              />
            </>
          }
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-evenly",
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <div style={{ display: "flex" }}>
            <List style={{ width: 270 }}>
              <ListItem button key="Accueil" onClick={(e) => goHome()}>
                <ListItemIcon>
                  <IconButton className={classes.iconButton}>
                    {" "}
                    <OutlinedIcon fontSize="large">home</OutlinedIcon>{" "}
                  </IconButton>
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="subtitle1"> Accueil </Typography>
                </ListItemText>
              </ListItem>
              <ListItem
                button
                key="userInfos"
               /* onClick={(e) => {
                  cards.addCard("Infos", session.session.idUser);
                }}*/
              >
                <ListItemIcon>
                  <IconButton className={classes.iconButton}>
                    {" "}
                    <OutlinedIcon fontSize="large">
                      account_box
                    </OutlinedIcon>{" "}
                  </IconButton>
                </ListItemIcon>
                <ListItemText>
                  <Typography color="inherit" variant="subtitle1">
                    {" "}
                    Compte{" "}
                  </Typography>
                </ListItemText>
              </ListItem>
              <ListItem button key="restPsw" onClick={() => resetPsw()}>
                <ListItemIcon>
                  <IconButton className={classes.iconButton}>
                    {" "}
                    <OutlinedIcon fontSize="large">lock</OutlinedIcon>{" "}
                  </IconButton>
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="subtitle1"> Mot de passe </Typography>
                </ListItemText>
              </ListItem>
            </List>

            {/*cols.map((text, index) => {let cls=checkedIcon(text) ? classes.checked : classes.unchecked;
                return(<ListItem button key={text} onClick={()=>changeVisibility(text)} >
                <ListItemIcon className={cls} > <IconButton aria-label="colonnes">
                {checkedIcon(text) ? <OutlinedIcon className={classes.checked}>{visibleIcon}</OutlinedIcon> : <OutlinedIcon className={classes.unchecked}>{hiddenIcon}</OutlinedIcon> }
                </IconButton></ListItemIcon>
                <Typography variant="subtitle2" className={cls}>{text}</Typography>
                </ListItem>)}
              )*/}
            <Unsent />
          </div>
        </div>
      </Card>
      <Alerts
        id="alertPsw"
        open={psw}
        draggable
        width={250}
        handleClose={(e) => setPsw(false)}
        headerFooterFormat={{
          title: " Modifier votre mot de passe ",
          icon: "vpn_key",
          classes: classes.psw,
        }}
      >
        <ResetPsw clbk={() => setPsw(false)} />
      </Alerts>
    </Dialog>
  );
};
export default Profile;
