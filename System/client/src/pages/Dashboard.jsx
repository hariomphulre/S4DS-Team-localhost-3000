import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTractor, 
  faCloudSunRain, 
  faLeaf, 
  faDroplet, 
  faTemperatureHalf, 
  faCloudRain, 
  faTriangleExclamation,
  faChartLine,
  faMapMarkerAlt,
  faRulerCombined,
  faSeedling,
  faCalendarAlt,
  faBell,
  faChevronDown,
  faMap,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { fetchWeatherForecast, fetchFieldData, fetchFields } from '../services/dataService';

const Dashboard = () => {
  const contextValue = useAppContext() || {};
  const { 
    selectedField = '', 
    setSelectedField = () => {}, 
    fields = [], 
    refreshFields = async () => {} 
  } = contextValue;
  const [fieldData, setFieldData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allFields, setAllFields] = useState([]);
  const [fieldCount, setFieldCount] = useState(0);

  // Load all fields on component mount
  useEffect(() => {
    const loadAllFields = async () => {
      try {
        const fieldsData = await fetchFields();
        setAllFields(fieldsData);
        setFieldCount(fieldsData.length);
      } catch (error) {
        console.error('Error loading all fields:', error);
      }
    };
    
    loadAllFields();
  }, []);

  // Load selected field data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Use the first field if none selected
        const fieldId = selectedField || (fields.length > 0 ? fields[0]?.id : null);
        console.log("this is field id from dashboard",fieldId);
        if (fieldId) {
          const field = await fetchFieldData(fieldId);
          console.log("this is field data from backend",field);
          const weather = await fetchWeatherForecast(field.location || 'Default Location');
          console.log("this is weather from dashboard",weather);
          setFieldData(field);
          setWeatherData(weather);
        } else {
          // No field available
          setFieldData(null);
          setWeatherData(await fetchWeatherForecast('Default Location'));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedField, fields]);

  const getHealthStatusColor = (value) => {
    if (value >= 0.7) return 'bg-green-500';
    if (value >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center shadow-lg mr-4">
            <FontAwesomeIcon icon={faTractor} className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Farm Dashboard</h2>
            <p className="text-sm text-gray-500">Overview of your agricultural operations</p>
          </div>
        </div>
        
        <div className="inline-flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button 
            className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition duration-200 flex items-center"
            onClick={() => {
              refreshFields();
              setLoading(true);
              setTimeout(() => setLoading(false), 500);
            }}
          >
            <FontAwesomeIcon icon={faRefresh} className="mr-2" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading farm data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest information</p>
        </div>
      ) : (
        <>
          {/* Farm Overview Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-green-600" />
                Farm Overview
              </h3>
              <div className="mt-2 sm:mt-0 flex items-center gap-4">
                {/* Field Selector */}
                {/* <div className="flex items-center">
                  <label htmlFor="field-select" className="mr-2 text-sm text-gray-500">Select Field:</label>
                  <select
                    id="field-select"
                    className="py-1 px-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedField || ''}
                    onChange={(e) => setSelectedField(e.target.value)}
                  >
                    <option value="">-- Select Field --</option>
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                </div> */}
                
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-green-100 text-green-800 py-1 px-3 rounded-full font-medium">
                    Active Season
                  </span>
                  
                  <Link
                    to="/field-list"
                    className="text-sm bg-blue-50 text-blue-700 py-1 px-3 rounded-full font-medium flex items-center"
                  >
                    <FontAwesomeIcon icon={faMap} className="mr-1" />
                    All Fields ({fieldCount})
                  </Link>
                </div>
              </div>
            </div>
            
            {!fieldData ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No field selected or no fields available</div>
                <Link to="/create-field" className="mt-2 inline-block text-green-600 hover:text-green-700">
                  + Create a new field
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 hover:border-green-300 transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faSeedling} className="text-green-600" />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Field Name</div>
                  </div>
                  <div className="text-lg font-semibold text-gray-800">{fieldData?.name || 'Not Selected'}</div>
                  <div className="mt-2 text-sm text-gray-500">{fieldData?.location || 'Unknown Location'}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 hover:border-green-300 transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faRulerCombined} className="text-blue-600" />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Field Size</div>
                  </div>
                  <div className="text-lg font-semibold text-gray-800">{fieldData?.size || 0} acres</div>
                  <div className="mt-2 text-sm text-gray-500">
                    Created: {fieldData?.createdAt ? new Date(fieldData.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 hover:border-green-300 transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faSeedling} className="text-amber-600" />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Crop</div>
                  </div>
                  <div className="text-lg font-semibold text-gray-800">
                    {fieldData?.crop || fieldData?.mainCrop || fieldData?.crops?.[0] || 'None planted'}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <Link to={`/field-detail/${fieldData.id}`} className="text-green-600 hover:text-green-700">
                      View field details →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Fields Overview Section */}
          {allFields.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FontAwesomeIcon icon={faMap} className="mr-2 text-green-600" />
                  My Fields
                </h3>
                <div className="mt-2 sm:mt-0">
                  <Link 
                    to="/create-field"
                    className="text-sm bg-green-100 text-green-800 py-1 px-3 rounded-full font-medium hover:bg-green-200 transition-colors"
                  >
                    + Add New Field
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFields.slice(0, 3).map((field) => (
                  <div 
                    key={field.id} 
                    className={`p-4 rounded-lg border ${selectedField === field.id ? 'border-green-300 bg-green-50' : 'border-gray-200'} hover:border-green-300 hover:shadow-sm transition-all cursor-pointer`}
                    onClick={() => setSelectedField(field.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{field.name}</h4>
                      {selectedField === field.id && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Selected</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">{field.location}</div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Created: {new Date(field.createdAt).toLocaleDateString()}
                      </div>
                      <Link 
                        to={`/field-detail/${field.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
                
                {allFields.length > 3 && (
                  <div className="p-4 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                    <Link 
                      to="/field-list"
                      className="text-sm text-green-600 hover:text-green-800 flex items-center"
                    >
                      View all {allFields.length} fields
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1 transform rotate-270" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
