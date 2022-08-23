import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Grid from '@mui/material/Grid'; // Grid version 1
import { Autocomplete, Box, Container, Paper, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function App() {
  const [fromAirports, setFromAirports] = useState<any[]>([]);
  const [fromValue, setFromValue] = useState<string | null>('');
  const [inputFromValue, setInputFromValue] = useState('');

  const [toAirports, setToAirports] = useState<any[]>([]);
  const [toValue, setToValue] = useState<string | null>('');
  const [inputToValue, setInputToValue] = useState('');

  const [distance, setDistance] = useState<number>(0);

  const getAirports = async (name: string) => {
    try {
      const res = await axios({
        method: 'post',
        url: `https://www.air-port-codes.com/api/v1/multi?term=${name}`,
        headers: {"APC-Auth": 'c2fe932da9'}
      })
      console.log(res)
      if(res.status === 200) {
        if(res.data.statusCode===200) {
          return res.data.airports
        } else if (res.data.statusCode === 204) {
          return [{name: 'No matched airport'}]
        } else if (res.data.statusCode === 401) {
          return [{name: 'Unauthorized'}]
        } else {
          return null
        }
      }
      console.log(res)
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  const setFromList = async (isFrom:boolean = false) => {
    if (isFrom) {
      const data = await getAirports(inputFromValue);
      console.log(data)
      if (data) setFromAirports(data);
    } else { 
      const data = await getAirports(inputToValue);
      if (data) setToAirports(data)
    }
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180)
  }

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

  const kmToMile = (km: number) => {
    return km * 0.539956803;
  }

  useEffect(()=>{
    if (inputFromValue.length > 2) {
      setFromList(true);
    }
  }, [inputFromValue])
  useEffect(()=>{
    if (inputToValue.length > 2) {
      setFromList(false);
    }
  }, [inputToValue])

  useEffect(() => {
    if(fromValue && toValue) {
      const airFrom = fromAirports.filter(x=>x.name===inputFromValue)[0];
      const airTo = toAirports.filter(x=>x.name=inputToValue)[0];
      const dist = getDistance(Number(airFrom.latitude), Number(airFrom.longitude), Number(airTo.latitude), Number(airTo.longitude));
      setDistance(kmToMile(dist));
    }
  }, [fromValue, toValue])

  return (
    <Container maxWidth="lg" sx={{py: 15}}>
      <Grid container columns={15} sx={{justifyContent: 'space-between'}}>
        <Grid xs={15} md={7} sx={{mb: 5}}>
          <Item>
            <Autocomplete
              value={fromValue}
              onChange={(event: any, newValue: string | null) => {
                setFromValue(newValue);
              }}
              getOptionDisabled={(option) =>
                option === 'No matched airport' || option === 'Unauthorized'
              }
              inputValue={inputFromValue}
              onInputChange={(event, newInputValue) => {
                setInputFromValue(newInputValue);
              }}
              options={fromAirports.map((x:any)=>x.name)}
              id="from-airport"
              renderInput={(params) => (
                <TextField {...params} label="From" variant="outlined" />
              )}
            />
          </Item>
        </Grid>
        <Grid xs={15} md={7} sx={{mb: 5}}>
          <Item>
            <Autocomplete
              value={toValue}
              onChange={(event: any, newValue: string | null) => {
                setToValue(newValue);
              }}
              getOptionDisabled={(option) =>
                option === 'No matched airport' || option === 'Unauthorized'
              }
              inputValue={inputToValue}
              onInputChange={(event, newInputValue) => {
                setInputToValue(newInputValue);
              }}
              options={toAirports.map((x:any)=>x.name)}
              id="to-airport"
              renderInput={(params) => (
                <TextField {...params} label="To" variant="outlined" />
              )}
            />
          </Item>
        </Grid>
      </Grid>
      {fromValue && toValue &&
        <Box sx={{ fontWeight: 'bold', fontSize: 36, textAlign: 'center', mt: 5 }}>Distance: {Number(distance.toFixed(3))} nmi</Box>
      }
    </Container>
  );
}

export default App;
