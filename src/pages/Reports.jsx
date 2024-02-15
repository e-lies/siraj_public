import React, { useState, useContext, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";
import { CrudContext } from '../context/ServerContext';
import LoadedComponent from '../components/LoadedComponent';
import Lists from '../components/Lists';

var idComp;
export default function Reports(){
    const server = useContext(CrudContext)
    const theme = useTheme()
    const { hash, title } = useParams()
    const [reports,setReports] = useState([])
    useEffect(()=>{
        let hs = hash.split('_')
        server.read(
            [{rule:'Reports',params:{where:[{label:'hash',operator:'in',value:hs}]}}],
            idComp,
            true,
            (dt)=>setReports(dt.reduce((acc,cur)=>{
                let pos = hs.indexOf(cur['hash'])
                acc[pos] = cur
                return acc
            },[]))
        )
    },[])
    
    return(<>
        <h4 style={{width:'100%',display:'flex', justifyContent:'space-around',textDecoration:'underline' ,color:theme.palette.primary.main}}> {title} </h4>
        {reports.map(report=>{
            let compProps = JSON.parse(report ? report?.props : '{}')
            let compParams = JSON.parse(report && report.params ? report.params : '{}')
            let compState = JSON.parse(report ? report?.paramState : '{}')
            return (<div>
                    {report.public === 1 ? (<LoadedComponent
                        id={`report${hash}`}
                        component={report.component}
                        rule={report.rule}
                        params={{...JSON.parse(report.params), hash: report.hash}}
                        filterKeys={compParams.cols ? compParams.cols.map(cp=>cp.col || cp) : (compProps.chartParams ? Object.values(compProps.chartParams) : [])} //{report.paramState ? JSON.parse(report.paramState)['filters'].map(f=>f.label) : null}
                        //filterProps={{confirmation:true}}
                        //defaultFilter={compState && compState['filters']}
                        //defaultOrder={compState && compState['order']}
                        otherProps={{...compProps,title:report.name,defaultFilter:compState && compState['filters'],defaultOrder:compState && compState['order'],filterKeys:[],exports:true}}
                    />)
                    : (<h3> Accès non autorisé ! </h3>)
                }
                </div>)
        }) }
    </>)
}
