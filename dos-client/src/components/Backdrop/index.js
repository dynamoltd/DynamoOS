import React from 'react';

//Assets
import './styles.scss';

const Backdrop = props => {
  return <div className='backdrop' onClick={props.drawerCloseHandler} />;
};

export default Backdrop;
