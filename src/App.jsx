import React, { useState } from 'react'; 
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx"; 
import { Container, Row, Col } from 'react-bootstrap';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? '#fff' : '#1b1b1d';
  };

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className={isDarkMode ? 'dark-mode' : ''}>
      {/* Pass login state & functions to Header */}
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} isLoggedIn={isLoggedIn} toggleLogin={toggleLogin} />
      <Container fluid>
        <Row>
          {/* Pass login state to Sidebar */}
          <Col md={2}><Sidebar isLoggedIn={isLoggedIn} /></Col>
          <Col md={10}><h1></h1></Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;