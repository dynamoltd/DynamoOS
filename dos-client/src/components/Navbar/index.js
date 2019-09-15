import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';

// Assets
import './styles.scss';
import logo from '../../assets/img/logo.svg';

//Components
import { Drawer, DrawerToggle, Backdrop } from 'components';

class Navbar extends Component {
  state = {
    drawerOpen: false
  };

  drawerOpenHandler = () => {
    this.setState(
      prevState => {
        return { drawerOpen: !prevState.drawerOpen };
      },
      () => {
        setTimeout(() => {
          document.querySelector('.backdrop').style.opacity = '1';
        }, 200);
      }
    );
  };

  drawerCloseHandler = event => {
    event.target.style.opacity = '0';
    setTimeout(() => {
      this.setState({
        drawerOpen: false
      });
    }, 300);
  };

  render() {
    let backdrop;
    if (this.state.drawerOpen) backdrop = <Backdrop drawerCloseHandler={this.drawerCloseHandler} />;

    return (
      <Fragment>
        <nav className='nav'>
          <div className='nav-column-left'>
            <DrawerToggle drawerOpenHandler={this.drawerOpenHandler} />
            <Link className='logo' to='/'>
              <img alt='Logo' src={logo} />
            </Link>
          </div>

          <div className='nav-column-right'>
            <div className='dropdown'>{/* 
            <NotificationsDrawerToggle notificationsDrawerOpenHandler={this.notificationsDrawerOpenHandler} />
              <NotificationsDrawer show={this.state.notificationsDrawerOpen} /> 
              */}</div>
          </div>
        </nav>
        <Drawer show={this.state.drawerOpen} />
        {backdrop}
      </Fragment>
    );
  }
}

export default Navbar;
