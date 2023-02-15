import "./App.css";
import React from "react";
import Header from "./components/Header";
import { Box, Grid } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Button, Typography } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Web3 from "web3";
import { ethers } from "ethers";
import {RPC, stakingAddress, randomAddress, stakingABI, chainID, randomABI, ownerAddress} from "./components/config";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import "react-notifications/lib/notifications.css";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";

const web3 = new Web3(new Web3.providers.HttpProvider(RPC));
const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress)
const randomContract = new web3.eth.Contract(randomABI, randomAddress)

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
      amount: 0.1,
      radioAmount: 0.1,
      key: "",
      note : "",
      withdrawAddress : '',
      linkedAccount : '',
      metamaskWeb3 : [],
      copied:false,
      stakingContract : [],
      depositLoading : false,
      withdrawLoading : false,
      openModal : false,
      currentID : '',
      lastDepositArray : [],
      arrayLength : 0,
      displayArray : []
    };
    this.handleTab = this.handleTab.bind(this);
    this.handleAmount = this.handleAmount.bind(this);
    this.handleRadioAmount = this.handleRadioAmount.bind(this);
    this.handleNote = this.handleNote.bind(this);
    this.handleAddress = this.handleAddress.bind(this);
    this.walletConnect = this.walletConnect.bind(this);
    this.walletDisconnect = this.walletDisconnect.bind(this);
    this.handleTooltip = this.handleTooltip.bind(this);
  }

  async componentWillMount(){
    this.CheckStatus()
    setInterval(() => {
      this.CheckStatus()
    }, 30000);
  }


  async walletConnect() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(chainID) }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: web3.utils.toHex(chainID),
                chainName: "goerli",
                rpcUrls: [
                  RPC,
                ],
                nativeCurrency: {
                  name: "GerliEth",
                  symbol: "Geth", // 2-6 characters long
                  decimals: 18,
                },
                blockExplorerUrls: "https://goerli.etherscan.io/",
              },
            ],
          });

          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: web3.utils.toHex(chainID) }],
          });
        } catch (addError) {}
      }
    }

    window.ethereum.on('accountsChanged', async () => {
    this.caputureWallet()
    });

    window.ethereum.on('accountsChanged', async () => {
      this.caputureWallet()
      });
  
    window.ethereum.on('disconnect', async () => {
      this.setState({
        linkedAccount : ""
      })
    });
  

    window.ethereum.on('chainChanged', async () => {
          try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(chainID) }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: web3.utils.toHex(chainID),
                chainName: "goerli",
                rpcUrls: [
                  RPC,
                ],
                nativeCurrency: {
                  name: "GerliEth",
                  symbol: "Geth", // 2-6 characters long
                  decimals: 18,
                },
                blockExplorerUrls: "https://goerli.etherscan.io/",
              },
            ],
          });

          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: web3.utils.toHex(chainID) }],
          });
        } catch (addError) {}
      }
    }

    });
    this.caputureWallet()
  }
 
  async walletDisconnect(){
      this.setState({linkedAccount : ''})
  }

  async caputureWallet (){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const clientWeb3 = window.web3;
      const accounts = await clientWeb3.eth.getAccounts();
      let linkedStakingContract = new clientWeb3.eth.Contract(stakingABI, stakingAddress)

      this.setState({
        linkedAccount: accounts[0],
        metamaskWeb3: clientWeb3,
        stakingContract : linkedStakingContract
      });

    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      const clientWeb3 = window.web3;
      const accounts = await clientWeb3.eth.getAccounts();
      let linkedStakingContract = new clientWeb3.eth.Contract(stakingABI, stakingAddress)
      this.setState({
        linkedAccount: accounts[0],
        metamaskWeb3: clientWeb3,
        stakingContract : linkedStakingContract
      });
    }
    await this.CheckStatus()
  }

  async Deposit(address, amount){
    this.setState({
      depositLoading : true
    })
    await this.state.stakingContract.methods.Deposit()
    .send({
      from:address, 
      value:ethers.BigNumber.from(amount * Math.pow(10,18) + '')
    })
    .once("error", (err) => {
      this.setState({
        depositLoading : false
      })
  
  })
  .once("confirmation", async () => {
    this.setState({
      depositLoading : false
    })
    let currentID = await stakingContract.methods.depositNo().call()
    let key = await randomContract.methods.viewKeyNote(currentID, 100).call()
    this.setState({
      key :  key,
      openModal : true
    })
    NotificationManager.success("Success", this.state.amount + "ETH is successfully deposited!", 2000);
    this.CheckStatus()
})
  }

  async Withdraw(address, key){
    this.setState({
      withdrawLoading : true
    })
    if (!web3.utils.isAddress(this.state.withdrawAddress)){
      alert("check address!")
      this.setState({
        withdrawLoading : false
      })
    }

    console.log(address, key)
    await this.state.stakingContract.methods.Claim(address, web3.utils.BN(key +"") )
    .send({
      from:this.state.linkedAccount
    })
    .once("error", (err) => {


      this.setState({
        withdrawLoading : false
      })
  })
  .once("confirmation", async () => {
    this.setState({
      withdrawLoading : false
    })
    NotificationManager.success("successfully withdrawd", "Withdraw", 5000); 
 })
  }
  async copyKey(){
    navigator.clipboard.writeText(this.state.key)
    NotificationManager.success("successfully copied, please store it immediately", "Copied", 5000); 
  }
  async donateSet(){
    this.setState({
      withdrawAddress : ownerAddress
    })
  }
  async CheckStatus (){
    let currentID = await stakingContract.methods.depositNo().call()
    this.setState({currentId : currentID / 1})
    let data = await   stakingContract.getPastEvents("_Deposit", {
      filter: {},
      fromBlock : 0,
      toBlock : 'latest'
    })


    let length = data.length
    if (length !== this.state.arrayLength){
      for (let index = this.state.arrayLength ; index < length; index++) {
        let id = data[index].returnValues.id
        let amount =( data[index].returnValues.amount /  Math.pow(10, 18)).toFixed(4) * 1
        let time = (Math.floor(Date.now() / 1000) - data[index].returnValues.tm) /1
        let message 
        if (0 <= time && time < 59){
          message = "Just deposted"
        } else if (60 <= time && time< 120) {
          message = "a minute ago"
        } else if (120 <= time && time < 3600){
          message = (time / 60 ).toFixed() + " minutes ago"
        } else if (3600 <= time && time< 7200){
          message = "a hour ago"
        } else if (7200 <= time && time< 86400){
          message = (time / 3600 ).toFixed() + " hours ago"
        } else if (86400 <= time && time< 172800){
          message = "a day ago"
        } else if (172800 <= time && time< 31536000){
          message = (time / 86400 ).toFixed() + " days ago" 
        } else if (31536000 <= time && time<  63072000){
          message = "a year ago"
        } else if (31536000 <= time ){
          message = (time / 31536000 ).toFixed() + " years ago"
        }

        let record = {
          id : id,
          amount : amount,
          time : data[index].returnValues.tm,
          untilTime : time,
          message : message
        }
        let records = this.state.lastDepositArray
        records.push(record)
        this.setState({
          lastDepositArray : records
        })
      }

      for (let index = 0; index < this.state.arrayLength; index++){
        let time = (Math.floor(Date.now() / 1000) - data[index].returnValues.tm) /1
        let message 
        if (0 <= time && time < 59){
          message = "Just deposited"
        } else if (60 <= time && time< 120) {
          message = "a minute ago"
        } else if (120 <= time && time < 3600){
          message = (time / 60 ).toFixed() + " minutes ago"
        } else if (3600 <= time && time< 7200){
          message = "a hour ago"
        } else if (7200 <= time && time< 86400){
          message = (time / 3600 ).toFixed() + " hours ago"
        } else if (86400 <= time && time< 172800){
          message = "a day ago"
        } else if (172800 <= time && time< 31536000){
          message = (time / 86400 ).toFixed() + " days ago" 
        } else if (31536000 <= time && time<  63072000){
          message = "a year ago"
        } else if (31536000 <= time ){
          message = (time / 31536000 ).toFixed() + " years ago"
        }
        let records = this.state.lastDepositArray
        records[index].message = message
        this.setState({
          lastDepositArray : records
        })
      }



      this.setState({
        arrayLength : length
      })
    } else {
      for (let index = 0; index < this.state.arrayLength; index++){
        let time = (Math.floor(Date.now() / 1000) - data[index].returnValues.tm) /1
        let message 
        if (0 <= time && time < 59){
          message = "Just deposited"
        } else if (60 <= time && time< 120) {
          message = "a minute ago"
        } else if (120 <= time && time < 3600){
          message = (time / 60 ).toFixed() + " minutes ago"
        } else if (3600 <= time && time< 7200){
          message = "a hour ago"
        } else if (7200 <= time && time< 86400){
          message = (time / 3600 ).toFixed() + " hours ago"
        } else if (86400 <= time && time< 172800){
          message = "a day ago"
        } else if (172800 <= time && time< 31536000){
          message = (time / 86400 ).toFixed() + " days ago" 
        } else if (31536000 <= time && time<  63072000){
          message = "a year ago"
        } else if (31536000 <= time ){
          message = (time / 31536000 ).toFixed() + " years ago"
        }
        let records = this.state.lastDepositArray
        records[index].message = message
        this.setState({
          lastDepositArray : records
        })
      }
    }
    
    let temp =[]
    temp = JSON.parse(JSON.stringify(this.state.lastDepositArray))

    temp.reverse()
    this.setState({
      displayArray : temp
    })
  }
  handleTab = (event, newValue) => {
    this.setState({
      tab: newValue,
    });
  };
  handleAmount = (event) => {
    this.setState({
      amount: event.target.value,
    });
  };
  handleRadioAmount = (event) => {
    this.setState({
      amount: event.target.value,
      radioAmount: event.target.value,
    });
  };
  handleNote = (event) => {
    this.setState({
      note: event.target.value,
    });
  };
  handleAddress = (event) => {
    this.setState({
      withdrawAddress: event.target.value,
    });
  };
  handleTooltip = (value) =>{
    this.setState({
      copied: value,
    });
  }

  render() {
    return (
      <div className="App">
        <Header walletConnect={this.walletConnect} walletDisconnect={this.walletDisconnect} linkedAccount = {this.state.linkedAccount}/>
           {/* notification */}
        <Collapse in={this.state.openModal}>
        <Stack sx={{ width: "100%", mb: 5, fontFamily: "DM Sans" }} spacing={2}>
        <Button onClick = {()=>(this.copyKey())}>
          <Alert
            variant="outlined"
            icon={
              <VisibilityOutlinedIcon
                fontSize="inherit"
                sx={{ color: "white", mr: 3, ml: 1 }}
              />
            }
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                onClick={() => {
                  this.setState({ openModal: false });
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{
              border: "solid 2px #3E4269",
              borderRadius: "15px",
              textAlign: "left",
              color: "#A888BB",
              alignItems: "center",
              width : "100%"
            }}
          >     
          <Typography>{this.state.key}</Typography>
          <Typography>click this to copy!</Typography>
          </Alert>
          </Button>
        </Stack>
       
      </Collapse>

      {/* Deposit --------------------------- */}

        <Box sx={{ px: 2 }}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
            <Box
        sx={{
          width: "100%",
          backgroundColor: "#1B2A41",
          borderRadius: "15px",
          border: "solid 2px #3E4269",
        }}
      >
        <Box
          sx={{
            borderBottom: 2,
            borderColor: "#26a1f91a",
          }}
        >
          <Tabs
            value={this.state.tab}
            onChange={this.handleTab}
            aria-label="basic tabs example"
          >
            <Tab
              label="Deposit"
              {...a11yProps(0)}
              sx={{
                width: "50%",
                color: "white",
                opacity: "0.5",
                textTransform: "none",
                fontWeight: "400",
                fontFamily: "DM Sans",
                "&.Mui-selected": {
                  color: "#fff",
                  opacity: "1",
                  fontWeight: "700",
                },
              }}
            />
            <Tab
              label="Withdraw"
              {...a11yProps(1)}
              sx={{
                width: "50%",
                color: "white",
                opacity: "0.5",
                textTransform: "none",
                fontWeight: "400",
                fontFamily: "DM Sans",
                "&.Mui-selected": {
                  color: "#fff",
                  opacity: "1",
                  fontWeight: "700",
                },
              }}
            />
          </Tabs>
        </Box>
        <TabPanel value={this.state.tab} index={0}>
          <Box sx={{ py: 2 }}>
            <FormControl sx={{ width: "100%", p: 0 }}>
              <FormLabel
                sx={{
                  color: "white",
                  textAlign: "left",
                  "&.Mui-focused": { color: "white" },
                }}
              >
                Amount
              </FormLabel>
              <OutlinedInput
                error = {isNaN(this.state.amount)}
                placeholder="Please insert amount"
                size="small"
                sx={{
                  mt: 2,
                  color: "white",
                  width: "100%",
                  "& fieldset": { border: "solid 1px" },
                }}
                value={this.state.amount}
                onChange={this.handleAmount}
                endAdornment={
                  <InputAdornment
                    sx={{ "& p": { color: "white" } }}
                    position="end"
                  >
                    ETH
                  </InputAdornment>
                }
              />
              <RadioGroup
                row
                aria-labelledby="demo-form-control-label-placement"
                name="position"
                defaultValue="0.1"
                sx={{ justifyContent: "center", mt: 3 }}
                value={this.state.radioAmount}
                onChange={this.handleRadioAmount}
              >
                <FormControlLabel
                  value="0.1"
                  control={
                    <Radio
                      sx={{
                        color: "#26A1F9",
                        "& span:first-of-type": { backgroundColor: "#1B2A41" },
                      }}
                    />
                  }
                  label="0.1"
                  labelPlacement="bottom"
                  sx={{ color: "#A888BB", width: "9%" }}
                />
                <FormControlLabel
                  value="1"
                  control={
                    <Radio
                      sx={{
                        color: "#26A1F9",
                        "& span:first-of-type": { backgroundColor: "#1B2A41" },
                      }}
                    />
                  }
                  label="1"
                  labelPlacement="bottom"
                  sx={{ color: "#A888BB", width: "9%" }}
                />
                <FormControlLabel
                  value="10"
                  control={
                    <Radio
                      sx={{
                        color: "#26A1F9",
                        "& span:first-of-type": { backgroundColor: "#1B2A41" },
                      }}
                    />
                  }
                  label="10"
                  labelPlacement="bottom"
                  sx={{ color: "#A888BB", width: "9%" }}
                />
                <FormControlLabel
                  value="100"
                  control={
                    <Radio
                      sx={{
                        color: "#26A1F9",
                        "& span:first-of-type": { backgroundColor: "#1B2A41" },
                      }}
                    />
                  }
                  label="100"
                  labelPlacement="bottom"
                  sx={{ color: "#A888BB", width: "9%" }}
                />
              </RadioGroup>
            </FormControl>
            <Box
              sx={{
                border: "1px solid #26A1F9",
                backgroundColor: "#26A1F9",
                mt: "-47px",
              }}
            ></Box>
            <Button
              sx={{
                backgroundColor: "#26A1F9",
                width: "100%",
                color: "white",
                borderRadius: "11px",
                fontWeight: 700,
                fontSize: "18px",
                fontFamily: "DM Sans",
                mt: 10,
                py: 2,
                textTransform: "none",
              }}
              disabled={this.state.depositLoading || isNaN(this.state.amount) || this.state.linkedAccount == ""}
              onClick={()=>this.Deposit(this.state.linkedAccount, this.state.amount * 1)}
            >
              {" "}
              Deposit {this.state.depositLoading && (
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
                    )}
            </Button>
          </Box>
        </TabPanel>



        {/* // withdraw part========================================= */}



        <TabPanel value={this.state.tab} index={1}>
          <Box sx={{ p: 2, color: "white", textAlign: "left" }}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ mb: 1.5 }}>Note</Typography>
              <OutlinedInput
                placeholder="Please enter your note"
                size="small"
                value={this.state.note}
                onChange={this.handleNote}
                sx={{
                  color: "white",
                  "& fieldset": { border: "solid 1px" },
                  width: "100%",
                }}
              />
            </Box>
            <Box sx={{ mb: 4.5 }}>
              <Typography sx={{ mb: 1.5 }}>Recipient Address  
              <Button onClick={()=>this.donateSet()}>Donate</Button></Typography>
            
              <OutlinedInput
                placeholder="Please paste address here"
                size="small"
                value={this.state.withdrawAddress}
                onChange={this.handleAddress}
                sx={{
                  color: "white",
                  "& fieldset": { border: "solid 1px" },
                  width: "100%",
                }}
              />
            </Box>

            <Button
              sx={{
                backgroundColor: "#26A1F9",
                width: "100%",
                color: "white",
                borderRadius: "11px",
                fontWeight: 600,
                fontSize: "18px",
                fontFamily: "DM Sans",
                py: 1,
                textTransform: "none",
              }}
              disabled = {this.state.withdrawLoading || this.state.linkedAccount === ""}
              onClick = {()=>this.Withdraw(this.state.withdrawAddress, this.state.note)}
            >
              {" "}
              Withdraw{this.state.withdrawLoading && (
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
                    )}
            </Button>
          </Box>
        </TabPanel>




      </Box>
      <Box sx={{ textAlign: "left" }}>
            <NotificationContainer />
      </Box>


      {/* //  Notification ==================================================== */}

            </Grid>
            <Grid item xs={12} sm={6}>
            <Box
              sx={{
                width: "100%",
                backgroundColor: "#1B2A41",
                borderRadius: "15px",
                border: "solid 2px #3E4269",
                textAlign: "left",
              }}
            >
              <Box
                sx={{
                  borderBottom: 2,
                  borderColor: "#26a1f91a",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{ color: "white", my: "auto", ml: 3, fontWeight: 700 }}
                >
                  Statistics
                </Typography>
              </Box>
              <Box sx={{ my: 2, mx: 3 }}>
                <Box>
                  <Typography
                    variant="body"
                    component="div"
                    sx={{ color: "white", opacity: "0.5", fontWeight: 400 }}
                  >
                    Anonymity set
                  </Typography>
                  <Typography
                    variant="body"
                    component="div"
                    sx={{ color: "white", fontWeight: 400, my: 1 }}
                  >
                    {this.state.currentId} equal user deposits
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body"
                    component="div"
                    sx={{ color: "white", opacity: "0.5", fontWeight: 400 }}
                  >
                    Latest Deposits
                  </Typography>
                  <Box sx={{ height: "229px", overflowY: "scroll" }}>

                    {
                    this.state.displayArray.map((ele, index) => {
                      return (
                        <Box key={index} sx={{ my: 1 }}>
                          <Typography
                            variant="body"
                            sx={{ color: "white", fontWeight: 400 }}
                          >
                            {this.state.displayArray[index].id}.
                          </Typography>
                          <Typography
                            variant="body"
                            sx={{ color: "#A888BB", fontWeight: 400 }}
                          >
                            &nbsp; {this.state.displayArray[index].message}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Box>
            </Grid>
          </Grid>
        </Box>
        
      </div>
    );
  }
}

export default App;
