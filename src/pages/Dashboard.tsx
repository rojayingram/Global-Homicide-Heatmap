import React, { useState, useEffect } from "react";
import { scaleSequential, interpolateRdYlGn, max } from "d3";
import { Search, ArrowUpDown, Home } from "lucide-react";

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-pulse-glow {
    animation: pulse-glow 4s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

interface CountryData {
  name: string;
  code: string;
  region: string;
  population: number;
  flag: string;
  homicideRate: number;
}

interface CountryDetail {
  officialName: string;
  commonName: string;
  flag: string;
  region: string;
  subregion: string;
  population: number;
  capital: string[];
  code: string;
  homicideRate: number | null;
}

type SortField = 'name' | 'region' | 'population' | 'homicideRate';
type SortOrder = 'asc' | 'desc';

// Simple client-side router
const useRouter = () => {
  const [route, setRoute] = useState(window.location.pathname);
  
  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };
  
  return { route, navigate };
};

const GlobalDashboard: React.FC<{
  onCountryClick: (code: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}> = ({ onCountryClick, selectedYear, setSelectedYear }) => {
  const [data, setData] = useState<CountryData[]>([]);
  const [filteredData, setFilteredData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [sortField, setSortField] = useState<SortField>('homicideRate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const countriesRes = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca3,region,population,flags"
        );
        const countries = await countriesRes.json();
        
        const homicideRes = await fetch(
          `https://api.worldbank.org/v2/country/all/indicator/VC.IHR.PSRC.P5?format=json&per_page=300&date=${selectedYear}`
        );
        const homicideData = await homicideRes.json();
        
        const homicideMap = new Map<string, number>();
        
        if (homicideData && homicideData[1]) {
          homicideData[1].forEach((item: any) => {
            if (item.value !== null) {
              homicideMap.set(item.countryiso3code, item.value);
            }
          });
        }
        
        const merged: CountryData[] = countries
          .filter((c: any) => c.region && c.population > 1000000)
          .map((c: any) => ({
            name: c.name.common,
            code: c.cca3,
            region: c.region,
            population: c.population,
            flag: c.flags.svg || c.flags.png,
            homicideRate: homicideMap.get(c.cca3) || 0,
          }))
          .filter((c: CountryData) => homicideMap.has(c.code));
        
        setData(merged);
        setFilteredData(merged);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    let result = [...data];
    
    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRegion !== "All") {
      result = result.filter(item => item.region === selectedRegion);
    }
    
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredData(result);
  }, [data, searchTerm, selectedRegion, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const regions = ["All", ...Array.from(new Set(data.map(d => d.region))).sort()];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900 mb-4"></div>
          <div className="text-xl text-slate-700 font-medium">Loading homicide data...</div>
          <div className="text-sm text-slate-500 mt-2">Fetching data from World Bank & REST Countries APIs</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxRate = max(data, (d) => d.homicideRate) || 1;
  const colorScale = scaleSequential(interpolateRdYlGn).domain([maxRate, 0]);

  const getColor = (value: number) => {
    return colorScale(value);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2 text-slate-900 drop-shadow-lg">
        Global Homicide Rate Dashboard
      </h1>
      <p className="text-slate-700 mb-6 drop-shadow-sm">
        Intentional homicides per 100,000 people (World Bank data)
      </p>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
        >
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
          <option value="2018">2018</option>
          <option value="2017">2017</option>
          <option value="2016">2016</option>
          <option value="2015">2015</option>
          <option value="2014">2014</option>
          <option value="2013">2013</option>
          <option value="2012">2012</option>
          <option value="2011">2011</option>
          <option value="2010">2010</option>
        </select>
        
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <div className="text-sm text-slate-600">
          Showing {filteredData.length} of {data.length} countries
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-2xl ring-1 ring-black/5">
        <table className="min-w-full border-collapse bg-white/95 backdrop-blur-md">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-3 text-left">Rank</th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Country
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => handleSort('region')}
              >
                <div className="flex items-center gap-2">
                  Region
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => handleSort('population')}
              >
                <div className="flex items-center gap-2">
                  Population
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => handleSort('homicideRate')}
              >
                <div className="flex items-center gap-2">
                  Homicide Rate
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="text-slate-400 text-6xl mb-4">🔍</div>
                  <div className="text-xl font-medium text-slate-700 mb-2">No countries found</div>
                  <div className="text-slate-500">
                    Try adjusting your search term or filters
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr 
                  key={row.code} 
                  className="border-b border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
                  onClick={() => onCountryClick(row.code)}
                >
                  <td className="p-3 text-slate-600 font-medium">{idx + 1}</td>
                  <td className="p-3 font-medium text-slate-900">{row.name}</td>
                  <td className="p-3 text-slate-700">{row.region}</td>
                  <td className="p-3 text-slate-700">
                    {row.population.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div
                      className="font-bold px-3 py-1 rounded text-sm w-fit"
                      style={{ 
                        backgroundColor: getColor(row.homicideRate),
                        color: row.homicideRate > maxRate / 2 ? 'white' : 'black'
                      }}
                    >
                      {row.homicideRate.toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <p>
          <strong>Note:</strong> Color intensity shows homicide rate (green = low, red = high). 
          Select different years to view historical data. Click any row to view country details.
        </p>
        <p className="mt-1">
          Countries with population &lt; 1M excluded for clarity. 
          Data sources: World Bank & REST Countries API.
        </p>
      </div>
    </div>
  );
};

