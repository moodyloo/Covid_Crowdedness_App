import React,{Component} from 'react';
import CovidGraph from './CovidGraph.js'

class Graph extends Component {
	constructor() {
		super();
		this.state = {
			filteredData: [],
			crowdPerHour: {
				labels:["0am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am",
		"11am","12am","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm"],
				datasets:[
					{
						label:'Number of People',
						data:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
					}
				]
			}
		}
		this.filterLocation = this.filterLocation.bind(this);
		this.convertEpochToLocal = this.convertEpochToLocal.bind(this);
		this.filterDateAndTime = this.filterDateAndTime.bind(this);
	}
	
	convertEpochToLocal(x) {
		var newFilteredData = [];
		x.forEach((ins)=>{
			var dateTime = new Date(parseFloat(ins.time));
			console.log(dateTime);
			var year = dateTime.getUTCFullYear();
			var month = dateTime.getMonth()+1;
			var day = dateTime.getDate();
			var hour = dateTime.getUTCHours();
			newFilteredData.push({id:ins.id,ssid:ins.ssid,address:ins.add,time:{m:month,d:day,h:hour,y:year}});
		});
		
		console.log(newFilteredData);
		this.setState({filteredData: newFilteredData},()=>{		
			this.filterDateAndTime();
		});
	}
	
	filterDateAndTime() {
		if (this.state.filteredData.length !== 0) { //if ssid chosen already and date chosen already
			var filteredMonth = [];
			var crowdPerHour = {
				labels:["0am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am",
						"11am","12am","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm",
						"10pm","11pm"],
				datasets:[
				{
					label:'Number of People',
					data:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
				}
			]}
			this.state.filteredData.forEach((x)=>{
				if (x.time.m === this.props.chosenDate.getMonth()+1 && 
					x.time.d === this.props.chosenDate.getDate()
				) {
					filteredMonth.push(x);
				}
			});
			
			//filter out data for each hour from 0am to 11pm
			filteredMonth.forEach((x)=>{
				crowdPerHour.datasets[0].data[x.time.h] += 1;
			});
			
			this.setState({filteredMonth: filteredMonth,crowdPerHour: crowdPerHour});
		}
	}
	
	filterLocation() {
		var filteredData = [];
		this.props.entries.forEach((instance)=>{
			if (instance.ssid === this.props.chosenSSID) {
				filteredData.push(instance);
			}
		});
		this.convertEpochToLocal(filteredData);	
	}
	
	componentDidUpdate(prevProps) {
		console.log("filtered month: "+JSON.stringify(this.state.filteredMonth));
		console.log("filtered day: "+JSON.stringify(this.state.filteredData));
		
		if (this.props.chosenSSID !== prevProps.chosenSSID
			|| this.props.chosenDate !== prevProps.chosenDate) {
			this.filterLocation();
		}
	}
	
	render() {	
		return (
			<div style ={{width: "100%",height: "100%"}}>
				<CovidGraph chosenSSID={this.props.chosenSSID} data={this.state.crowdPerHour}/>
			</div>
		);
	}
}
export default Graph;