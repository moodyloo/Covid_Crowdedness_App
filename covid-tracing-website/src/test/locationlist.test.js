import React from 'react'
import {shallow, configure,mount} from 'enzyme';
import LocationList from '../LocationList.js';

import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('renders correctly', () => {
	const wrapper = shallow(<LocationList/>);

	expect(wrapper).toMatchSnapshot();
});