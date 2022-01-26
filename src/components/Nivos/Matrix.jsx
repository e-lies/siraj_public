import React from 'react'
import PropTypes from 'prop-types'
import { render } from 'react-dom'
import { ResponsiveHeatMap } from '@nivo/heatmap'

/*let data = [
  {
    "country": "AD",
    "hot dog": 48,
    "hot dogColor": "hsl(165, 70%, 50%)",
    "burger": 87,
    "burgerColor": "hsl(248, 70%, 50%)",
    "sandwich": 1,
    "sandwichColor": "hsl(146, 70%, 50%)",
    "kebab": 25,
    "kebabColor": "hsl(10, 70%, 50%)",
    "fries": 100,
    "friesColor": "hsl(5, 70%, 50%)",
    "donut": 54,
    "donutColor": "hsl(148, 70%, 50%)",
    "junk": 11,
    "junkColor": "hsl(279, 70%, 50%)",
    "sushi": 68,
    "sushiColor": "hsl(116, 70%, 50%)",
    "ramen": 71,
    "ramenColor": "hsl(74, 70%, 50%)",
    "curry": 63,
    "curryColor": "hsl(197, 70%, 50%)",
    "udon": 16,
    "udonColor": "hsl(97, 70%, 50%)"
  },
  {
    "country": "AE",
    "hot dog": 30,
    "hot dogColor": "hsl(19, 70%, 50%)",
    "burger": 82,
    "burgerColor": "hsl(110, 70%, 50%)",
    "sandwich": 28,
    "sandwichColor": "hsl(275, 70%, 50%)",
    "kebab": 88,
    "kebabColor": "hsl(283, 70%, 50%)",
    "fries": 50,
    "friesColor": "hsl(34, 70%, 50%)",
    "donut": 52,
    "donutColor": "hsl(286, 70%, 50%)",
    "junk": 24,
    "junkColor": "hsl(64, 70%, 50%)",
    "sushi": 88,
    "sushiColor": "hsl(67, 70%, 50%)",
    "ramen": 10,
    "ramenColor": "hsl(209, 70%, 50%)",
    "curry": 9,
    "curryColor": "hsl(55, 70%, 50%)",
    "udon": 8,
    "udonColor": "hsl(163, 70%, 50%)"
  },
  {
    "country": "AF",
    "hot dog": 52,
    "hot dogColor": "hsl(282, 70%, 50%)",
    "burger": 54,
    "burgerColor": "hsl(270, 70%, 50%)",
    "sandwich": 31,
    
    "kebab": 8,
    "kebabColor": "hsl(176, 70%, 50%)",
    "fries": 99,
    "friesColor": "hsl(357, 70%, 50%)",
    "donut": 16,
   
    "junk": 26,
    "junkColor": "hsl(298, 70%, 50%)",
    "sushi": 83,
    "sushiColor": "hsl(164, 70%, 50%)",
    "ramen": 37,
    "ramenColor": "hsl(41, 70%, 50%)",
    "curry": 51,
    "curryColor": "hsl(152, 70%, 50%)",
    "udon": 80,
    "udonColor": "hsl(283, 70%, 50%)"
  },
  {
    "country": "AG",
   
    "burger": 51,
    "burgerColor": "hsl(322, 70%, 50%)",
    "sandwich": 60,
    "sandwichColor": "hsl(138, 70%, 50%)",
    "kebab": 5,
    "kebabColor": "hsl(54, 70%, 50%)",
    "fries": 94,
    "friesColor": "hsl(285, 70%, 50%)",
    "donut": 37,
    "donutColor": "hsl(95, 70%, 50%)",
    "junk": 40,
    "junkColor": "hsl(54, 70%, 50%)",
    "sushi": 54,
    "sushiColor": "hsl(248, 70%, 50%)",
    "ramen": 53,
    "ramenColor": "hsl(62, 70%, 50%)",
    "curry": 12,
    "curryColor": "hsl(145, 70%, 50%)",
    "udon": 65,
    "udonColor": "hsl(134, 70%, 50%)"
  },
  {
    "country": "AI",
    "hot dog": 75,
    "hot dogColor": "hsl(134, 70%, 50%)",
    "burger": 47,
    "burgerColor": "hsl(253, 70%, 50%)",
    "sandwich": 89,
    "sandwichColor": "hsl(46, 70%, 50%)",
    "kebab": 62,
    "kebabColor": "hsl(324, 70%, 50%)",
    "fries": 86,
    "friesColor": "hsl(237, 70%, 50%)",
    "donut": 85,
    "donutColor": "hsl(112, 70%, 50%)",
    "junk": 92,
    "junkColor": "hsl(102, 70%, 50%)",
    "sushi": 24,
    "sushiColor": "hsl(168, 70%, 50%)",
    "ramen": 59,
    "ramenColor": "hsl(272, 70%, 50%)",
    "curry": 93,
    "curryColor": "hsl(304, 70%, 50%)",
    "udon": 58,
    "udonColor": "hsl(13, 70%, 50%)"
  },
  {
    "country": "AL",
    "hot dog": 6,
    "hot dogColor": "hsl(127, 70%, 50%)",
    "burger": 45,
    "burgerColor": "hsl(226, 70%, 50%)",
    "sandwich": 63,
    "sandwichColor": "hsl(184, 70%, 50%)",
    "kebab": 21,
    "kebabColor": "hsl(140, 70%, 50%)",
    "fries": 54,
    "friesColor": "hsl(63, 70%, 50%)",
    "donut": 3,
    "donutColor": "hsl(337, 70%, 50%)",
    "junk": 35,
    "junkColor": "hsl(39, 70%, 50%)",
    "sushi": 42,
    "sushiColor": "hsl(79, 70%, 50%)",
    "ramen": 29,
    "ramenColor": "hsl(6, 70%, 50%)",
    "curry": 62,
    "curryColor": "hsl(167, 70%, 50%)",
    "udon": 29,
    "udonColor": "hsl(30, 70%, 50%)"
  },
  {
    "country": "AM",
    "hot dog": 38,
    "hot dogColor": "hsl(108, 70%, 50%)",
    "burger": 24,
    "burgerColor": "hsl(328, 70%, 50%)",
    "sandwich": 73,
    "sandwichColor": "hsl(263, 70%, 50%)",
    "kebab": 22,
    "kebabColor": "hsl(72, 70%, 50%)",
    "fries": 42,
    "friesColor": "hsl(249, 70%, 50%)",
    "donut": 16,
    "donutColor": "hsl(218, 70%, 50%)",
    "junk": 12,
    "junkColor": "hsl(136, 70%, 50%)",
    "sushi": 13,
    "sushiColor": "hsl(322, 70%, 50%)",
    "ramen": 49,
    "ramenColor": "hsl(29, 70%, 50%)",
    "curry": 76,
    "curryColor": "hsl(181, 70%, 50%)",
    "udon": 0,
    "udonColor": "hsl(245, 70%, 50%)"
  },
  {
    "country": "AO",
    "hot dog": 17,
    "hot dogColor": "hsl(196, 70%, 50%)",
    "burger": 75,
    "burgerColor": "hsl(230, 70%, 50%)",
    "sandwich": 38,
    "sandwichColor": "hsl(110, 70%, 50%)",
    "kebab": 52,
    "kebabColor": "hsl(33, 70%, 50%)",
    "fries": 27,
    "friesColor": "hsl(121, 70%, 50%)",
    "donut": 44,
    "donutColor": "hsl(33, 70%, 50%)",
    "junk": 0,
    "junkColor": "hsl(236, 70%, 50%)",
    "sushi": 11,
    "sushiColor": "hsl(28, 70%, 50%)",
    "ramen": 27,
    "ramenColor": "hsl(115, 70%, 50%)",
    "curry": 97,
    "curryColor": "hsl(129, 70%, 50%)",
    "udon": 34,
    "udonColor": "hsl(249, 70%, 50%)"
  },
  {
    "country": "AQ",
    "hot dog": 81,
    "hot dogColor": "hsl(77, 70%, 50%)",
    "burger": 20,
    "burgerColor": "hsl(61, 70%, 50%)",
    "sandwich": 65,
    "sandwichColor": "hsl(171, 70%, 50%)",
    "kebab": 24,
    "kebabColor": "hsl(23, 70%, 50%)",
    "fries": 99,
    "friesColor": "hsl(293, 70%, 50%)",
    "donut": 61,
    "donutColor": "hsl(251, 70%, 50%)",
    "junk": 48,
    "junkColor": "hsl(117, 70%, 50%)",
    "sushi": 17,
    "sushiColor": "hsl(298, 70%, 50%)",
    "ramen": 86,
    "ramenColor": "hsl(134, 70%, 50%)",
    "curry": 71,
    "curryColor": "hsl(320, 70%, 50%)",
    "udon": 38,
    "udonColor": "hsl(231, 70%, 50%)"
  }
]; */

