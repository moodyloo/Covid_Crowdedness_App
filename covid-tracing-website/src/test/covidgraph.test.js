import React from 'react'
import {shallow, configure,mount} from 'enzyme';
import CovidGraph from '../CovidGraph.js';

import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('renders correctly', () => {
	const wrapper = shallow(<CovidGraph/>);

	expect(wrapper).toMatchSnapshot();
});