import React, { useState } from 'react'; 
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx"; 
import { Container, Row, Col } from 'react-bootstrap';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? '#fff' : '#1b1b1d';
  };

  return (
    <div className={isDarkMode ? 'dark-mode' : ''}>
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <Container fluid>
        <Row>
          <Col md={2}><Sidebar /></Col>
          <Col md={10}><h1>Movie Grid Goes Here</h1></Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;