import React, { Component } from 'react';

import './styles.scss';

class Drawer extends Component {
  render() {
    const { show } = this.props;

    let drawerClasses = 'drawer';
    if (show) drawerClasses = 'drawer open';

    return (
      <div className={drawerClasses} role='menu'>
        <div className='title-tag content-below'>Global Menu</div>
        <div className='global-menu-list'>
          <a href='/' className='global-menu-link'>
            <div className='global-menu-avatar'>
              <div>PJ</div>
            </div>
            <div>
              <div className='global-menu-link-title'>Projects</div>
              <div className='global-menu-link-description'>7 Instances</div>
            </div>
          </a>
          <a href='/' className='global-menu-link'>
            <div className='global-menu-avatar analytics'>
              <div>BD</div>
            </div>
            <div>
              <div className='global-menu-link-title'>Analytics</div>
              <div className='global-menu-link-description'>3 instances</div>
            </div>
          </a>
        </div>
        <div className='title-tag content-below'>Menu</div>
        <div>
          <a href='/' className='menu-link'>
            Account
          </a>
          <a href='/' className='menu-link'>
            Profile
          </a>
          <a href='/' className='menu-link'>
            Support
          </a>
        </div>
      </div>
    );
  }
}

export default Drawer;
