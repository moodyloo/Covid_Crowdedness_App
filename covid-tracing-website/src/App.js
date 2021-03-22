import React,{Component} from 'react';
import {Container,Row,Col} from 'react-bootstrap';
import Graph from './Graph.js';
import Calendar from 'react-calendar';
import List from './LocationList.js';

const SERVER = ":5000";
const io = require('socket.io-client');


class App extends Component {
	constructor() {
		super();
		this.state = {
			date: "",
			chosenSSID: "",
			entries: [],
			chosenDate: new Date()
		}
		this.confirmLocation = this.confirmLocation.bind(this);
		this.confirmDate = this.confirmDate.bind(this);
	}
	
	confirmDate(value) {
		this.setState({chosenDate: value});
	}
	
	confirmLocation(ssid) {
		this.setState({chosenSSID: ssid});
	}
	
	componentDidMount() {
		var socket = io.connect(SERVER);
		
		socket.on("retrieveData", (data) => {
			this.setState({entries: data});
		})	
		console.log("connected");
		
		socket.emit("askForUpdate","");
	}
	
	render() {
		return (
			<Container fluid>
				<Row className="border border-light justify-content-md-center rounded">
					<Col md={9} className="border border-dark rounded bg-dark"> 
						<Graph entries={this.state.entries} chosenSSID={this.state.chosenSSID}
							chosenDate={this.state.chosenDate}
						/>
					</Col>
					<Col md={3}>
						<Row className="border border-dark rounded bg-secondary"> 
							<Calendar onChange={(v,e)=>{this.confirmDate(v)}}/>
						</Row>
						<Row className="border border-dark rounded bg-secondary"> 
							<List entries={this.state.entries} confirmLocation={this.confirmLocation} />
						</Row>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default App;
