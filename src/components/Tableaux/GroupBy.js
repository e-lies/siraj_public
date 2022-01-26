import React, { Component, useReducer, useEffect, useContext } from "react";
import Select from "react-select";
import * as fcts from '../../reducers/Functions';
import { ContextForms } from '../../context/Forms';
import { IconButton, Icon, Tooltip, Typography, FormControl, FormLabel } from '@material-ui/core';
import ClientTab from './ClientTab';
import Alerts from '../Alerts';
import Charts from './Charts';
import { useSize } from '../../reducers/Hooks';
import { ExportToCsv } from 'export-to-csv';

const options = { 
	fieldSeparator: ';',
	quoteStrings: '"',
	decimalSeparator: '.',
	showLabels: true, 
    showTitle: true,
	title: 'My Awesome CSV',
	useKeysAsHeaders: true,
  };
const handleExport = data =>{
	let name = window.prompt("Comment souhaitez-vous nommer le fichier qui contiendra ces "+data.length+" enregistrements?");		
	if(name && name !== null){
		let opt = {...options}
		opt['title'] = "Export de "+data.length+" enregistrements";
		opt['filename'] = name;
		const csvExporter = new ExportToCsv(opt);
		 csvExporter.generateCsv(data);
	 }
}

function reducer(state,action){
	switch(action.type){
		case "groupCols" :
			let groupCols = action.groupCols.map(g=>g.value)
			return {...state,groupCols}
		
		case "newOp" :
			return {...state,opCols:state.opCols.concat({col:null,op:null,label:null})}
		
		case "deleteOp" :
			let opCols = [...state.opCols]
			opCols.splice(action.index,1)
			return {...state,opCols}
		
		case "opCols" :
			let opc = [...state.opCols]
			if(action.oc === 'op'){ opc[action.index]['label'] = action.label }
			opc[action.index][action.oc] = action.value
			return {...state,opc}
		
		case "data" :
			return {...state,groupedData:action.data,groupedColumns:action.columns}
		
		case "params":
			return {...state,params:action.params}
			
		case "fonction" :
			return {...state,chart:action.fonction,dataFonction:action.data}
		
		default : return false
	}
}

