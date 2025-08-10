# 🌋 JMA Earthquake Activity Viewer

A real-time web-based viewer for Japan Meteorological Agency (JMA) earthquake activity data.

## Features

- **Real-time Data**: Live feed from JMA XML API
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Auto-refresh**: Updates every 5 minutes automatically
- **Status Monitoring**: Connection status and feed health indicators
- **Statistics Dashboard**: Quick overview of current activity
- **Cache XML File**: Contains detail Information

## Quick Start

### Option 1: Direct HTML File (Simple)

1. Open `jma_viewer.html` directly in any modern web browser
2. The viewer will use a CORS proxy service to fetch JMA data
3. **Note**: May be affected by CORS policies or proxy availability

### Option 2: Local Server (Recommended)

1. **Prerequisites**: Install [Node.js](https://nodejs.org/) if you haven't already

2. **Run the server**:
   ```bash
   node jma_server.js
   ```

3. **Open in browser**: Navigate to `http://localhost:3000`

4. **Features**:
   - Reliable CORS handling
   - Direct JMA API access
   - Health check endpoint at `/health`
   - Better performance and reliability

## File Structure

```
📦 JMA Viewer
├── 📄 jma_viewer.html      # Main web application
├── 📄 jma_server.js        # Optional Node.js proxy server
└── 📄 README.md            # This file
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Data Sources

- **Primary**: [JMA XML Feed](https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml)
- **Update Frequency**: 3 min delay.
- **Data Types**: 
  - Earthquake epicenter and intensity information

### Event Types
- **Earthquakes**: Seismic activity with location and intensity data

## Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, and vanilla JavaScript
- **Backend**: Optional Node.js proxy server
- **Data Format**: XML (Atom feed) parsed client-side
- **Styling**: Modern CSS with flexbox and grid layouts

### Performance
- **Initial Load**: ~2-3 seconds
- **Data Updates**: ~1-2 seconds
- **Auto-refresh**: Every 5 minutes
- **Memory Usage**: ~10-20MB typical

### Security
- **CORS Handling**: Via proxy or external service
- **Data Validation**: XML parsing with error handling
- **Network Resilience**: Automatic retry and offline detection

## Customization

### Styling
Modify the CSS in `jma_viewer.html` to change:
- Color schemes
- Layout arrangements
- Typography
- Animation effects

### Functionality
Add new features by editing the JavaScript:
- Additional filters
- Different time ranges
- Export capabilities
- Map integration

### Server Configuration
Modify `jma_server.js` to:
- Change port number (default: 3000)
- Add authentication
- Implement caching
- Add logging

## Troubleshooting

### Common Issues

**"Connection Error" or "Failed to fetch data"**
- Check internet connection
- Try refreshing the page
- If using local server, ensure Node.js is running

**"CORS Error" when using HTML file directly**
- Use the local server instead (`node jma_server.js`)
- Or try a different browser
- Check if CORS proxy service is available

**Data not updating**
- Click the refresh button manually
- Check JMA feed status at the source
- Verify system clock is correct for timestamps

**Display issues on mobile**
- Ensure viewport meta tag is present
- Try rotating device orientation
- Clear browser cache

### Performance Issues

**Slow loading**
- Check network speed
- Try using local server instead of CORS proxy
- Reduce auto-refresh frequency in code

**High memory usage**
- Refresh the page to clear cached data
- Reduce number of displayed events in code
- Close other browser tabs

## Development

### Adding New Features

1. **Fork or copy** the project files
2. **Modify** `jma_viewer.html` for UI changes
3. **Update** `jma_server.js` for backend changes
4. **Test** thoroughly across different browsers
5. **Document** your changes

### API Endpoints (Local Server)

- `GET /` - Main application
- `GET /api/jma` - JMA data proxy
- `GET /health` - Server health check

### Contributing

Contributions are welcome! Areas for improvement:
- Map visualization integration
- Historical data storage
- Push notifications for alerts
- Multi-language support
- Advanced filtering options

## License

This project is for educational and informational purposes. JMA data is provided by the Japan Meteorological Agency under their terms of use.

## Acknowledgments

- **Japan Meteorological Agency** for providing real-time data
- **Modern web standards** for enabling client-side XML processing
- **Open source community** for CORS proxy services

---

For questions or issues, please check the troubleshooting section above or review the code comments in the HTML and JavaScript files.



