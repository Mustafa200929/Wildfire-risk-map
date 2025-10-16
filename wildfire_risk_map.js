var startDate="2010-01-01"
var endDate="2020-01-01"
// Import the MODIS Land Cover and Land Surface Temperature datasets
var vegetation = ee.ImageCollection('MODIS/061/MCD12Q1').filterDate(startDate, endDate).select("LC_Type1");
var temperature = ee.ImageCollection('MODIS/061/MOD11A1').filterDate(startDate, endDate).select('LST_Day_1km');

// Import the UCSB-CHG/CHIRPS/DAILY dataset for precipitation
var precipitation = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY').filterDate(startDate, endDate).select('precipitation');

// Import the NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG dataset for lightning
var lightning = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG').filterDate(startDate, endDate).select('avg_rad');

// Convert the temperature from Kelvin to Celsius
temperature = temperature.map(function(image) {
  return image.multiply(0.02).subtract(273.15);
});

// Identify forested areas 
var forest = vegetation.mean().lte(5);

// Identify areas with high temperature 
var highTempAreas = temperature.mean().gt(30);

// Identify areas with low precipitation 
var dryAreas = precipitation.mean().lt(10); // 

// Identify areas with frequent lightning 
var highLightningAreas = lightning.mean().gt(3); 

// Estimate wildfire risk as the intersection of all these conditions
var wildfireRisk = forest.add(highTempAreas).add(dryAreas).add(highLightningAreas);

// Normalize the risk to a scale of 0 to 100%
var wildfireRiskNormalized = wildfireRisk.divide(4).multiply(100);

// Define a color palette for the wildfire risk
var wildfireRiskPalette = ['green', 'yellow', 'orange', 'red'];

// Add the layers to the map
Map.addLayer(wildfireRiskNormalized, {min: 0, max: 100, palette: wildfireRiskPalette}, 'Wildfire Risk Percentage');







// Create a UI panel for the color legend
var legend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px'
  }
});

// Create a title for the legend
var legendTitle = ui.Label({
  value: 'Wildfire Risk Percentage',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});

// Add the title to the legend
legend.add(legendTitle);

// Create a function to add a color and value to the legend
var makeColorBar = function(palette) {
  var colorBar = ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0),
    params: {
      bbox: [0, 0, 1, 0.1],
      dimensions: '100x10',
      format: 'png',
      min: 0,
      max: 1,
      palette: palette,
    },
    style: {stretch: 'horizontal', margin: '0 8px', maxHeight: '24px'},
  });
  return colorBar;
};

legend.add(makeColorBar(wildfireRiskPalette));

// Create labels for the legend
var legendLabels = ui.Panel({
  widgets: [
    ui.Label('0%'),
    ui.Label({
      value: '25%',
      style: {textAlign: 'center', stretch: 'horizontal'}
    }),
    ui.Label({
      value: '50%',
      style: {textAlign: 'center', stretch: 'horizontal'}
    }),
    ui.Label({
      value: '75%',
      style: {textAlign: 'center', stretch: 'horizontal'}
    }),
    ui.Label({
      value: '100%',
      style: {textAlign: 'right', stretch: 'horizontal'}
    })
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});

legend.add(legendLabels);

// Add the legend to the map
Map.add(legend);





