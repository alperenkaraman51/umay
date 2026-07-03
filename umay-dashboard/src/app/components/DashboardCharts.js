"use client";
import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";

// Türkiye'nin önemli illeri ve koordinatları (Boylam, Enlem)
const CITY_COORDINATES = {
  "adana": [35.3213, 37.0000],
  "ankara": [32.8597, 39.9334],
  "antalya": [30.7133, 36.8969],
  "bursa": [29.0609, 40.1824],
  "diyarbakır": [40.2306, 37.9144],
  "erzurum": [41.2671, 39.9043],
  "gaziantep": [37.3833, 37.0662],
  "istanbul": [28.9784, 41.0082],
  "izmir": [27.1428, 38.4237],
  "kayseri": [35.4853, 38.7312],
  "kocaeli": [29.9169, 40.7654],
  "konya": [32.4846, 37.8667],
  "mersin": [34.6415, 36.8000],
  "sakarya": [30.4033, 40.7569],
  "samsun": [36.3361, 41.2867],
  "şanlıurfa": [38.7969, 37.1674],
  "urfa": [38.7969, 37.1674],
  "trabzon": [39.7168, 41.0015],
  "hatay": [36.1667, 36.2000],
  "malatya": [38.3167, 38.3500],
  "van": [43.3833, 38.4833]
};

