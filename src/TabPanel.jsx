import React from 'react';
import PropTypes from 'prop-types';

function TabPanel ({ children, value, index, ...other }) {

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <div>{children}</div>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

export default TabPanel;
