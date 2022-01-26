import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles(theme => ({
	panel:{ backgroundColor: theme.palette.background.default,
		padding:'10px',
		overflow:'visible' },
}))

const Panel = props =>{
	const { jsn, fct, icon, parent, classen } = props; //classe pour ajuster le CSS d'un niveau
	const classes = useStyles();
	return Object.keys(jsn).includes("children") ? 
		(
		 <ExpansionPanel style={{width:'90%'}} >
        	<ExpansionPanelSummary className={classen[0]} expandIcon = {<Icon> {icon} </Icon>}>
				{ fct(jsn,parent) }
        	</ExpansionPanelSummary>
			<ExpansionPanelDetails className={classen[1]}> 
				{ props.children }
			</ExpansionPanelDetails>
		</ExpansionPanel>
        )
        :
		(<>{ fct(jsn,parent) }</>)
       // ( <div style={{display:'block',width:'100%'}}> {fct(jsn,parent)} </div> )
}

export default function Accordion(data=[],functions=[], levelClasses=[], icon="expand_more", depth=0, parentData={}){
	return(
	 <Fragment>
		{
			data.map(jsn=>{
				return(
				 <Panel jsn={jsn} fct={functions[depth]} parent={parentData} icon={icon} classen={[levelClasses[depth],levelClasses[depth+1]] || null} >
					{ Accordion(jsn['children'],functions,levelClasses,icon,parseInt(depth+1),jsn) }
				</Panel> )
			})			
		}
	 </Fragment>
	)
}
/* Exemple :
	let accord = [{classe:'geeks',children:[{id:3,name:'rasha',children:[{age:24,children:[{lev:14},{lev:17}]}]},{id:4,name:'ilyes'}]},{classe:'sedd',children:[{id:7,name:'salim'},{id:8,name:'omar'}]}]
    let cls = cl =>{ return <span style={{width:'100%',backgroundColor:'blue'}} > *{cl.classe} </span> }
    let cont = jsn =>{ return <p style={{color:'red'}} > {jsn['id']*2+jsn['name']} eza rfez fedfsgez gzrgsg erggrgerfreer r tegfgeg ergerjkgkf hkj gretrhyhgfdftryht789456g4tr4h1gd3f504er6g54dfgd </p> }
    let miage = a =>{ return <a href="#">{a/2}</a> }
    let level = l => { return 25 }
	.......
	<div....>
	{ Accordion(accord,[cls,cont,miage,level]) }
	............
	</div>  */
