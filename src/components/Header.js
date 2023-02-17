import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { Typography } from "@mui/material";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { BiCopy, BiLinkExternal , BiLogOut,BiLogOutCircle} from "react-icons/bi";
import {ownerAddress} from "./config";
import CircularProgress from '@mui/material/CircularProgress';

class Header extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      anchorEl : false,
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);

  }


  copyAddress (){
    navigator.clipboard.writeText(this.props.linkedAccount)
  }

  goToLink(){
    window.open("https://etherscan.io/address/" + this.props.linkedAccount,"_blank")
  }

  handleMenuClick = (event)=>{
    this.setState({
      anchorEl: event.currentTarget,
    });
  }
  handleMenuClose = (event)=>{
    this.setState({
      anchorEl: null,
    });
  }

  render() {
    return (
      <Box sx={{ flexGrow: 1, mb: 8, px: 2 }}>
        <AppBar
          position="static"
          sx={{ backgroundColor: "transparent", boxShadow: "none" }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",
              pl: "0px !important",
              pr: "0px !important",
              flexDirection: {
                md: 'row',
                xs: 'column',
              },
              alignItems: {
                md: 'center',
                xs: 'flex-start'
              }
            }}
          >
            <IconButton color="inherit" sx={{ px: 0 }}>
              <Box component="img" src="./logo.png" height={50} /> 
              <Typography variant="h3" sx={{ mb: 1.5,    marginTop: "20px", 
                marginLeft: "20px"
            } }>Secura</Typography>
            </IconButton>
            
            <IconButton
              size="normal"
              color="inherit"
              sx={{
                border: "1px solid #3E4269",
                borderRadius: "10px",
                backgroundColor: "transparent",
                display:this.props.linkedAccount === ""? "flex":"none",
              }}
              onClick={()=>{this.props.walletConnect()}}
            >
              <AccountBalanceWalletOutlinedIcon sx={{ color: "#fff"}} /> 
              <Typography sx={{ color: "#fff" }}> &nbsp; wallet connect</Typography>
            </IconButton>

            <Button
              id="basic-button"
              aria-controls={Boolean(this.state.anchorEl) ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(this.state.anchorEl) ? 'true' : undefined}
              onClick={this.handleMenuClick}
              sx={{
                border: "1px solid #3E4269",
                borderRadius: "10px",
                backgroundColor: "transparent",
                color : '#fff',
                display:this.props.linkedAccount === ""? "none":"flex",
              }}
            >
                <AccountBalanceWalletOutlinedIcon sx={{ fontSize: "25px" }}/>
                <Typography sx={{ml:2, textTransform: 'initial'}}>{this.props.linkedAccount.slice(0, 7)}...{this.props.linkedAccount.slice(35, 42)} </Typography>
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={this.state.anchorEl}
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
              sx={{
                '& .MuiPaper-root': {
                  width: 214,
                  bgcolor: '#050819',
                  borderRadius: "10px",
                  border: 'solid 1px #3E4269',
                  color: '#fff',
                }
              }}
            >
              <MenuItem onClick = {()=> {this.copyAddress()}}><BiCopy/> &nbsp; Copy Address</MenuItem>
              <MenuItem onClick=  {()=> {this.goToLink()}}><BiLinkExternal/> &nbsp; View in Explorer</MenuItem>
              <MenuItem onClick=  {()=>{this.props.walletDisconnect();this.setState({ anchorEl: null});}}><BiLogOut/> &nbsp; Disconnect</MenuItem>
              {this.props.linkedAccount === ownerAddress && (<MenuItem onClick=  {()=>{this.props.withdrawAll()}}><BiLogOutCircle/> &nbsp; 
              Withdraw All {this.props.withdrawAllLoading && (
                      <CircularProgress
                        size={24}
                        sx={{
                          color: "#ffffff",
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-12px',
                          marginLeft: '-12px',
                        }}
                      />
                    )}</MenuItem>)}
            </Menu>
          </Toolbar>
        </AppBar>
      </Box>
    );
  }
}
export default Header;
