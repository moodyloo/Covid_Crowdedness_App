import React,{Component, useEffect} from 'react';
import {Bar} from 'react-chartjs-2';

function CovidGraph(props) {
	return (
		<Bar data={props.data} options={{maintainAspectRatio: false}} />
	);
}

export default CovidGraph;