export default function DashboardCharts({ newsData }) {
  const [tooltip, setTooltip] = useState(null);
  
  // Harita yakınlaştırma ve konum kontrolü için state
  const [mapPosition, setMapPosition] = useState({ coordinates: [35.5, 39], zoom: 1 });

  function handleZoomIn() {
    if (mapPosition.zoom >= 8) return;
    setMapPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  }

  function handleZoomOut() {
    if (mapPosition.zoom <= 0.5) return;
    setMapPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  }

  const highRiskNews = newsData.filter(n => n.threat_score > 0.5);
  const highRiskCount = highRiskNews.length;
  const safeCount = newsData.length - highRiskCount;
  
  const pieData = [
    { name: 'Yüksek Tehdit', value: highRiskCount },
    { name: 'Güvenli', value: safeCount },
  ];
  const COLORS = ['var(--primary-red)', 'var(--success)'];

  const cityGroups = {};
  
  newsData.forEach((news, idx) => {
    const textToSearch = (news.source + " " + news.title).toLowerCase();
    let foundCityKey = "ulusal";
    let foundCoords = [35.0000, 39.0000];
    
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
      if (textToSearch.includes(city)) {
        foundCityKey = city;
        foundCoords = coords;
        break;
      }
    }
    
    if (!cityGroups[foundCityKey]) {
      cityGroups[foundCityKey] = {
        name: foundCityKey === "ulusal" ? "Ulusal / Genel" : (foundCityKey === "urfa" ? "Şanlıurfa" : foundCityKey.charAt(0).toUpperCase() + foundCityKey.slice(1)),
        coords: foundCoords,
        count: 0,
        threatCount: 0,
        sources: new Set(),
        titles: []
      };
    }
    
    cityGroups[foundCityKey].count += 1;
    if (news.threat_score > 0.5) {
      cityGroups[foundCityKey].threatCount += 1;
    }
    cityGroups[foundCityKey].sources.add(news.source);
    
    if (cityGroups[foundCityKey].titles.length < 5) {
      cityGroups[foundCityKey].titles.push(news.title);
    }
  });

  return (
    <div className="flex flex-col gap-8 mb-12">
      {tooltip && (
        <div 
          className="fixed z-50 rounded-lg shadow-2xl pointer-events-none text-sm min-w-[250px] max-w-[350px]"
          style={{ 
            top: tooltip.y + 15, left: tooltip.x + 15, 
            backgroundColor: 'var(--card-bg)', 
            border: '1px solid var(--border-color)',
            color: 'var(--foreground)',
            padding: '1rem'
          }}
        >
          <h4 className="font-bold text-base mb-2 pb-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
            {tooltip.group.name}
            {tooltip.group.threatCount > 0 && <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary-red)' }}></span>}
          </h4>
          <p className="mb-3 flex gap-4 text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            <span>Toplam: <strong style={{ color: 'var(--foreground)' }}>{tooltip.group.count}</strong></span>
            <span>Riskli: <strong style={{ color: tooltip.group.threatCount > 0 ? 'var(--primary-red)' : 'var(--success)' }}>{tooltip.group.threatCount}</strong></span>
          </p>
          <div>
            <span className="font-semibold block mb-1" style={{ color: 'var(--primary-red)' }}>Kaynak Listesi:</span>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              {Array.from(tooltip.group.sources).map((src, i) => (
                <li key={i}>{src}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Canlı Harita */}
      <div 
        className="rounded-lg p-4 md:p-6 hover:border-primary transition-colors duration-300 group w-full relative"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        <h3 className="text-base md:text-lg font-semibold mb-4 pl-3 flex justify-between items-center" style={{ borderLeft: '2px solid var(--foreground)' }}>
          Canlı İstihbarat Yoğunluk Haritası
          {highRiskCount > 0 && <span className="text-[0.6rem] md:text-xs px-2 py-1 rounded text-white animate-pulse" style={{ backgroundColor: 'var(--primary-red)' }}>Tehdit Sinyali</span>}
        </h3>
        
        <div className="h-[300px] md:h-[550px] w-full rounded-lg overflow-hidden relative transition-transform duration-500 group-hover:scale-[1.01] cursor-grab active:cursor-grabbing" style={{ backgroundColor: 'var(--background)' }}>
          
          {/* Zoom Kontrol Butonları */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button 
              onClick={handleZoomIn} 
              className="w-8 h-8 rounded flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-red)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--foreground)'; }}
            >
              +
            </button>
            <button 
              onClick={handleZoomOut} 
              className="w-8 h-8 rounded flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-red)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--foreground)'; }}
            >
              -
            </button>
          </div>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 5500 }}
            width={1200}
            height={550}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup 
              center={mapPosition.coordinates} 
              zoom={mapPosition.zoom} 
              onMoveEnd={(position) => setMapPosition(position)}
              minZoom={0.5} 
              maxZoom={8}
            >
              {/* 1. Katman: Dünya Haritası (Diğer Ülkeler) */}
              <Geographies geography="https://unpkg.com/world-atlas@2.0.2/countries-50m.json">
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="var(--map-fill)"
                      stroke="var(--map-stroke)"
                      strokeWidth={1}
                      style={{
                        default: { outline: "none", transition: "all 0.3s" },
                        hover: { fill: "var(--map-hover)", outline: "none", transition: "all 0.3s" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* 2. Katman: Sadece Türkiye'nin İl Sınırları (Üste biner) */}
              <Geographies geography="https://code.highcharts.com/mapdata/countries/tr/tr-all.topo.json">
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="var(--map-fill)"
                      stroke="var(--map-stroke)"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 0.3s" },
                        hover: { fill: "var(--map-hover)", outline: "none", transition: "all 0.3s" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Sinyaller ve İsimleri */}
              {Object.values(cityGroups).map((group, idx) => {
                const isThreat = group.threatCount > 0;
                const radius = Math.min(5 + (group.count * 3), 30);
                const pingRadius = radius * 1.5;

                return (
                  <Marker 
                    key={`marker-${idx}`} 
                    coordinates={group.coords}
                    onMouseEnter={(e) => setTooltip({ group, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip(null)}
                    onMouseMove={(e) => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                  >
                    {/* Halka animasyonları */}
                    {isThreat ? (
                      <>
                        <circle r={pingRadius} fill="var(--primary-red)" className="animate-ping opacity-50" />
                        <circle r={radius} fill="var(--dark-red)" className="opacity-80" />
                      </>
                    ) : (
                      <circle r={radius} fill="var(--success)" className="opacity-80 cursor-pointer" />
                    )}

                    {/* Şehir / Bölge Adı Yazısı */}
                    <text
                      textAnchor="middle"
                      y={radius + 16}
                      style={{ 
                        fontFamily: "system-ui", 
                        fill: "var(--foreground)", 
                        fontSize: "14px", 
                        fontWeight: "700",
                        textShadow: "var(--map-text-shadow)" 
                      }}
                    >
                      {group.name}
                    </text>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Pasta Grafik */}
        <div 
          className="w-full lg:w-1/3 rounded-lg p-4 md:p-6 hover:border-primary transition-colors duration-300"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="text-base md:text-lg font-semibold mb-4 pl-3" style={{ borderLeft: '2px solid var(--primary-red)' }}>Tehdit Dağılımı</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--foreground)' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Canlı Risk Skoru Tablosu */}
        <div 
          className="w-full lg:w-2/3 rounded-lg p-4 md:p-6 hover:border-primary transition-colors duration-300 overflow-hidden flex flex-col"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="text-base md:text-lg font-semibold mb-4 pl-3" style={{ borderLeft: '2px solid var(--primary-red)' }}>En Yüksek Riskli Haberler</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase" style={{ backgroundColor: 'var(--background)', color: 'var(--text-muted)' }}>
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Kaynak</th>
                  <th className="px-4 py-3">Haber Başlığı</th>
                  <th className="px-4 py-3 text-center">Risk Skoru</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Durum</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--foreground)' }}>
                {[...newsData]
                  .sort((a, b) => b.threat_score - a.threat_score)
                  .slice(0, 5)
                  .map((news, i) => (
                  <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{news.source}</td>
                    <td className="px-4 py-3 truncate max-w-[200px] md:max-w-xs" title={news.title}>{news.title}</td>
                    <td className="px-4 py-3 text-center">
                      <span 
                        className="px-3 py-1 rounded text-xs font-bold tracking-wider"
                        style={{ 
                          backgroundColor: news.threat_score > 0.5 ? 'var(--dark-red)' : 'var(--background)',
                          color: news.threat_score > 0.5 ? '#fff' : 'var(--success)'
                        }}
                      >
                        %{(news.threat_score * 100).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {news.threat_score > 0.5 ? (
                        <span className="animate-pulse font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--primary-red)' }}>Kritik</span>
                      ) : (
                        <span className="font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--success)' }}>Güvenli</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
