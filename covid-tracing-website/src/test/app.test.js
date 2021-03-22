import React from 'react'
import {shallow, configure,mount} from 'enzyme';
import App from '../App.js';

import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('renders correctly', () => {
	const wrapper = shallow(<App/>);

	expect(wrapper).toMatchSnapshot();
});