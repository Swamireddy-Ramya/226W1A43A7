import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [urls, setUrls] = useState([
    { id: uuidv4(), original: "", expiry: "", shortCode: "", error: "" },
  ]);
  const [results, setResults] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const handleAddField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { id: uuidv4(), original: "", expiry: "", shortCode: "", error: "" }]);
    } else {
      setAlert({ open: true, message: "Max 5 URLs allowed", severity: "warning" });
    }
  };

  const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const generateShortCode = () => Math.random().toString(36).substring(2, 8);

  const handleShorten = () => {
    let valid = true;
    const usedShortCodes = new Set(results.map((r) => r.shortCode));
    const newResults = urls.map((entry) => {
      const { original, expiry, shortCode } = entry;
      let finalShort = shortCode || generateShortCode();
      while (usedShortCodes.has(finalShort)) {
        finalShort = generateShortCode();
      }
      usedShortCodes.add(finalShort);

      if (!validateURL(original)) {
        valid = false;
        entry.error = "Invalid URL";
        return null;
      }

      const expiryTime = expiry ? new Date(Date.now() + expiry * 60000) : "Never";
      return {
        id: entry.id,
        original,
        shortCode: finalShort,
        expiry: expiryTime,
        createdAt: new Date().toLocaleString(),
        clicks: []
      };
    });

    if (valid) {
      setResults([...results, ...newResults.filter(Boolean)]);
      setUrls([{ id: uuidv4(), original: "", expiry: "", shortCode: "", error: "" }]);
      setAlert({ open: true, message: "URLs shortened successfully!", severity: "success" });
    } else {
      setAlert({ open: true, message: "Please correct the errors.", severity: "error" });
    }
  };

  const handleTabChange = (e, newIndex) => setTabIndex(newIndex);

  const simulateClick = (shortCode) => {
    const newResults = results.map((r) => {
      if (r.shortCode === shortCode) {
        return {
          ...r,
          clicks: [
            ...r.clicks,
            {
              timestamp: new Date().toLocaleString(),
              source: "localhost",
              location: "India",
            },
          ],
        };
      }
      return r;
    });
    setResults(newResults);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        URL Shortener Web App
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="Shorten URL" />
        <Tab label="Statistics" />
      </Tabs>

      <Box hidden={tabIndex !== 0} mt={3}>
        {urls.map((entry, index) => (
          <Grid container spacing={2} key={entry.id} marginBottom={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Original URL"
                value={entry.original}
                onChange={(e) => handleChange(index, "original", e.target.value)}
                error={Boolean(entry.error)}
                helperText={entry.error || ""}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Expiry (min)"
                value={entry.expiry}
                onChange={(e) => handleChange(index, "expiry", e.target.value)}
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Custom Short Code"
                value={entry.shortCode}
                onChange={(e) => handleChange(index, "shortCode", e.target.value)}
              />
            </Grid>
          </Grid>
        ))}

        <Button variant="outlined" onClick={handleAddField} sx={{ marginRight: 2 }}>
          + Add URL
        </Button>
        <Button variant="contained" onClick={handleShorten}>
          Shorten URLs
        </Button>

        <Typography variant="h5" marginTop={4} gutterBottom>
          Shortened URLs
        </Typography>

        {results.map((res) => (
          <Card key={res.shortCode} sx={{ marginBottom: 2 }}>
            <CardContent>
              <Typography>Original: {res.original}</Typography>
              <Typography>Short Code: {res.shortCode}</Typography>
              <Typography>Expires: {res.expiry.toString()}</Typography>
              <Typography>Created: {res.createdAt}</Typography>
              <Button variant="outlined" onClick={() => simulateClick(res.shortCode)}>
                Simulate Click
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box hidden={tabIndex !== 1} mt={3}>
        <Typography variant="h5" gutterBottom>
          Statistics
        </Typography>
        {results.map((res) => (
          <Card key={res.shortCode} sx={{ marginBottom: 2 }}>
            <CardContent>
              <Typography>Short Code: {res.shortCode}</Typography>
              <Typography>Clicks: {res.clicks.length}</Typography>
              <Typography>Expiry: {res.expiry.toString()}</Typography>
              <Typography variant="subtitle1">Click Details:</Typography>
              {res.clicks.length === 0 ? (
                <Typography>No clicks recorded yet.</Typography>
              ) : (
                res.clicks.map((click, index) => (
                  <Typography key={index}>
                    Time: {click.timestamp}, Source: {click.source}, Location: {click.location}
                  </Typography>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default App;