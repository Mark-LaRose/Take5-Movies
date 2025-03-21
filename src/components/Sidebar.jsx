import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import '../styles/sidebar.css';

// Generates consistent colors for favorite lists
const getStarColor = (index) => {
  const colors = [
    'deepskyblue', 'teal', 'lime', 'purple', 'indigo', 'royalblue',
    'navy', 'grey', 'gold', 'darkorange', 'red', 'magenta'
  ];
  return colors[index % colors.length];
};

function Sidebar({ isLoggedIn, onSelectFavoritesList }) {
  const { user, isAuthenticated } = useAuth0();
  const [favorites, setFavorites] = useState([]);
  const [selectedListIndex, setSelectedListIndex] = useState(null);

  useEffect(() => {
    if (isLoggedIn || isAuthenticated) { 
      console.log("User is logged in. Fetching favorites...");
      fetchFavorites();
    } else {
      console.log("User is NOT logged in.");
    }
  }, [isLoggedIn, isAuthenticated]); 

  // Fetch favorite lists from MongoDB
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping favorites fetch.");
        return;
      }

      console.log("Fetching favorites from API...");
      const response = await axios.get("https://take5-movies-backend.onrender.com/api/movies/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Favorites response:", response.data);

      if (response.data.success) {
        setFavorites(response.data.favorites);
      } else {
        console.error("Favorites API response was unsuccessful:", response.data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  // Handle renaming favorite lists
  const renameFavoriteList = async (index, newName) => {
    const updatedFavorites = [...favorites];
    updatedFavorites[index].name = newName;
    setFavorites(updatedFavorites);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping rename.");
        return;
      }

      console.log(`Renaming favorite list ${index} to '${newName}'...`);

      await axios.post(
        "https://take5-movies-backend.onrender.com/api/movies/updateFavoriteListName",
        { index, newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error renaming favorite list:", error);
    }
  };

  // Handle selecting a favorite list
  const handleSelectList = (index) => {
    if (selectedListIndex === index) {
      setSelectedListIndex(null);
      onSelectFavoritesList(null);
    } else {
      setSelectedListIndex(index);
      onSelectFavoritesList(index);
    }
  };

  return (
    <Container className="sidebar">
      <h5 className="favorites-title">Favorites</h5>
      <div className="favorites-divider"></div>

      {isLoggedIn || isAuthenticated ? (
        <div className="favorites-container">
          {favorites.length > 0 ? (
            favorites.map((list, index) => (
              <div
                key={index}
                className="favorites-button"
                onClick={() => handleSelectList(index)}
              >
                <FavoriteListItem 
                  list={list} 
                  index={index} 
                  selectedListIndex={selectedListIndex} 
                  renameFavoriteList={renameFavoriteList} 
                />
              </div>
            ))
          ) : (
            <p className="no-favorites">No favorites found.</p>
          )}
        </div>
      ) : (
        <p className="login-message">Login to access favorites.</p>
      )}

      {isAuthenticated && user && (
        <div className="user-section">
          <p className="welcome-text">Welcome!</p>
          <h5 className="user-name">{user.name}</h5>
          <p className="app-description">
            Take 5 Movies lets you browse and preview movies from all types of genres and collections. 
            From Comedy, Romance, and Action to History and Horror movies. Save all of your favorites to show your friends, 
            or refer back to later so you never forget all those memorable shows. 
            To rename your favorites lists just double-click its title. 
            Also, discover upcoming and trending content effortlessly. 
            Get the popcorn ready while you find your next favorite flick, Enjoy!
          </p>
        </div>
      )}
    </Container>
  );
}

// Favorite List Item (Handles Editing & Display)
function FavoriteListItem({ list, index, selectedListIndex, renameFavoriteList }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(list.name);

  return (
    <div className="favorites-item">
      <FaStar
        className="star-icon"
        style={{
          color: getStarColor(index),
          opacity: selectedListIndex === index ? 1 : 0.4,
          cursor: "pointer",
        }}
      />
      {isEditing ? (
        <input
          type="text"
          className="favorites-name-input"
          value={newName}
          autoFocus
          maxLength={19}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={() => {
            renameFavoriteList(index, newName);
            setIsEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              renameFavoriteList(index, newName);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <span className="favorites-name" onDoubleClick={() => setIsEditing(true)}>
          {list.name}
        </span>
      )}
    </div>
  );
}

export default Sidebar;