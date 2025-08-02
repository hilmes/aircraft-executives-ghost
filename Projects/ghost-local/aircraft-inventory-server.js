/**
 * Executive Aircraft Inventory Server
 * Strategic Aviation Intelligence Backend
 * 
 * Handles real-time data integration, business intelligence calculations,
 * and API endpoints for the interactive aircraft inventory interface.
 */

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');

class AircraftInventoryServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.wss = null;
        this.port = process.env.PORT || 3000;
        
        // In-memory data store (in production, this would be a proper database)
        this.aircraftData = {
            'gulfstream-g700': {
                id: 'gulfstream-g700',
                name: 'Gulfstream G700',
                manufacturer: 'Gulfstream',
                category: 'Ultra Long Range',
                performance: {
                    range: 7500,
                    speed: 0.925,
                    ceiling: 51000,
                    takeoff: 6250,
                    landing: 2500
                },
                cabin: {
                    passengers: 19,
                    length: 56.9,
                    width: 8.2,
                    height: 6.3,
                    baggage: 195
                },
                economics: {
                    listPrice: 75000000,
                    operatingCostPerHour: 5200,
                    fuelConsumption: 348,
                    depreciationRate: 0.085,
                    resaleValue: 0.68
                },
                market: {
                    availability: 'Limited',
                    deliveryTime: '24-36 months',
                    priceHistory: [72, 73, 74, 75, 74, 75, 76, 75, 74, 75, 76, 75],
                    demandScore: 8.7,
                    marketTrend: 'Increasing'
                },
                capabilities: {
                    missions: ['executive-travel', 'global-reach'],
                    airportCompatibility: 5200,
                    weatherCapability: 'All-weather',
                    internationalCompliance: true
                }
            },
            'bombardier-global-7500': {
                id: 'bombardier-global-7500',
                name: 'Bombardier Global 7500',
                manufacturer: 'Bombardier',
                category: 'Ultra Long Range',
                performance: {
                    range: 7700,
                    speed: 0.925,
                    ceiling: 51000,
                    takeoff: 5800,
                    landing: 2400
                },
                cabin: {
                    passengers: 17,
                    length: 54.8,
                    width: 8.0,
                    height: 6.2,
                    baggage: 180
                },
                economics: {
                    listPrice: 73000000,
                    operatingCostPerHour: 4950,
                    fuelConsumption: 340,
                    depreciationRate: 0.082,
                    resaleValue: 0.70
                },
                market: {
                    availability: 'Available',
                    deliveryTime: '18-24 months',
                    priceHistory: [70, 71, 72, 73, 72, 73, 74, 73, 72, 73, 74, 73],
                    demandScore: 8.4,
                    marketTrend: 'Stable'
                },
                capabilities: {
                    missions: ['executive-travel', 'global-reach', 'regional-mobility'],
                    airportCompatibility: 5000,
                    weatherCapability: 'All-weather',
                    internationalCompliance: true
                }
            },
            'dassault-falcon-7x': {
                id: 'dassault-falcon-7x',
                name: 'Dassault Falcon 7X',
                manufacturer: 'Dassault',
                category: 'Long Range',
                performance: {
                    range: 5950,
                    speed: 0.90,
                    ceiling: 51000,
                    takeoff: 5700,
                    landing: 2070
                },
                cabin: {
                    passengers: 16,
                    length: 39.0,
                    width: 7.7,
                    height: 6.2,
                    baggage: 140
                },
                economics: {
                    listPrice: 54000000,
                    operatingCostPerHour: 4200,
                    fuelConsumption: 280,
                    depreciationRate: 0.078,
                    resaleValue: 0.72
                },
                market: {
                    availability: 'Available',
                    deliveryTime: '12-18 months',
                    priceHistory: [52, 53, 54, 55, 54, 55, 56, 55, 54, 55, 56, 54],
                    demandScore: 7.9,
                    marketTrend: 'Stable'
                },
                capabilities: {
                    missions: ['regional-mobility', 'rapid-response', 'executive-travel'],
                    airportCompatibility: 4000,
                    weatherCapability: 'All-weather',
                    internationalCompliance: true
                }
            }
        };
        
        this.marketData = {
            industryTrends: {
                marketGrowth: 0.045,
                demandIndex: 127,
                supplyConstraints: 'High',
                pricingPressure: 'Upward'
            },
            economicFactors: {
                interestRates: 0.055,
                fuelPrices: 4.82,
                exchangeRates: { EUR: 1.08, GBP: 1.26, JPY: 0.0067 },
                gdpGrowth: 0.024
            }
        };
        
        this.routeDatabase = {
            airports: {
                'KTEB': { name: 'Teterboro', lat: 40.8501, lon: -74.0606, runwayLength: 7000 },
                'EGLL': { name: 'London Heathrow', lat: 51.4700, lon: -0.4543, runwayLength: 12799 },
                'LFPB': { name: 'Paris Le Bourget', lat: 48.9694, lon: 2.4414, runwayLength: 6562 },
                'KJFK': { name: 'JFK International', lat: 40.6413, lon: -73.7781, runwayLength: 14511 },
                'KLAS': { name: 'Las Vegas McCarran', lat: 36.0840, lon: -115.1537, runwayLength: 14512 }
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.startPeriodicUpdates();
    }
    
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname)));
        
        // Request logging
        this.app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
            });
            next();
        });
    }
    
    setupRoutes() {
        // Serve the main interface
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'aircraft-inventory-interface.html'));
        });
        
        // Aircraft data endpoints
        this.app.get('/api/aircraft', (req, res) => {
            const { mission, category, priceRange } = req.query;
            let aircraft = Object.values(this.aircraftData);
            
            // Filter by mission
            if (mission) {
                aircraft = aircraft.filter(a => a.capabilities.missions.includes(mission));
            }
            
            // Filter by category
            if (category) {
                aircraft = aircraft.filter(a => a.category === category);
            }
            
            // Filter by price range
            if (priceRange) {
                const [min, max] = priceRange.split('-').map(Number);
                aircraft = aircraft.filter(a => 
                    a.economics.listPrice >= min * 1000000 && 
                    a.economics.listPrice <= max * 1000000
                );
            }
            
            res.json({
                success: true,
                data: aircraft,
                count: aircraft.length
            });
        });
        
        this.app.get('/api/aircraft/:id', (req, res) => {
            const aircraft = this.aircraftData[req.params.id];
            if (!aircraft) {
                return res.status(404).json({ success: false, error: 'Aircraft not found' });
            }
            
            res.json({
                success: true,
                data: aircraft
            });
        });
        
        // Business intelligence endpoints
        this.app.post('/api/calculate-roi', (req, res) => {
            const { aircraftId, annualHours, charterRate, timeValue, utilizationYears } = req.body;
            const aircraft = this.aircraftData[aircraftId];
            
            if (!aircraft) {
                return res.status(404).json({ success: false, error: 'Aircraft not found' });
            }
            
            const roi = this.calculateROI(aircraft, {
                annualHours: annualHours || 250,
                charterRate: charterRate || 8500,
                timeValue: timeValue || 2500,
                utilizationYears: utilizationYears || 5
            });
            
            res.json({
                success: true,
                data: roi
            });
        });
        
        this.app.get('/api/market-intelligence', (req, res) => {
            const { aircraftId, timeframe } = req.query;
            
            let data = { ...this.marketData };
            
            if (aircraftId && this.aircraftData[aircraftId]) {
                data.aircraftSpecific = this.aircraftData[aircraftId].market;
            }
            
            res.json({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            });
        });
        
        // Route planning endpoints
        this.app.post('/api/plan-route', (req, res) => {
            const { departure, destination, aircraftId, passengers, cargo } = req.body;
            
            const aircraft = this.aircraftData[aircraftId];
            if (!aircraft) {
                return res.status(404).json({ success: false, error: 'Aircraft not found' });
            }
            
            const route = this.calculateRoute(departure, destination, aircraft, {
                passengers: passengers || 1,
                cargo: cargo || 0
            });
            
            res.json({
                success: true,
                data: route
            });
        });
        
        // Market comparison endpoint
        this.app.get('/api/compare', (req, res) => {
            const { aircraftIds } = req.query;
            const ids = aircraftIds ? aircraftIds.split(',') : Object.keys(this.aircraftData);
            
            const comparison = ids.map(id => {
                const aircraft = this.aircraftData[id];
                if (!aircraft) return null;
                
                return {
                    id: aircraft.id,
                    name: aircraft.name,
                    performance: aircraft.performance,
                    economics: aircraft.economics,
                    market: aircraft.market,
                    competitiveScore: this.calculateCompetitiveScore(aircraft)
                };
            }).filter(Boolean);
            
            res.json({
                success: true,
                data: comparison
            });
        });
        
        // Real-time data endpoint
        this.app.get('/api/realtime/:aircraftId', (req, res) => {
            const aircraft = this.aircraftData[req.params.aircraftId];
            if (!aircraft) {
                return res.status(404).json({ success: false, error: 'Aircraft not found' });
            }
            
            // Simulate real-time market fluctuations
            const realtimeData = {
                currentPrice: aircraft.economics.listPrice * (1 + (Math.random() - 0.5) * 0.02),
                availability: Math.random() > 0.3 ? 'Available' : 'Limited',
                demandScore: aircraft.market.demandScore + (Math.random() - 0.5) * 0.5,
                priceChange24h: (Math.random() - 0.5) * 0.03,
                marketActivity: Math.random() > 0.5 ? 'High' : 'Moderate',
                timestamp: new Date().toISOString()
            };
            
            res.json({
                success: true,
                data: realtimeData
            });
        });
        
        // Analytics endpoint
        this.app.get('/api/analytics/mission-fit', (req, res) => {
            const { mission, requirements } = req.query;
            
            const analysis = Object.values(this.aircraftData).map(aircraft => {
                const fitScore = this.calculateMissionFit(aircraft, mission, requirements);
                return {
                    aircraftId: aircraft.id,
                    name: aircraft.name,
                    fitScore: fitScore,
                    strengths: this.identifyStrengths(aircraft, mission),
                    considerations: this.identifyConsiderations(aircraft, mission)
                };
            }).sort((a, b) => b.fitScore - a.fitScore);
            
            res.json({
                success: true,
                data: analysis
            });
        });
    }
    
    setupWebSocket() {
        this.server = this.app.listen(this.port, () => {
            console.log(`🚀 Aircraft Inventory Server running on port ${this.port}`);
            console.log(`📊 Strategic Aviation Intelligence Dashboard: http://localhost:${this.port}`);
        });
        
        this.wss = new WebSocket.Server({ server: this.server });
        
        this.wss.on('connection', (ws) => {
            console.log('📡 Client connected to real-time data stream');
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleWebSocketMessage(ws, data);
                } catch (error) {
                    console.error('WebSocket message error:', error);
                }
            });
            
            ws.on('close', () => {
                console.log('📡 Client disconnected from real-time data stream');
            });
            
            // Send initial data
            ws.send(JSON.stringify({
                type: 'connected',
                timestamp: new Date().toISOString()
            }));
        });
    }
    
    handleWebSocketMessage(ws, data) {
        switch (data.type) {
            case 'subscribe_aircraft':
                ws.aircraftSubscription = data.aircraftId;
                break;
            case 'subscribe_market':
                ws.marketSubscription = true;
                break;
            case 'unsubscribe':
                delete ws.aircraftSubscription;
                delete ws.marketSubscription;
                break;
        }
    }
    
    startPeriodicUpdates() {
        // Update market data every 30 seconds
        setInterval(() => {
            this.updateMarketData();
            this.broadcastMarketUpdate();
        }, 30000);
        
        // Update aircraft availability every 5 minutes
        setInterval(() => {
            this.updateAircraftAvailability();
            this.broadcastAircraftUpdates();
        }, 300000);
    }
    
    updateMarketData() {
        // Simulate market fluctuations
        this.marketData.industryTrends.demandIndex += (Math.random() - 0.5) * 2;
        this.marketData.economicFactors.fuelPrices += (Math.random() - 0.5) * 0.1;
        
        // Update aircraft-specific market data
        Object.values(this.aircraftData).forEach(aircraft => {
            aircraft.market.demandScore += (Math.random() - 0.5) * 0.2;
            aircraft.market.demandScore = Math.max(5, Math.min(10, aircraft.market.demandScore));
            
            // Update price history
            const lastPrice = aircraft.market.priceHistory[aircraft.market.priceHistory.length - 1];
            const newPrice = lastPrice + (Math.random() - 0.5) * 2;
            aircraft.market.priceHistory.push(Math.max(0, newPrice));
            
            if (aircraft.market.priceHistory.length > 24) {
                aircraft.market.priceHistory.shift();
            }
        });
    }
    
    updateAircraftAvailability() {
        Object.values(this.aircraftData).forEach(aircraft => {
            // Randomly update availability
            if (Math.random() > 0.8) {
                aircraft.market.availability = aircraft.market.availability === 'Available' ? 'Limited' : 'Available';
            }
        });
    }
    
    broadcastMarketUpdate() {
        if (!this.wss) return;
        
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.marketSubscription) {
                client.send(JSON.stringify({
                    type: 'market_update',
                    data: this.marketData,
                    timestamp: new Date().toISOString()
                }));
            }
        });
    }
    
    broadcastAircraftUpdates() {
        if (!this.wss) return;
        
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.aircraftSubscription) {
                const aircraft = this.aircraftData[client.aircraftSubscription];
                if (aircraft) {
                    client.send(JSON.stringify({
                        type: 'aircraft_update',
                        aircraftId: client.aircraftSubscription,
                        data: aircraft,
                        timestamp: new Date().toISOString()
                    }));
                }
            }
        });
    }
    
    calculateROI(aircraft, params) {
        const {
            annualHours,
            charterRate,
            timeValue,
            utilizationYears
        } = params;
        
        // Annual operating costs
        const annualOperatingCost = annualHours * aircraft.economics.operatingCostPerHour;
        
        // Charter cost avoidance
        const annualCharterCost = annualHours * charterRate;
        
        // Time value savings (assuming 30% time savings over commercial)
        const timeValueSavings = annualHours * timeValue * 0.3;
        
        // Total annual cost avoidance
        const annualCostAvoidance = annualCharterCost + timeValueSavings;
        
        // Net annual benefit
        const netAnnualBenefit = annualCostAvoidance - annualOperatingCost;
        
        // Total cost of ownership
        const acquisitionCost = aircraft.economics.listPrice;
        const totalOperatingCost = annualOperatingCost * utilizationYears;
        const depreciation = acquisitionCost * aircraft.economics.depreciationRate * utilizationYears;
        const totalCostOfOwnership = acquisitionCost + totalOperatingCost + depreciation;
        
        // ROI calculation
        const totalBenefit = annualCostAvoidance * utilizationYears;
        const roi = ((totalBenefit - totalCostOfOwnership) / totalCostOfOwnership) * 100;
        
        // Payback period
        const paybackPeriod = acquisitionCost / netAnnualBenefit;
        
        return {
            annualCostAvoidance,
            netAnnualBenefit,
            totalCostOfOwnership,
            roi,
            paybackPeriod,
            breakEvenHours: acquisitionCost / (charterRate - aircraft.economics.operatingCostPerHour),
            residualValue: acquisitionCost * aircraft.economics.resaleValue,
            calculations: {
                annualOperatingCost,
                annualCharterCost,
                timeValueSavings,
                acquisitionCost,
                depreciation
            }
        };
    }
    
    calculateRoute(departure, destination, aircraft, options) {
        const depAirport = this.routeDatabase.airports[departure];
        const destAirport = this.routeDatabase.airports[destination];
        
        if (!depAirport || !destAirport) {
            throw new Error('Airport not found');
        }
        
        // Calculate great circle distance
        const distance = this.calculateDistance(
            depAirport.lat, depAirport.lon,
            destAirport.lat, destAirport.lon
        );
        
        // Flight time calculation
        const groundSpeed = aircraft.performance.speed * 520; // Convert Mach to knots (approximate)
        const flightTime = distance / groundSpeed;
        
        // Fuel calculation
        const fuelRequired = distance * (aircraft.economics.fuelConsumption / aircraft.performance.range);
        
        // Operating cost
        const operatingCost = flightTime * aircraft.economics.operatingCostPerHour;
        
        // Runway compatibility
        const departureCompatible = depAirport.runwayLength >= aircraft.performance.takeoff;
        const arrivalCompatible = destAirport.runwayLength >= aircraft.performance.landing;
        
        // Fuel stops required
        const fuelStopsRequired = distance > aircraft.performance.range ? 1 : 0;
        
        return {
            departure: depAirport,
            destination: destAirport,
            distance: Math.round(distance),
            flightTime: {
                hours: Math.floor(flightTime),
                minutes: Math.round((flightTime % 1) * 60),
                decimal: flightTime
            },
            fuel: {
                required: Math.round(fuelRequired),
                cost: Math.round(fuelRequired * 4.82) // Current fuel price
            },
            operatingCost: Math.round(operatingCost),
            compatibility: {
                departure: departureCompatible,
                arrival: arrivalCompatible,
                overall: departureCompatible && arrivalCompatible
            },
            fuelStops: fuelStopsRequired,
            alternateRoutes: this.suggestAlternateRoutes(departure, destination, aircraft)
        };
    }
    
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3440.065; // Earth's radius in nautical miles
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    suggestAlternateRoutes(departure, destination, aircraft) {
        // In a real implementation, this would suggest alternate airports
        // and routing options based on weather, traffic, costs, etc.
        return [];
    }
    
    calculateCompetitiveScore(aircraft) {
        // Multi-factor scoring algorithm
        const performanceScore = (aircraft.performance.range / 8000) * 25 + 
                               (aircraft.performance.speed / 1.0) * 25;
        
        const economicsScore = (1 - (aircraft.economics.operatingCostPerHour / 6000)) * 25;
        
        const marketScore = (aircraft.market.demandScore / 10) * 25;
        
        return Math.round(performanceScore + economicsScore + marketScore);
    }
    
    calculateMissionFit(aircraft, mission, requirements) {
        let score = 0;
        
        // Base mission compatibility
        if (aircraft.capabilities.missions.includes(mission)) {
            score += 40;
        }
        
        // Performance factors
        switch (mission) {
            case 'executive-travel':
                score += Math.min(30, (aircraft.performance.speed / 0.95) * 30);
                score += Math.min(30, (aircraft.performance.range / 6000) * 30);
                break;
            case 'global-reach':
                score += Math.min(50, (aircraft.performance.range / 8000) * 50);
                score += Math.min(20, aircraft.cabin.passengers >= 12 ? 20 : aircraft.cabin.passengers);
                break;
            case 'regional-mobility':
                score += Math.min(30, aircraft.capabilities.airportCompatibility <= 5000 ? 30 : 15);
                score += Math.min(30, (1 - aircraft.economics.operatingCostPerHour / 6000) * 30);
                break;
            case 'rapid-response':
                score += Math.min(30, aircraft.market.availability === 'Available' ? 30 : 15);
                score += Math.min(30, aircraft.performance.takeoff <= 5000 ? 30 : 15);
                break;
        }
        
        return Math.min(100, Math.round(score));
    }
    
    identifyStrengths(aircraft, mission) {
        const strengths = [];
        
        if (aircraft.performance.range > 7000) {
            strengths.push('Exceptional range capability');
        }
        
        if (aircraft.performance.speed >= 0.92) {
            strengths.push('High-speed performance');
        }
        
        if (aircraft.economics.operatingCostPerHour < 5000) {
            strengths.push('Cost-efficient operations');
        }
        
        if (aircraft.market.availability === 'Available') {
            strengths.push('Immediate availability');
        }
        
        if (aircraft.cabin.passengers >= 16) {
            strengths.push('Large cabin capacity');
        }
        
        return strengths.slice(0, 3); // Return top 3 strengths
    }
    
    identifyConsiderations(aircraft, mission) {
        const considerations = [];
        
        if (aircraft.market.deliveryTime.includes('24-36')) {
            considerations.push('Extended delivery timeline');
        }
        
        if (aircraft.economics.operatingCostPerHour > 5000) {
            considerations.push('Higher operating costs');
        }
        
        if (aircraft.market.availability === 'Limited') {
            considerations.push('Limited market availability');
        }
        
        if (aircraft.performance.takeoff > 6000) {
            considerations.push('Requires longer runways');
        }
        
        return considerations.slice(0, 2); // Return top 2 considerations
    }
    
    // Method to handle individual requests (for unified server)
    handleRequest(req, res) {
        // Create a minimal Express-like app for this request
        const app = {
            _routes: new Map(),
            get: (path, handler) => app._routes.set(`GET:${path}`, handler),
            post: (path, handler) => app._routes.set(`POST:${path}`, handler),
            handle: (req, res) => {
                const key = `${req.method}:${req.url.split('?')[0]}`;
                const handler = app._routes.get(key);
                
                if (handler) {
                    // Add query parsing
                    const url = require('url');
                    const parsedUrl = url.parse(req.url, true);
                    req.query = parsedUrl.query;
                    
                    // Add JSON body parsing for POST requests
                    if (req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => body += chunk);
                        req.on('end', () => {
                            try {
                                req.body = JSON.parse(body);
                            } catch (e) {
                                req.body = {};
                            }
                            handler(req, res);
                        });
                    } else {
                        handler(req, res);
                    }
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: false, error: 'Not found' }));
                }
            }
        };
        
        // Set up routes
        app.get('/api/aircraft', (req, res) => {
            const { mission, category, priceRange } = req.query;
            let aircraft = Object.values(this.aircraftData);
            
            if (mission) {
                aircraft = aircraft.filter(a => a.capabilities.missions.includes(mission));
            }
            
            if (category) {
                aircraft = aircraft.filter(a => a.category === category);
            }
            
            if (priceRange) {
                const [min, max] = priceRange.split('-').map(Number);
                aircraft = aircraft.filter(a => 
                    a.economics.listPrice >= min * 1000000 && 
                    a.economics.listPrice <= max * 1000000
                );
            }
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                success: true,
                data: aircraft,
                count: aircraft.length
            }));
        });
        
        app.post('/api/calculate-roi', (req, res) => {
            const { aircraftId, annualHours, charterRate, timeValue, utilizationYears } = req.body;
            const aircraft = this.aircraftData[aircraftId];
            
            if (!aircraft) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: false, error: 'Aircraft not found' }));
            }
            
            const roi = this.calculateROI(aircraft, {
                annualHours: annualHours || 250,
                charterRate: charterRate || 8500,
                timeValue: timeValue || 2500,
                utilizationYears: utilizationYears || 5
            });
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                success: true,
                data: roi
            }));
        });
        
        app.get('/api/market-intelligence', (req, res) => {
            const { aircraftId, timeframe } = req.query;
            
            let data = { ...this.marketData };
            
            if (aircraftId && this.aircraftData[aircraftId]) {
                data.aircraftSpecific = this.aircraftData[aircraftId].market;
            }
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            }));
        });
        
        app.post('/api/plan-route', (req, res) => {
            const { departure, destination, aircraftId, passengers, cargo } = req.body;
            
            const aircraft = this.aircraftData[aircraftId];
            if (!aircraft) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: false, error: 'Aircraft not found' }));
            }
            
            try {
                const route = this.calculateRoute(departure, destination, aircraft, {
                    passengers: passengers || 1,
                    cargo: cargo || 0
                });
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    success: true,
                    data: route
                }));
            } catch (error) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));
            }
        });
        
        app.get('/api/compare', (req, res) => {
            const { aircraftIds } = req.query;
            const ids = aircraftIds ? aircraftIds.split(',') : Object.keys(this.aircraftData);
            
            const comparison = ids.map(id => {
                const aircraft = this.aircraftData[id];
                if (!aircraft) return null;
                
                return {
                    id: aircraft.id,
                    name: aircraft.name,
                    performance: aircraft.performance,
                    economics: aircraft.economics,
                    market: aircraft.market,
                    competitiveScore: this.calculateCompetitiveScore(aircraft)
                };
            }).filter(Boolean);
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                success: true,
                data: comparison
            }));
        });
        
        // Handle the request
        app.handle(req, res);
    }
}

// Only initialize server if this file is run directly
if (require.main === module) {
    const server = new AircraftInventoryServer();
}

module.exports = AircraftInventoryServer;