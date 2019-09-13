import React from 'react';

import './styles.scss';

const SideDrawerToggle = props => {
  return (
    <button className='drawer-toggle menu' onClick={props.drawerOpenHandler}>
      <div className='ham-btn'>
        <div className='ham-line'></div>
        <div className='ham-line'></div>
        <div className='ham-line'></div>
      </div>
    </button>
  );
};

export default SideDrawerToggle;
