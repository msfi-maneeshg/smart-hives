import { useEffect, useState } from "react";
import Chart from "react-google-charts";

export function MyChart(){
    const [weight ,setWeight]= useState(0);
    const [temperature,setTemperature]= useState(0);
    const [humidity,setHumidity]= useState(0);
    const [weightArray,setWeightArray] = useState({data:[['x', 'Weight','Temperature','Humidity']]})
    const [isLoaded,setIsLoaded] = useState(true)
    const [eventIntervalId, setEventIntervalId] = useState(null);
    const [isDbLoaded,setIsDbLoaded] = useState(true)
    const [cloudantArray,setCloudantArray] = useState({data:[['x','Temperature','Humidity']]})

    useEffect(() => {
        if(isLoaded){
            setIsLoaded(false)
            let newEventIntervalID = setInterval(() => {
                // let isStatusOK = false;
                const requestOptions = {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json'
                    }
                };
                
                let apiUrl = "http://localhost:8000/last-event/Farmer-1-Hives/Hive-1"
            
                fetch(apiUrl, requestOptions)
                .then((response) => {
                    //console.log(response)
                    return response.json()   
                })
                .then((data) => {
                    setTemperature(data[0].data.temperature)
                    setHumidity(data[0].data.humidity)
                    setWeight(data[0].data.weight)

                    let tempWeight = weightArray.data
                    let NewtempWeight;
                    if(tempWeight.length > 50 ){
                        NewtempWeight = tempWeight.filter(function(element,index) {
                            return index !== 1
                        });
                    }else{
                        NewtempWeight = tempWeight
                    }
                    
                    let newTimestamp = new Date(NewtempWeight[NewtempWeight.length-1][0])
                    let oldTimestamp = new Date(data[0].timestamp)
                    
                    if(newTimestamp.getTime() !== oldTimestamp.getTime()){
                        NewtempWeight.push([new Date(data[0].timestamp),data[0].data.weight,data[0].data.temperature,data[0].data.humidity])
                        setWeightArray({data:NewtempWeight})
                    }
                    console.log(NewtempWeight.length)
                    setIsLoaded(true)
                });
            }, 1000)
            if(eventIntervalId != null){
                clearInterval(eventIntervalId)
            }
            setEventIntervalId(newEventIntervalID)

            
            
        }
    })

    useEffect(() => {
        if(isDbLoaded){
            setIsDbLoaded(false)
                const requestOptions = {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization':'Basic YXBpa2V5LXYyLTI5bW51dWFyeXNuejZ6d3YxbnA4ZnpwODA4YTVlNDA1Mm00NzgzaGprZmxoOjk5Mzg1NmNhODczZWZiMzNjYzY3ZmM2YzgyZDZjN2U4'
                    },
                    body: JSON.stringify({ 
                        selector:  {
                            _id: {
                                $gt: "0"
                            },
                            deviceId: "Hive-2"
                        },
                        fields: [
                            "data",
                            "timestamp",
                            "deviceId"
                        ],
                        sort: [
                            {
                                timestamp: "asc"
                            }
                        ],
                        limit:10
                    })
                };
                
                let apiUrl = "https://433c346a-cb7c-4736-8e95-0bc99303fe1a-bluemix.cloudant.com/iotp_62m15c_farmer-1_2021-06-21/_find"
            
                fetch(apiUrl, requestOptions)
                .then((response) => {
                    //console.log(response)
                    return response.json()   
                })
                .then((data) => {
                   
                   let tempData = cloudantArray.data
                   data.docs.forEach(element => {
                    tempData.push([new Date(element.timestamp),element.data.temperature,element.data.humidity])
                   });
                   setCloudantArray({data:tempData})
                });
        }
    })

    return(
           <>
           <div style={{display:'flex'}}>
           <h1 style={{textAlign:'center',width:'100%'}}>Hive 1 Event Data</h1>
           </div>
            <div style={{display:'flex'}}>
                <div>
                    <h1 style={{textAlign:'center'}}>Weigth(Kg)</h1>
                    <Chart
                        width={320}
                        height={320}
                        chartType="Gauge"
                        loader={<div>Loading Chart</div>}
                        data={[
                        ['Label', 'Value'],
                        ['', weight],
                        ]}
                        options={{
                        minorTicks: 25,
                        majorTicks:[50,75,100,125,150,175,200],
                        min:50,
                        max:200,
                        }}
                        rootProps={{ 'data-testid': '1' }}
                    />
                   
                </div>  
                <div>
                    <h1 style={{textAlign:'center'}}>Temperature(Celcius)</h1>
                    <Chart
                        width={320}
                        height={320}
                        chartType="Gauge"
                        loader={<div>Loading Chart</div>}
                        data={[
                        ['Label', 'Value'],
                        ['', Number(temperature.toFixed(0))],
                        ]}
                        options={{
                        redFrom: 45,
                        redTo: 60,
                        yellowFrom: 40,
                        yellowTo: 45,
                        greenFrom: 27,
                        greenTo: 40,
                        minorTicks: 10,
                        majorTicks:[-10,"0",10,20,30,40,50,60],
                        min:-10,
                        max:60,
                        }}
                        rootProps={{ 'data-testid': '1' }}
                    />
                </div> 
                <div>
                    <h1 style={{textAlign:'center'}}>Humidity(%)</h1>
                    <Chart
                        width={320}
                        height={320}
                        chartType="Gauge"
                        loader={<div>Loading Chart</div>}
                        data={[
                        ['Label', 'Value'],
                        ['', humidity],
                        ]}
                        options={{
                        redFrom: 50,
                        redTo: 100,
                        yellowFrom: 40,
                        yellowTo: 50,
                        greenFrom: 25,
                        greenTo: 40,
                        minorTicks: 10,
                        majorTicks:["0",10,20,30,40,50,60,70,80,90,100],
                        }}
                        rootProps={{ 'data-testid': '1' }}
                    />
                </div>     
            </div>  
            <div style={{display:'flex'}}>
                <div>
                <Chart
                        width={'1000px'}
                        height={'400px'}
                        chartType="LineChart"
                        loader={<div>Loading Chart</div>}
                        data={weightArray.data}
                        options={{
                            hAxis: {
                            title: 'Time',
                            },
                            vAxis: {
                            title: 'Weigth / Temperature / Humidity',
                            },
                        }}
                        rootProps={{ 'data-testid': '1' }}
                        />
                </div>
            </div>
            <div style={{display:'flex'}}>
                <div>
                    {cloudantArray.data.length > 1  &&
                        <Chart
                            width={'1000px'}
                            height={'400px'}
                            chartType="LineChart"
                            loader={<div>Loading Chart</div>}
                            data={cloudantArray.data}
                            options={{
                                hAxis: {
                                title: 'Time',
                                },
                                vAxis: {
                                title: ' Temperature / Humidity',
                                },
                            }}
                            rootProps={{ 'data-testid': '1' }}
                            />
                        }    
                </div>
            </div> 
        </> 
    );
}

