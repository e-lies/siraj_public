import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Alerts from './Alerts';
import 
    { IconButton, Icon, List, ListItem, ListItemText, ListItemIcon, Checkbox, ListItemSecondaryAction, Typography }
    from '@material-ui/core';

export default function LocalSaves(props){
    const { storageKey, /*group,*/ title, open, stateToSave, onLoadSave, onClose } = props;
    const [saves,setSaves] = useState([]) //[{ label:'save27-01', value:[{name:'ilias',age:36},....]}]
    const [selected,setSelected] = useState(null)
    useEffect(()=>{
        let sv = localStorage.getItem(storageKey)
        if(sv){
            let parsed = JSON.parse(sv)
            setSaves(parsed)
            let def = parsed.find(p=>p.default)
            if(def){ //charger le defaultSave au démarrage du component
                onLoadSave(def)
            }
        }
        else{
            localStorage.setItem(storageKey,"{}")
        }
    },[])
    useEffect(()=>{
        localStorage.setItem(storageKey,JSON.stringify(saves))
    },[JSON.stringify(saves)])

    const insertSave = ()=>{
        let label = window.prompt("Entrez le nom de la sauvegarde: ")
        if(saves.findIndex(s=>s.label===label) < 0){
             setSaves(saves.concat({label,default:false,value:stateToSave}))
         }
        else{
            let conf = window.confirm("Nom déjà utilisé ! \n Veuillez en choisir un autre...")
            if(conf){ insertSave() }
        }
        let sameValue = saves.findIndex(s=>JSON.stringify(s.value)===JSON.stringify(stateToSave))
        if(sameValue >= 0){
            let conf = window.confirm("La valeur sauvegardée est la même que celle de la sauvegarde "+saves[sameValue]['label']+"\n Souhaitez-vous l'écraser ?")
            if(conf){ 
                let sv = [...saves];
                sv[sameValue]['label'] = label; 
                setSaves(sv)
            }
        }
    }
    const removeSave = (label)=>{
        let conf = window.confirm("êtes-vous sûr de vouloir supprimer cette sauvegarde ?")
        if(conf){ setSaves(saves.filter(s=>s.label!==label)) }
    }
    const defaultSave = (label)=>{
        let sv = [...saves]
        if(sv[saves.findIndex(s=>s.default)]){ //au cas ou il y a déjà une config par défaut
           delete  sv[saves.findIndex(s=>s.default)]['default']
        }
        console.log(label,saves)
        sv[saves.findIndex(s=>s.label===label)]['default'] = true
        setSaves(sv)
        alert("La configuration "+label+" est maintenant par défaut")
    }
    return(
        <React.Fragment>
            <Alerts
                type="confirm"
                open={open}
                handleClose={onClose}
                draggable
                headerFooterFormat={{title,icon:'save',footer:[<span></span>]}}
                onOk={insertSave}
            >   
                <IconButton
					color="primary" 
					onClick={insertSave}
				>
					<Icon fontSize="large"> add_circle </Icon>
				</IconButton>
                <List>
                {
                    saves.map((save,i)=>{
                        return(
                            <ListItem button selected={selected===save.label} onClick={()=>{setSelected(save.label);onLoadSave(save)}}>
                                <ListItemIcon> 
                                    <Icon size="medium" onClick={()=>removeSave(save['label'])} color="error"> delete </Icon>
                                </ListItemIcon>
                                <ListItemText primary={save['label']} />
                                {save['default'] && <Typography variant='subtitle2'>Défaut</Typography>}
                                <IconButton onClick={()=>defaultSave(save['label'])}>
                                    <Icon color={save['default'] ? "primary" : "disabled"}>check_circle</Icon>
                                </IconButton>
                            </ListItem>
                        )
                    })
                }
                </List> 
            </Alerts>
        </React.Fragment>
    )
}

LocalSaves.propTypes = {
    /** Nom du storage dans localStorage */
    storageKey: PropTypes.string.isRequired,
    /** Titre du storage */
    title: PropTypes.string,
    /** L'interface avec les sauvegardes est-elle ouverte */
    open: PropTypes.bool,
    /** La variable d'environnement à sauvegarder (souvent un state) */
    stateToSave: PropTypes.object.isRequired,
    /** Callback au clique sur une des valeur sauvegardées */
    onLoadSave: PropTypes.func.isRequired,
    /** Callback à la fermeture de l'Alert */
    onClose: PropTypes.func
}
LocalSaves.defaultProps = {
    group: undefined,
    title: 'Sauvegardes',
    open:false,
    onLoadSave:(save)=>console.log("save = ",save)
}
