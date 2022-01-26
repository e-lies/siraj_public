import React, { useState, useContext, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";
import { Badge, Icon, IconButton } from '@material-ui/core';
import { CrudContext } from '../context/ServerContext';
import LoadedComponent from '../components/LoadedComponent';
import Lists from '../components/Lists';

var idComp;
export default function Reports(){
    const server = useContext(CrudContext)
    const theme = useTheme()
    const { hash } = useParams()
    const [report,setReport] = useState()
    useEffect(()=>{
        server.read(
            [{rule:'Reports',params:{where:[{label:'hash',operator:'=',value:hash}]}}],
            idComp,
            true,
            (dt)=>setReport(dt[0])
        )
    },[])
    let compProps = JSON.parse(report ? report?.props : '{}')
    let compParams = JSON.parse(report && report.params ? report.params : '{}')
    let compState = JSON.parse(report ? report?.paramState : '{}')
    return(<>
        {report && (
        <LoadedComponent
            id={`report${hash}`}
            component={report.component}
            rule={report.rule}
            params={{...JSON.parse(report.params), hash: report.hash}}
            filterKeys={compParams.cols ? compParams.cols.map(cp=>cp.col || cp) : (compProps.chartParams ? Object.values(compProps.chartParams) : [])} //{report.paramState ? JSON.parse(report.paramState)['filters'].map(f=>f.label) : null}
            //filterProps={{confirmation:true}}
            //defaultFilter={compState && compState['filters']}
            //defaultOrder={compState && compState['order']}
            otherProps={{...compProps,title:report.name,defaultFilter:compState && compState['filters'],defaultOrder:compState && compState['order'],filterKeys:[],exports:true}}
        />)}
    </>)
}