const CountryDetailView: React.FC<{
  countryCode: string;
  onBack: () => void;
  selectedYear: string;
}> = ({ countryCode, onBack, selectedYear }) => {
  const [countryDetail, setCountryDetail] = useState<CountryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountryDetail = async () => {
      try {
        setLoading(true);
        
        const countryRes = await fetch(
          `https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,cca3,region,subregion,population,capital,flags`
        );
        const countryData = await countryRes.json();
        
        const homicideRes = await fetch(
          `https://api.worldbank.org/v2/country/${countryCode}/indicator/VC.IHR.PSRC.P5?format=json&per_page=10&date=${selectedYear}`
        );
        const homicideData = await homicideRes.json();
        
        let homicideRate = null;
        if (homicideData && homicideData[1] && homicideData[1][0] && homicideData[1][0].value !== null) {
          homicideRate = homicideData[1][0].value;
        }
        
        setCountryDetail({
          officialName: countryData.name.official,
          commonName: countryData.name.common,
          flag: countryData.flags.svg || countryData.flags.png,
          region: countryData.region,
          subregion: countryData.subregion || "N/A",
          population: countryData.population,
          capital: countryData.capital || ["N/A"],
          code: countryData.cca3,
          homicideRate: homicideRate,
        });
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch country details");
        setLoading(false);
      }
    };
    
    fetchCountryDetail();
  }, [countryCode, selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900 mb-4"></div>
          <div className="text-xl text-slate-700 font-medium">Loading country details...</div>
        </div>
      </div>
    );
  }

  if (error || !countryDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Country</h2>
          <p className="text-slate-600 mb-6">{error || "Country not found"}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const maxRate = 50; // Approximation for color scale
  const colorScale = scaleSequential(interpolateRdYlGn).domain([maxRate, 0]);
  const getColor = (value: number) => colorScale(value);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 px-6 py-3 bg-white/95 backdrop-blur-md rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl ring-1 ring-black/5"
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
        {/* Flag Header */}
        <div className="w-full h-64 overflow-hidden bg-slate-100">
          <img 
            src={countryDetail.flag} 
            alt={`${countryDetail.commonName} flag`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Country Info */}
        <div className="p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {countryDetail.commonName}
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            {countryDetail.officialName}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Region */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm ring-1 ring-indigo-100">
              <h3 className="text-sm font-semibold text-indigo-600 uppercase mb-2">
                Region
              </h3>
              <p className="text-2xl font-medium text-slate-900">
                {countryDetail.region}
              </p>
            </div>

            {/* Subregion */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm ring-1 ring-purple-100">
              <h3 className="text-sm font-semibold text-purple-600 uppercase mb-2">
                Subregion
              </h3>
              <p className="text-2xl font-medium text-slate-900">
                {countryDetail.subregion === "N/A" ? (
                  <span className="text-slate-500 italic">Not available</span>
                ) : (
                  countryDetail.subregion
                )}
              </p>
            </div>

            {/* Population */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl shadow-sm ring-1 ring-cyan-100">
              <h3 className="text-sm font-semibold text-cyan-600 uppercase mb-2">
                Population
              </h3>
              <p className="text-2xl font-medium text-slate-900">
                {countryDetail.population.toLocaleString()}
              </p>
            </div>

            {/* Capital */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl shadow-sm ring-1 ring-pink-100">
              <h3 className="text-sm font-semibold text-pink-600 uppercase mb-2">
                Capital City
              </h3>
              <p className="text-2xl font-medium text-slate-900">
                {countryDetail.capital[0] === "N/A" ? (
                  <span className="text-slate-500 italic">Not available</span>
                ) : (
                  countryDetail.capital.join(", ")
                )}
              </p>
            </div>

            {/* Homicide Rate */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl shadow-sm ring-1 ring-slate-200 md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">
                Homicide Rate ({selectedYear})
              </h3>
              {countryDetail.homicideRate !== null ? (
                <div
                  className="inline-block font-bold px-6 py-3 rounded-lg text-2xl mt-2"
                  style={{ 
                    backgroundColor: getColor(countryDetail.homicideRate),
                    color: countryDetail.homicideRate > maxRate / 2 ? 'white' : 'black'
                  }}
                >
                  {countryDetail.homicideRate.toFixed(2)} per 100,000 people
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-6 text-center mt-2">
                  <div className="text-slate-400 text-4xl mb-2">📊</div>
                  <p className="text-slate-600 font-medium">No homicide data available</p>
                  <p className="text-sm text-slate-500 mt-1">for {selectedYear}</p>
                </div>
              )}
            </div>

            {/* ISO Code */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl shadow-sm ring-1 ring-amber-100 md:col-span-2">
              <h3 className="text-sm font-semibold text-amber-600 uppercase mb-2">
                ISO Country Code
              </h3>
              <p className="text-2xl font-mono font-medium text-slate-900">
                {countryDetail.code}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { route, navigate } = useRouter();
  const [selectedYear, setSelectedYear] = useState("2022");

  const handleCountryClick = (code: string) => {
    navigate(`/country/${code}`);
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Parse route
  const isCountryRoute = route.startsWith('/country/');
  const countryCode = isCountryRoute ? route.split('/country/')[1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        {/* Large Gradient Orbs */}
        <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-indigo-300/40 rounded-lg rotate-45 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 border-2 border-purple-300/40 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 border-2 border-pink-300/40 rounded-lg rotate-12 animate-float animation-delay-4000"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgb(99, 102, 241) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(99, 102, 241) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/20"></div>
        
        {/* Animated Light Beams */}
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-indigo-300/20 to-transparent animate-pulse-glow"></div>
        <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-purple-300/20 to-transparent animate-pulse-glow animation-delay-2000"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {isCountryRoute && countryCode ? (
          <CountryDetailView 
            countryCode={countryCode}
            onBack={handleBackToDashboard}
            selectedYear={selectedYear}
          />
        ) : (
          <GlobalDashboard 
            onCountryClick={handleCountryClick}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;