const GroupBy = props =>{
	const { columns, data, rule, whereParams } = props
	const forms = useContext(ContextForms)
	//groupedColumns est le l'équivalent du schema.columns pour le tableau groupé
	const [state,dispatch] = useReducer(reducer,{groupCols:[],opCols:[],groupedData:[],groupedColumns:{},fonction:null})
	const { width } = useSize()
	useEffect(()=>{ if(state.groupCols.length > 0){
		let fct = fcts.nestData(state.groupCols)
		let grps = fct(data);
		for(let i = 0; i < grps.length; i++){
			state.opCols.map(oc=>{ if(oc.col && oc.op){
				//let opLabel = operations[fcts.globalType(columns[oc.col]['type'])].filter(p=>p.value===oc.op)[0]['label']
				grps[i][oc.op+"("+oc['col']+")"] = grps[i]['children'][oc['op']](oc['col'])
			  }
			  return false
			})
		}
		let grpData = [...grps];
		grpData.forEach(g=>{ delete g['children'] })
		//recréer les columns du new tableau
		let groupedColumns = new Object();
		state.groupCols.forEach(gc=>{ groupedColumns[gc] = columns[gc] })
		state.opCols.forEach(oc=>{
		 	if(oc.col !== null && oc.op !== null){
		 	 let op = operations[fcts.globalType(columns[oc.col]['type'])]
			 groupedColumns[oc.op+"("+oc.col+")"] = {label:oc.label+"("+(columns[oc.col]['label'] || oc.col)+")",type:columns[oc.col].type}
			}	
		})
		dispatch({type:'data',data:grpData,columns:groupedColumns})
		}
	},[JSON.stringify(state.groupCols),JSON.stringify(state.opCols)])
	
	const options = Object.keys(columns).map(col=>{
		return  {label:columns[col]['label'] || col,value:col}
	})
	const operations = {number:[
		{label:'Minimum',value:'minim'},{label:'Maximum',value:'maxim'},{label:'Somme',value:'sum'},{label:'Moyenne',value:'avg'},{label:'Médiane',value:'median'}
		],
		date:[
			{label:'Minimum',value:'minim'},{label:'Maximum',value:'maxim'},{label:'Moyenne',value:'avgDate'},{label:'Médiane',value:'medianDate'}
		],
		time:[
			{label:'Minimum',value:'minim'},{label:'Maximum',value:'maxim'},{label:'Moyenne',value:'avgDate'},{label:'Médiane',value:'medianDate'}			
		],
		text:[
			{label:'Différents',value:'count'}
		]		
	}
	const functions = width > 480 ? [
		{icon:'pie_chart',title:'Camembert',fonction:'pie',fct:dat=>dispatch({type:'fonction',data:dat,fonction:'pie'})},
		{icon:'bar_chart',title:'Diagramme',fonction:'bar',fct:dat=>dispatch({type:'fonction',data:dat,fonction:'bar'})},
		{icon:'multiline_chart',title:'Courbes',fonction:'line',fct:dat=>dispatch({type:'fonction',data:dat,fonction:'line'})},
		{icon:'wifi_tethering',title:'Radar',fonction:'radar',fct:dat=>dispatch({type:'fonction',data:dat,fonction:'radar'})},
		{icon:'view_comfy',title:'Matrice',fonction:'matrix',fct:dat=>dispatch({type:'fonction',data:dat,fonction:'matrix'})}
	] : [{icon:'multiline_chart',title:'Graphes',fct:data=>dispatch({type:'fonction',data,fonction:'charts'})}]
	const opTranslation = op=>{
		switch (op) {
			case 'maxim':
				return 'max'
			case 'minim':
				return 'min'
			case 'avgDate':
				return 'avg'
			default:
				return op;
		}
	}
	const saveReport = (chart,form)=>{
		let cols = [
			...state.groupCols.map(gc=>{return {col:gc}}),
			...state.opCols.filter(oc=>oc.op && oc.col).map(oc=>{return {col:oc['col'],alias:oc.op+"("+oc['col']+")",op:opTranslation(oc.op)}})
		]
		forms.addForm("insert","Reports",{
			defaultData:[
				{component:'./Tableaux/Charts',
				 rule,
				 params:JSON.stringify({where:whereParams && whereParams['where'] ? whereParams['where'] : [],group:state.groupCols,cols}),
				 paramState:JSON.stringify(state.params),
				 props:JSON.stringify({title:'',type:chart,chartParams:form})
				}
			],
			hidden:['component','rule','params','paramState','props'],
			callback: (rep,st)=>{
				if(st < 400){
					alert("Ajout du rapport réussi")
					forms.removeForm("insert","Reports")
				}
				else{ alert("Une erreur s'est produite lors de la création du rapport !") }
			}
		})
	}

	return(
		<div>
		<div id="grouping" style={{display:'flex',justifyContent:'start'}}>
			<FormControl component="fieldset" style={{minWidth:'312px'}} >
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
	            onChange={ e=>{dispatch({type:'groupCols',groupCols:e})} }
	            label="Choisir"
	            options={options}
	            fullWidth
	         // styles={customStyles}
	            value={options.filter(opt=>state.groupCols.includes(opt.value))}
	          />
	        </FormControl>
	        <Tooltip title="Ajouter une colonne de calcul">
	        	<IconButton onClick={e=>dispatch({type:'newOp'})} color="primary"><Icon fontSize="large">add</Icon></IconButton>
	        </Tooltip>
			<div id="opCols" style={{width:'100%',display:'flex'}} >
			{ state.opCols.map((oc,i) =>{
				return(
					<div key={`oc${i}`} style={{marginLeft:'15px'}} >
					<FormControl component="fieldset" style={{minWidth:'200px',minHeight:'125px',display:'flex',flexDirection:'column',justifyContent:'space-around'}} >
						<FormLabel component="legend">
						 <IconButton color="secondary" onClick={e=>dispatch({type:'deleteOp',index:i})}><Icon>delete</Icon></IconButton>
						 	Calcul {i}
						</FormLabel>
						<Select key={`col${i}`}
							fullWidth
							isSearchable={false}
							placeholder="Choisir une colonne"
							required
							options={options.filter(opt=>Object.keys(operations).includes(fcts.globalType(columns[opt['value']]['type'])) ) }
							value={options.filter(opt=> opt.value === oc['col'])[0] || null}
							onChange={ e=>dispatch({type:'opCols',oc:'col',index:i,value:e.value}) }			
						/>
						<Select key={`op${i}`}
							fullWidth
							isSearchable={false}
							placeholder="Choisir une opération"
							required
							options={state.opCols[i]['col'] !== null ? operations[fcts.globalType(columns[state.opCols[i]['col']]['type'])] : []}
							value={state.opCols[i]['col'] !== null ? operations[fcts.globalType(columns[state.opCols[i]['col']]['type'])].filter(ope=> ope.value === oc['op'])[0] : null}
							onChange={ e=>dispatch({type:'opCols',oc:'op',index:i,label:e.label,value:e.value}) }			
						/>
					</FormControl>
					</div>
				)				
			})}
			</div>
			</div>
			{state.groupedData.length > 0 &&(
				<ClientTab 
					schema={{columns:state.groupedColumns}}
					data={state.groupedData}
					filterKeys={[]}
					onChangeParams={(params)=>dispatch({type:'params',params})}
					checkedFunctions={[
						...functions,
						{icon:'cloud_download',title:'Exporter',fct:data=>handleExport(data)}
					]}
				/>
			)}
			<Alerts 
				id="dialogCharts"
				//draggable={width > 520 && ["bar","line","matrix"].includes(state.fonction) ? false : true}
				fullScreen
				open={state.chart}
				handleClose={()=>dispatch({type:"fonction",fonction:null})}
				headerFooterFormat={{classes:{margin:0,padding:0}}}	//{state.functions.filter(f=>f.fonction===state.fonction)[0]}
			>
				<Charts 
					type={state.chart} 
					schema={{columns:state.groupedColumns}}
					data={state.dataFonction} 
					saveReport={saveReport}
				/>
			</Alerts>
		</div>
	)
}
export default GroupBy