import React,{Component} from 'react';
import ReactList from 'react-list';
import ListGroup from 'react-bootstrap/ListGroup'

var listItems = [];

class LocationList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			locations: []
		}
		this.storeLocations = this.storeLocations.bind(this);
		this.returnItems = this.returnItems.bind(this);
	}
	
	returnItems() {
		const listItems = this.state.locations.map((item)=>
			<ListGroup.Item variant='light' key={item.ssid} onClick={()=>this.props.confirmLocation(item.ssid)}>
				{item.address}
			</ListGroup.Item>
		);
		
		return (		
			<ListGroup>
				{listItems}
			</ListGroup>
		);
	}
	
	storeLocations() {
		//get all unique locations based on ssid
		var uniqueSSID = [...new Set(this.props.entries.map(x=>x.ssid))];
		var addresses = [];
		for (var i = 0;i < uniqueSSID.length;i++) {
			for (var j = 0;j < this.props.entries.length;j++) {
				var entries = this.props.entries[j]
				if (uniqueSSID[i] === entries.ssid) {
					addresses.push({ssid:uniqueSSID[i],address:entries.add});
					break;	
				}
			}
		}
		this.setState({locations: addresses});
	}
	
	componentDidUpdate(prevProps) {
		//prevent infinite loop
		if (this.props.entries !== prevProps.entries) { 
			this.storeLocations();
		}
	}
	
	render() {
		return (
			<ListGroup>
				{this.returnItems()}
			</ListGroup>
		);
	}
}
export default LocationList
