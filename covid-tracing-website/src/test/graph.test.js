import React from 'react'
import {shallow, configure,mount} from 'enzyme';
import Graph from '../Graph.js';

import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('renders correctly', () => {
	const wrapper = shallow(<Graph/>);

	expect(wrapper).toMatchSnapshot();
});