import React from 'react';
import { ListGroup, Button, Container } from 'react-bootstrap';

function Sidebar() {
  return (
    <Container className="bg-light p-3 sidebar">
      <h5>My Favorites</h5>
      <ListGroup>
        <ListGroup.Item>⭐ List 1</ListGroup.Item>
        <ListGroup.Item>⭐ List 2</ListGroup.Item>
        <ListGroup.Item>⭐ List 3</ListGroup.Item>
        <ListGroup.Item>⭐ List 4</ListGroup.Item>
      </ListGroup>
    </Container>
  );
}

export default Sidebar;