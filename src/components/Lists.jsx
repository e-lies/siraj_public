import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Listed from 'react-smooth-draggable-list';
import { 
    List as Lista, ListItem, ListSubheader, ListItemAvatar, ListItemIcon, ListItemSecondaryAction, ListItemText, Collapse, Avatar, Icon, IconButton, Divider, Checkbox, Tooltip
    } from '@material-ui/core';

export default function Lists(props){
    const { 
        id, schema, data, defaultOrder, idKey, FilterComp, checkedFunctions, title, avatar, primary, secondary, action, listStyle, itemStyle, collapse, draggable, onClick, onOrderChange
    } = props
    const [opened,setOpened] = useState(null)
    const [checked,setChecked] = useState([])
    const [ordre,setOrdre] = useState(defaultOrder)
    useEffect(()=>{
        if(opened){
            //const { top } = document.querySelector(`#listItem${opened}`).getBoundingClientRect();
            document.querySelector(`#listItem${opened}`).scrollIntoView()
        }
    },[opened])
    useEffect(()=>{
        if(defaultOrder){
            setOrdre(defaultOrder)
        }
        else{
            setOrdre(data.map((d,i)=>i))
        }
    },[JSON.stringify(data),JSON.stringify(defaultOrder)])
    useEffect(()=>{
        onOrderChange && onOrderChange(ordre)
    },[JSON.stringify(ordre)])
    
    const DragHandle = (props)=>{
        return(
            <div {...props} style={{ position: "absolute",top: "2px",right: "5px",cursor: "pointer",letterSpacing: "3px",margin:6}}>
            <Icon size="medium"> swap_vert </Icon>
            </div>
        )
    }
    return( 
        <Lista 
            id={id}
            subheader={(
                <div style={{display:'flex'}}>
                    {checkedFunctions && (
                        <Checkbox
                            color={checked.length > 0 ? 'secondary' : 'default'}
                            checked={checked.length > 0}
                            indeterminate={checked.length > 0 && checked.length < data.length}
                            onChange={() => setChecked(checked.length > 0 ? [] : data.map(d=>d[idKey]))}
                            inputProps={{ "aria-label": "select all" }}
                        />
                    )}
                    {checked.length > 0 && checkedFunctions.map(cf=>{
                        return( <IconButton 
                            disabled={cf.cond && !cf.cond(data.filter(d=>checked.includes(d[idKey])))}
                            onClick={()=>cf.fct(data.filter(d=>checked.includes(d[idKey])))}
                        >
                            <Tooltip title={cf.label}>
                                <Icon color={cf.color || 'primary'} style={{fontSize:'1.5em'}}>{cf.icon}</Icon>
                            </Tooltip>
                        </IconButton>

                        )
                    })}
                    {title && (<ListSubheader style={{fontSize:'1em'}}>{title}</ListSubheader>)}
                </div>
            )}
            style={listStyle}
        >
            <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-around'}}>
                {FilterComp}
            </div>
            {data && data.length > 0 && (<div
                id={`ListI${id}`}
                rowHeight={draggable}
                gutter={4}
                order={ordre}
                onReOrder={order=>setOrdre(order)}
            >
            {data.map((list,i)=>{
                return(
                <div key={`listItem${i}`} disabled={!draggable} /*dragHandle={<DragHandle/>}*/>
                    <ListItem id={`listItem${list[idKey]}`} style={itemStyle} onClick={()=>onClick(list)}>
                        {checkedFunctions && (
                            <Checkbox
                                color={checked.includes(list[idKey]) ? 'secondary' : 'default'}
                                checked={checked.includes(list[idKey])}
                                onChange={() => setChecked(checked.includes(list[idKey]) ? checked.filter(ch=>ch!==list[idKey]) : checked.concat(list[idKey]))}
                                inputProps={{ "aria-label": "select this" }}
                            />
                        )}
                        {avatar && (schema.columns && schema.columns[avatar] && schema.columns[avatar].type.includes('image') 
                            ? (<ListItemAvatar key={`avatar${i}`}>
                                <Avatar alt={schema.columns[avatar]['label'] || 'image'} src={list[avatar]} />
                            </ListItemAvatar>)
                            : (<ListItemIcon key={`avatar${i}`}>
                                <Icon>{ list[avatar] }</Icon>
                            </ListItemIcon>)
                        )}
                        <ListItemText 
                            id={`text${list[idKey]}`}
                            primary={primary ? typeof primary === 'string' ? `${list[primary]}${(schema.columns[primary] && schema.columns[primary].suffixe) || ''}` : primary(list) : null} 
                            secondary={secondary ? typeof secondary === 'string' ? `${list[secondary]}${(schema.columns[secondary] && schema.columns[secondary].suffixe) || ''}` : secondary(list) : null}
                        />
                        { action && (
                            <ListItemSecondaryAction>
                                { action(list) }
                            </ListItemSecondaryAction>
                        )}
                        { collapse && <IconButton onClick={()=>setOpened(opened === list[idKey] ? null : list[idKey])}>
                            <Icon size='medium'> {opened === list[idKey] ? 'expand_less' : 'expand_more'} </Icon>
                        </IconButton> }
                    </ListItem>
                    {collapse && (
                        <Collapse 
                            id={`collapse${list[idKey]}`} 
                            in={opened===list[idKey]} 
                            style={{position:'relative'}}
                            timeout='auto' 
                            unmountOnExit
                        >
                            { collapse(list) }
                        </Collapse>
                    )}
                    <Divider variant="middle" component="li" />
                </div>)
            })}
            </div>)}
        </Lista>
    )
}
Lists.propTypes = {
    /** id du composant */
    id: PropTypes.number.isRequired,
    /** Schéma de la rule */
    schema: PropTypes.shape({}),
    /** Array de json à passer en data */
    data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    /** Comopsant de filtrage (from LoadedComponent) */
    FilterComp: PropTypes.element,
    /** Ordre des ListItem par défaut */
    defaultOrder: PropTypes.arrayOf(PropTypes.number),
    /** Callback au changement de check (si undefined, pas de checkbox) */
    checkedFunctions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        icon: PropTypes.string,
        color: PropTypes.string,
        cond: PropTypes.func,
        fct: PropTypes.func
    })),
    /**Clé unique pour identifier chaque ligne */
    idKey: PropTypes.string.isRequired,
    /** Titre de la liste */
    title: PropTypes.string,
    /** Key du titre primaire */
    primary: PropTypes.string,
    /** Key du titre secondaire */
    secondary: PropTypes.string,
    /** Key de l'vatar Image s'il existe */
    avatar: PropTypes.string,
    /** Style de la List */
    listStyle: PropTypes.shape({}),
    /** Styled des items de la liste */
    itemStyle: PropTypes.shape({}),
    /** Props à ajouter à chaque ListItem */
    itemProps: PropTypes.shape({}),
    /** Fonction qui donne le contenu du collapse s'il y en a */
    collapse: PropTypes.func,
    /**Peut-on changer l'ordre des components par DnD */
    draggable: PropTypes.number,
    /** Fonction à éxecuter au click */
    onClick: PropTypes.func,
    /** Callback au changement d'ordre de la liste */
    onOrderChange: PropTypes.func
}
Lists.defaultProps = {
    data:[],
    idKey:'id',
    onClick: List => console.log("List = ",List),
    title:null,
    avatar:null,
    listStyle:{width:'100%'},
    itemStyle:{display:'flex'},
    itemProps:{},
    draggable:undefined
}