export function LineChart(){
    return(
        <Chart
            width={'100%'}
            height={'500'}
            chartType="Line"
            loader={<div>Loading Chart</div>}
            data={[
                [
                { type: 'date', label: 'Day' },
                'Average temperature',
                'Average hours of daylight',
                ],
                [new Date(2021, 6,0), -0.5, 5.7],
                [new Date(2021, 6,1), 0.4, 8.7],
                [new Date(2021, 6,2), 0.5, 12],
                [new Date(2021, 6,3), 2.9, 15.3],
                [new Date(2021, 6,4), 6.3, 18.6],
                [new Date(2021, 6,5), 9, 20.9],
                [new Date(2021, 6,6), 10.6, 19.8],
                [new Date(2021, 6,7), 10.3, 16.6],
                [new Date(2021, 6,8), 7.4, 13.3],
                [new Date(2021, 6,9), 4.4, 9.9],
                [new Date(2021, 6,10), 1.1, 6.6],
                [new Date(2021, 6,11), -0.2, 4.5],
            ]}
            options={{
                chart: {
                title:
                    'Average Temperatures and Daylight in Iceland Throughout the Year',
                },
                width: 900,
                height: 500,
                series: {
                // Gives each series an axis name that matches the Y-axis below.
                0: { axis: 'Temps' },
                1: { axis: 'Daylight' },
                },
                axes: {
                // Adds labels to each axis; they don't have to match the axis names.
                y: {
                    Temps: { label: 'Temps (Celsius)' },
                    Daylight: { label: 'Daylight' },
                },
                },
            }}
            rootProps={{ 'data-testid': '4' }}
            />
    );
}

export default MyChart;