const Matrix = props =>{
	const { data, index, Y, keys, onPointClick, width, height } = props;
  const haut = data.length;
  const long = data.reduce((a,c)=>Math.max(Object.keys(c).length,a),0)
	return(
	  <div 
      id="chartMatrix"
      style={{height:200+haut*30, width:(document.body.clientWidth > 400 ? 200 : 100) + long*100,overflowY:'scroll',paddingRight:24}}
    >
		<ResponsiveHeatMap
        data={data}
        keys={keys}
        indexBy={index}
        onClick={onPointClick}
        margin={{
            "top": 73,
            "right": 87,
            "bottom": 40,
            "left": 114
        }}
        forceSquare={false}
        sizeVariation={0.6}
        padding={0}
        colors="nivo"
        axisTop={{
            "orient": "top",
            "tickSize": 6,
            "tickPadding": 8,
            "tickRotation": 45,
            "legend": "",
            "legendOffset": -18
        }}
        axisRight={null}
        axisBottom={{
            "orient": "bottom",
            "tickSize": 5,
            "tickPadding": 5,
            "tickRotation": -45,
            "legend": index,
            "legendPosition": "middle",
            "legendOffset": 36
        }}
        axisLeft={{
            "orient": "left",
            "tickSize": 5,
            "tickPadding": 5,
            "tickRotation": 0,
            "legend": Y,
            "legendPosition": "left",
            "legendOffset": 0
        }}
        enableGridX={true}
        enableGridY={true}
        cellShape="circle"
        cellOpacity={0.7}
        enableLabels={long*haut < 40}
        labelTextColor="inherit:darker(2.5)"
        defs={[
            {
                "id": "lines",
                "type": "patternLines",
                "background": "inherit",
                "color": "rgba(0, 0, 0, 0.1)",
                "rotation": -45,
                "lineWidth": 4,
                "spacing": 7
            }
        ]}
        fill={[
            {
                "id": "lines"
            }
        ]}
        animate={true}
        motionStiffness={240}
        motionDamping={9}
        hoverTarget="cell"
        cellHoverOpacity={0.95}
        cellHoverOthersOpacity={0.25}
    /></div>
	)
}
Matrix.propTypes = {
	keys: PropTypes.array.isRequired,
  click: PropTypes.func,
  index: PropTypes.string,
  onPointClick: PropTypes.func,
  height: PropTypes.number,
  width: PropTypes.number,
}
Matrix.defaultProps = {
  width: '100%',
  height: 400,
  click : e => {return false},
  onPointClick: e=>console.log(e)
}
export default Matrix;