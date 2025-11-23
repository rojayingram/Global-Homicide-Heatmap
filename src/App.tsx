import './App.css'
import Dashboard from './pages/Dashboard';

// export interface Country {
//   id: string;
//   value: string;
// }

// export interface Indicator {
//   id: string;
//   value: string;
// }

// export interface DataPoint {
//   country: Country;
//   countryiso3code: string;
//   date: string;
//   decimal: number;
//   indicator: Indicator;
//   obs_status: string;
//   unit: string;
//   value: number | null;
// }

function App() {
  // const [countries, setCountries] = useState<DataPoint[] | null>(null);

  // useEffect(()=>{
  //   const url = 'https://api.worldbank.org/v2/country/all/indicator/VC.IHR.PSRC.P5?format=json&per_page=300&date=2019';
  //   axios.get(url).then((response)=>{
  //   setCountries(response.data[1]);
  //   console.log(response.data);
  //   })
  // }, []);

  return (

  <div className='App'>

    {/* Data map with axios */}
    {/* {countries ? countries.map((country)=>{
    return (<p key={country.country.id + '|' + country.date}>
      Country ID: {country.country.id} Country Name: {country.country.value} {country.value}
      </p>);
  }) : null} */}


  <Dashboard/>

  </div>
  
  );
}

export default App
