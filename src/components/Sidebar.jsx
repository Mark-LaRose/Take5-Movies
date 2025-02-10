import React, { useState } from 'react';
import { ListGroup, Container } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa'; // Importing Star Icon
import '../styles/sidebar.css';

// Assigns different colors for stars
function getStarColor(index) {
  const colors = ['deepskyblue', 'teal', 'lime', 'purple', 'indigo', 'royalblue', 'navy', 'grey', 'gold', 'darkorange', 'red', 'magenta'];
  return colors[index % colors.length];
}

// Initialize default lists
const defaultLists = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: `Favorites List ${index + 1}`,
  color: getStarColor(index), 
}));

function Sidebar({ isLoggedIn }) {
  const [favorites, setFavorites] = useState(defaultLists);

  return (
    <Container className="sidebar">
      <h5 className="favorites-title">Favorites</h5>
      <div className="favorites-divider"></div>

      {isLoggedIn ? (
        <ListGroup>
          {favorites.map((list) => (
            <FavoriteListItem
              key={list.id}
              list={list}
              setFavorites={setFavorites}
              favorites={favorites}
            />
          ))}
        </ListGroup>
      ) : (
        <p className="login-message">
          Login <br />
          to <br />
          access <br />
          favorites.
        </p>
      )}
    </Container>
  );
}

// Component for individual favorite list items
function FavoriteListItem({ list, setFavorites, favorites }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(list.name);

  // Handle renaming
  const handleRename = () => {
    setFavorites(favorites.map(fav => fav.id === list.id ? { ...fav, name: inputValue } : fav));
    setIsEditing(false);
  };

  return (
    <ListGroup.Item className="favorites-item">
      {/* Using FaStar Icon with dynamic color */}
      <FaStar className="star-icon" style={{ color: list.color }} />

      {isEditing ? (
        <input
          type="text"
          className="favorites-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleRename}
          autoFocus
          maxLength={18}
        />
      ) : (
        <span className="favorites-name" onClick={() => setIsEditing(true)}>
          {list.name}
        </span>
      )}
    </ListGroup.Item>
  );
}

export default Sidebar;