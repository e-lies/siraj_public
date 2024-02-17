import React, { useState, useEffect } from 'react';
//import Lists from "../components/Lists";
import { Bar } from '@nivo/bar';

export default function Ranking(props){
    const { title, schema, data, index } = props;
    const [ranking,setRanking] = useState([])
    
    useEffect(()=>{
        setRanking(data.reverse().map((d,i)=>{return { group: Array.isArray(index) ? index.map(ind=>d[ind]).join(' * ') : d[index], rank:parseInt(i+data.length)} }))
    },[data,schema])
    
    const labelFunction = d=> `${(ranking.length*2)-d.value}. ${d.data['group']}`

    return(
        <div style={{fontWeight:'bold',fontSize:24}}>
            <h3 style={{ marginLeft: 60, fontWeight: 400, color: '#555' }}>
                {title}
            </h3>
            <Bar
                width={document.body.clientWidth-20}
                height={data.lenth > 10 ? data.length*32 : (data.length > 5 ? data.length*64 : data.length*128)}
                layout="horizontal"
                margin={{ top: 26, right: 120, bottom: 26, left: 60 }}
                data={ranking}
                indexBy="group"
                keys={['rank']}
                colors={{ scheme: 'set3' }}
                colorBy="indexValue"
                borderColor={{ from: 'color', modifiers: [['darker', 2.6]] }}
                enableGridX
                enableGridY={false}
                axisTop={null}
                axisBottom={null}
                axisLeft={{
                    format: v =>'', //`${v?.toString().split(' ').map(vv=>vv[0]).join('.')}`, //keys.reduce((a,c)=>{return a.concat(v[c]) },[]).join(' _ ')
                    tickSize: 1,
                    tickPadding: 8,
                    tickRotation: 30,
                    legend: index,
                    legendPosition: 'middle',
                    legendOffset: -45
                }}
                padding={0.6}
                labelTextColor={{ from: 'color', modifiers: [['darker', 0.9]] }}
                isInteractive={false}
                label={labelFunction}
                //barComponent={BarComponent}
            />
        </div>
    )
}

Ranking.defaultProps = {
    data: []
}